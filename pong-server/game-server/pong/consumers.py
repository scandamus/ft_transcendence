import json
import asyncio
import logging

from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from datetime import datetime as dt
from .game_logic import Block, Paddle, Ball
from .consts import (CANVAS_WIDTH, CANVAS_HEIGHT, PADDLE_LENGTH, PADDLE_THICKNESS, PADDING,
                     BALL_SIZE, CANVAS_WIDTH_MULTI, CANVAS_HEIGHT_MULTI, CORNER_BLOCK_THICKNESS, CORNER_BLOCK_SIZE)
from django.contrib.auth.models import User
from rest_framework_simplejwt.backends import TokenBackend
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.conf import settings
from .api_access import get_match_from_api, patch_match_to_api, update_match_status_to_ongoing

#from .models import Match

logger = logging.getLogger(__name__)


# 非同期通信を実現したいのでAsyncWebsocketConsumerクラスを継承
class PongConsumer(AsyncWebsocketConsumer):
    players_ids = {}
    PADDLE_SPEED = 7
    TIME_LIMIT_SEC = 180

    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.match_id = None
        self.room_group_name = None
        self.players_id = None
        self.username = None
        self.player_name = None
        self.scheduled_task = None
        self.is_tournament = False
        self.start_game_timer_task = None
        self.game_timer_task = None
        self.right_paddle = None
        self.left_paddle = None
        self.ball = None
        self.reset_game_data()
        self.game_continue = False
        self.up_pressed = False
        self.down_pressed = False

    async def connect(self):
        try:
            # URLからmatch_idを取得
            self.match_id = self.scope['url_route']['kwargs'].get('match_id')
            if not self.match_id:
                logger.error(f'Match ID is missing in URL path: {self.match_id}')
                await self.close(code=4100)
                return
            logger.info('match_id exists')
            await self.accept()

        except Exception as e:
            logger.error(f'Error connecting: {e}')
            await self.close(code=1011)

    async def disconnect(self, close_code):
        try:
            # Leave room group
            if self.match_id in self.players_ids and self.players_id in self.players_ids[self.match_id]:
                logger.info(f'remove: players_ids[{self.match_id}]: {self.players_id}')
                self.players_ids[self.match_id].remove(self.players_id)
                if not self.players_ids[self.match_id]:
                    logger.info(f'del: {self.players_ids}[{self.match_id}]')
                    del self.players_ids[self.match_id]
                else:
                    if self.scheduled_task is not None:
                        await self.cancel_task('scheduled_task')
                        if self.game_continue:
                            new_next_master = sorted(self.players_ids[self.match_id])[0]
                            await self.channel_layer.group_send(self.room_group_name, {
                                'type': 'start_game',
                                'master_id': new_next_master,
                                'state': 'ongoing',
                            })
            await self.channel_layer.group_discard(
                self.room_group_name, self.channel_name
            )
            # taskが終わるまで待つ
            if hasattr(self, 'pending_tasks') and self.pending_tasks:
                await asyncio.gather(*self.pending_tasks)
        except Exception as e:
            logger.error(f'Error disconnecting: {e}')

    async def receive(self, text_data=None, bytes_data=None):
        try:
            text_data_json = json.loads(text_data)
            action = text_data_json.get('action')

            if action == 'key_event':
                await self.handle_game_message(text_data)
            elif action == 'authenticate':
                await self.handle_authenticate(text_data_json)
            elif action == 'authenticateReconnect':
                await self.handle_authenticate(text_data_json, True)
            elif action == 'exit_game':
                await self.handle_exit_message(text_data)
        except json.JSONDecodeError as e:
            logger.error(f'JSON decode error: {e}')
        except Exception as e:
            logger.error(f'Error in receiving: {e}')



    async def handle_authenticate(self, text_data_json, is_reconnect=False):
        logger.error('handle_authenticate in')
        jwt = text_data_json.get('jwt')
        players_id, player_name, username, jwt_match_id, is_tournament = await self.authenticate_jwt(jwt)
        self.player_name = player_name
        self.is_tournament = is_tournament

        if not players_id or not username or not jwt_match_id:
            logger.error('Error occured while decoding JWT')
            await self.send(text_data=json.dumps({
                'type': 'authenticationFailed',
                'message': 'Authentication failed. please log in again.'
            }))
            return

        if int(self.match_id) != int(jwt_match_id):
            logger.error(f'Error: match ID conflict jwt match_id: {jwt_match_id}, URL match_id: {self.match_id}')
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Match ID conflict'
            }))
            await self.close(code=4101)
            return

        self.username = username
        match = await self.get_match(self.match_id)
        if match and await self.is_player_in_match(players_id, match):
            if match.get('status') in ['after', 'canceled']:
                logger.error(f'match {match.id} is over. close this socket')
                self.close(code=4103)
            logger.info(f'player:{players_id} is in match {self.match_id}!!')
            self.room_group_name = f'pong_{self.match_id}'
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            self.players_id = players_id
            if self.match_id not in self.players_ids:
                self.players_ids[self.match_id] = set()
            self.players_ids[self.match_id].add(self.players_id)

            if is_reconnect == True:
                number_of_player = len(self.players_ids[self.match_id])
                if number_of_player == 1: # 再接続したplayerを含んで1人のみ（ゲーム開始前なのに再接続された１人目）
                    logger.error('No one in this match now, anyway start game...')
                elif number_of_player == 2: # 正常に再接続した場合（開始後のゲームに再接続）
                    logger.info('Rejoin to this match')
                    if match.get('status') == 'ongoing': # 再接続
                        await self.reset_game_data()
                        return
                    elif match.get('status') == 'before': # 再接続だがゲーム開始前なので通常のスタートへ
                        pass
                else: # number_of_player > 2
                    logger.error('Error too many players in this match')
                    self.close(code=4104)
                    return
            # 再接続ではないゲームスタート時
            if len(self.players_ids[self.match_id]) == 1:
                self.start_game_timer_task = asyncio.create_task(self.start_game_timer())
            elif len(self.players_ids[self.match_id]) == 2:  # 2人に決め打ち
                initial_master = sorted(self.players_ids[self.match_id])[0]
                await self.channel_layer.group_send(self.room_group_name, {
                    'type': 'start.game',
                    'master_id': initial_master,
                    'state': 'start',
                })
                await database_sync_to_async(update_match_status_to_ongoing)(self.match_id)                    
            # TODO: 2人揃わない場合のタイムアウト処理
        else:
            logger.error('Match data not found or user is not for this match')
            await self.close(code=1000)

    async def start_game_timer(self):
        try:
            # 一定時間待つ非同期タイマーを設定
            await asyncio.sleep(5)
            # 時間が経過しても片方しかいなかったら、不戦勝
            if len(self.players_ids[self.match_id]) == 1:
                # 自分がplayer1(left_paddle)ならゲームに参加していないのはplayer2(right_paddle)
                # この時点ではpaddleが初期化されていないので初期化を挟む
                await self.reset_game_data()
                if self.player_name == 'player1':
                    self.right_paddle.score = -1
                else:
                    self.left_paddle.score = -1
                #await self.update_match_status(self.match_id, self.left_paddle.score, self.right_paddle.score, 'after')
                await self.game_over('WinByDefault')
        except asyncio.CancelledError:
            logger.error('start_game_timer cancelled')
        except Exception as e:
            logger.error(f'Error in start_game_timer: {e}')

    async def handle_game_message(self, text_data):
        text_data_json = json.loads(text_data)
        action = text_data_json.get('action')
        if action == 'key_event':
            key = text_data_json['key']
            is_pressed = text_data_json['is_pressed']
            print(f'Key event received: {key}' f'\tis_pressed: {is_pressed}')  # コンソールにキーイベントを出力

            # Send message to room group
            await self.channel_layer.group_send(self.room_group_name, {
                # typeキーはgroup_send メソッド内で指定されるキーで、どのハンドラ関数をトリガするかを指定する
                'type': 'pong.message',
                # ここで二つのキーを渡すことでpong_message内で辞書としてアクセスできる
                'key': key,
                'is_pressed': is_pressed,
                'player_name': self.player_name,
            })
        else:
            logger.info('unknown message:', text_data)

    async def handle_exit_message(self, text_data):
        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'exit_game',
            'player_name': self.player_name,
            'players_id': self.players_id,
        })

    async def exit_game(self, event):
        if self.scheduled_task is not None:
            exited_player = event['player_name']
            logger.info(f"{exited_player}")
            if exited_player == 'player1':
                self.left_paddle.score = -1
            elif exited_player == 'player2':
                self.right_paddle.score = -1
            self.game_continue = False
            await self.game_over('ExitGame')

    # Receive message from room group
    async def pong_message(self, data):
        key = data.get('key')
        is_pressed = data.get('is_pressed', False)
        sent_player_name = data.get('player_name')
        
        self.update_paddle_speed('left' if sent_player_name == 'player1' else 'right', key, is_pressed)
    
    def update_paddle_speed(self, side, key, is_pressed):
        up_pressed_attr = f'{side}_up_pressed'
        down_pressed_attr = f'{side}_down_pressed'
        paddle_attr = f'{side}_paddle'

        if key in ['ArrowUp', 'w']:
            setattr(self, up_pressed_attr, is_pressed)
        elif key in ['ArrowDown', 's']:
            setattr(self, down_pressed_attr, is_pressed)

        up_pressed = getattr(self, up_pressed_attr, False)
        down_pressed = getattr(self, down_pressed_attr, False)
        speed = self.PADDLE_SPEED * (down_pressed - up_pressed)
        
        if self.scheduled_task is not None:
            setattr(getattr(self, paddle_attr), 'speed', speed)

    async def schedule_ball_update(self):
        self.game_continue = True

        # すぐにゲームが終わるように10点にセット
        # self.left_paddle.score = 10
        # self.right_paddle.score = 10

        try:
            while self.game_continue:
                # await asyncio.sleep(0.1)
                await asyncio.sleep(1 / 60)  # 60Hz
                self.game_continue = await self.update_ball_and_send_data()
                if not self.game_continue:
                    await self.game_over('GameOver')
        except asyncio.CancelledError:
            logger.error('schedule_ball_update cancelled')
        except Exception as e:
            logger.error(f'Error in schedule_ball_update: {e}')

    async def game_timer(self):
        try:
            await asyncio.sleep(self.TIME_LIMIT_SEC)
            await self.game_over('TimerOver')
        except asyncio.CancelledError:
            logger.error('game_timer cancelled')
        except Exception as e:
            logger.error(f'Error in schedule_ball_update: {e}')            

    async def game_over(self, message):
        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'send_game_over_message',
            'message': message,
        })

        asyncio.create_task(self.update_match_status(self.match_id, self.left_paddle.score, self.right_paddle.score, 'after'))
        # 問題を発生させるには上をコメントアウトして下の#を取る
        # await self.update_match_status(self.match_id, self.left_paddle.score, self.right_paddle.score, 'after')

        await self.cancel_task('scheduled_task')
        await self.cancel_task('game_timer_task')

    async def send_game_over_message(self, event):
        message = event['message']
        timestamp = dt.utcnow().isoformat()
        if self.scheduled_task is None:
            self.game_continue = False
        await self.send_game_data(game_status=False, message=message, timestamp=timestamp, sound_type='game_over')

    async def update_ball_and_send_data(self):
        self.right_paddle.move()
        self.left_paddle.move()
        game_continue, sound_type = self.ball.move(self.right_paddle, self.left_paddle)
        ball_tmp = {
            'x': self.ball.x,
            'y': self.ball.y,
            'dx': self.ball.dx,
            'dy': self.ball.dy,
            'size': self.ball.size,
        }
        right_paddle_tmp = {
            'x': self.right_paddle.x,
            'y': self.right_paddle.y,
            'horizontal': self.right_paddle.thickness,
            'vertical': self.right_paddle.length,
            'score': self.right_paddle.score,
        }
        left_paddle_tmp = {
            'x': self.left_paddle.x,
            'y': self.left_paddle.y,
            'horizontal': self.left_paddle.thickness,
            'vertical': self.left_paddle.length,
            'score': self.left_paddle.score,
        }
        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'ball.message',
            'message': 'update_ball_pos',
            'timestamp': dt.utcnow().isoformat(),
            'player_name': self.player_name,
            'ball': ball_tmp,
            'right_paddle': right_paddle_tmp,
            'left_paddle': left_paddle_tmp,
            'sound_type': sound_type,
        })
        return game_continue

    async def ball_message(self, data):
        message = data['message']
        timestamp = data['timestamp']
        sound_type = data['sound_type']
        if self.scheduled_task is None:
            await self.init_game_state_into_self(data)
        await self.send_game_data(game_status=True, message=message, timestamp=timestamp, sound_type=sound_type)

    async def send_game_data(self, game_status, message, timestamp, sound_type):
        try:
            await self.send(text_data=json.dumps({
                'message': message + f'\n{timestamp}\n\n',
                'game_status': game_status,
                'ball': {
                    'x': self.ball.x,
                    'y': self.ball.y,
                    'dx': self.ball.dx,
                    'dy': self.ball.dy,
                    'size': self.ball.size,
                },
                'right_paddle': {
                    'x': self.right_paddle.x,
                    'y': self.right_paddle.y,
                    'horizontal': self.right_paddle.thickness,
                    'vertical': self.right_paddle.length,
                    'score': self.right_paddle.score,
                },
                'left_paddle': {
                    'x': self.left_paddle.x,
                    'y': self.left_paddle.y,
                    'horizontal': self.left_paddle.thickness,
                    'vertical': self.left_paddle.length,
                    'score': self.left_paddle.score,
                },
                'sound_type': sound_type,
            }))
        except Exception as e:
            logger.error(f'Error in send_game_data: {e}')

    async def reset_game_data(self):
        self.scheduled_task = None
        self.right_paddle = Paddle(CANVAS_WIDTH - PADDLE_THICKNESS - PADDING, (CANVAS_HEIGHT - PADDLE_LENGTH) / 2,
                                   PADDLE_THICKNESS, PADDLE_LENGTH)
        self.right_paddle.reset()
        self.left_paddle = Paddle(PADDING, (CANVAS_HEIGHT - PADDLE_LENGTH) / 2, PADDLE_THICKNESS, PADDLE_LENGTH)
        self.left_paddle.reset()
        self.ball = Ball(CANVAS_WIDTH / 2 - BALL_SIZE / 2, CANVAS_HEIGHT / 2 - BALL_SIZE / 2, BALL_SIZE)
        self.game_continue = False

    async def init_game_state_into_self(self, data):
        # player1からオブジェクトを受け取る
        ball_data = data['ball']
        self.ball.x = ball_data['x']
        self.ball.y = ball_data['y']
        self.ball.dx = ball_data['dx']
        self.ball.dy = ball_data['dy']
        self.ball.size = ball_data['size']
        # right_paddle
        right_paddle_data = data['right_paddle']
        self.right_paddle.x = right_paddle_data['x']
        self.right_paddle.y = right_paddle_data['y']
        self.right_paddle.thickness = right_paddle_data['horizontal']
        self.right_paddle.length = right_paddle_data['vertical']
        self.right_paddle.score = right_paddle_data['score']
        # left_paddle
        left_paddle_data = data['left_paddle']
        self.left_paddle.x = left_paddle_data['x']
        self.left_paddle.y = left_paddle_data['y']
        self.left_paddle.thickness = left_paddle_data['horizontal']
        self.left_paddle.length = left_paddle_data['vertical']
        self.left_paddle.score = left_paddle_data['score']

    async def cancel_task(self, task_name):
        task = getattr(self, task_name)
        if task is not None:
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                logger.info(f'cancel_task: {task}')
            except Exception as e:
                logger.error(f'Error occurred in cancel_task: {task} {str(e)}')
            setattr(self, task_name, None)
        else:
            pass

    @database_sync_to_async
    def authenticate_jwt(self, jwt):
        try:
            token_backend = TokenBackend(algorithm=settings.SIMPLE_JWT['ALGORITHM'],
                                         signing_key=settings.SIMPLE_JWT['SIGNING_KEY'])
            validated_token = token_backend.decode(jwt, verify=True)
            logger.info(f'validated_token= {validated_token}')
            user_id = validated_token['user_id']
            username = validated_token['username']
            players_id = validated_token['players_id']
            player_name = validated_token['player_name']
            match_id = validated_token['match_id']
            is_tournament = validated_token['is_tournament']
            logger.info(
                f'authenticate_jwt: user_id={user_id}, username={username}, players_id={players_id}, match_id={match_id}')
            return players_id, player_name, username, match_id, is_tournament
        except InvalidToken as e:
            logger.error('Error: invalid token in jwt')
            return None, None

    @database_sync_to_async
    def get_match(self, match_id):
        return get_match_from_api(match_id)

    @database_sync_to_async
    def is_player_in_match(self, players_id, match):
        try:
            player1_id = match.get('player1')
            player2_id = match.get('player2')
            logger.info(
                f'Checking if player_id:{players_id} is in the match with player1:{player1_id} or player2:{player2_id}')
            return players_id in [player1_id, player2_id]
        except Exception as e:
            logger.error(f'Error: is_user_in_match {str(e)}')
            return False

    async def update_match_status(self, match_id, score1, score2, game_state):
        send_data = {
            'score1': score1,
            'score2': score2,
            'status': game_state,
        }
        # 問題を発生させるには下の#を取る
        # await asyncio.sleep(5)
        await database_sync_to_async(patch_match_to_api)(match_id, send_data)

    async def start_game(self, event):
        master_id = event['master_id']
        state = event['state']
        if state == 'start':
            # ここで初期化しないとNoneTypeになってしまう
            await self.reset_game_data()
            await self.cancel_task('start_game_timer_task')
        if self.players_id == master_id:
            logger.error(f'New master appointed: {self.player_name}')
            self.scheduled_task = asyncio.create_task(self.schedule_ball_update())
            if self.is_tournament:
                self.game_timer_task = asyncio.create_task(self.game_timer())
