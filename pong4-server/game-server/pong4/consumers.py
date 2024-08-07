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
from .data_serialize import serialize_transfer_data, deserialize_tranfer_data

logger = logging.getLogger(__name__)


# 非同期通信を実現したいのでAsyncWebsocketConsumerクラスを継承
class PongConsumer(AsyncWebsocketConsumer):
    players_ids = {}
    PADDLE_SPEED = 7

    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.match_id = None
        self.room_group_name = None
        self.players_id = None
        self.username = None
        self.player_name = None
        self.scheduled_task = None
        # 1vs1pongを引き継ぐためplayer1はleft_paddle
        self.right_paddle = None
        # player2
        self.left_paddle = None
        # player3
        self.upper_paddle = None
        # player4
        self.lower_paddle = None
        self.active_paddle_count = 4
        self.ball = None
        self.game_continue = False
        self.up_pressed = False
        self.down_pressed = False
        self.right_pressed = False
        self.left_pressed = False
        self.result_sent = False

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
            if self.match_id in self.players_ids and self.player_name in self.players_ids[self.match_id]:
                logger.info(f'remove: players_ids[{self.match_id}]: {self.players_id}')
                self.players_ids[self.match_id].remove(self.player_name)
                if not self.players_ids[self.match_id]:
                    logger.error(f'no players left in match_id: {self.match_id}')
                    if not self.result_sent:
                        await self.game_over('', True)
                    del self.players_ids[self.match_id]
                else:
                    if self.scheduled_task is not None:
                        # self.scheduled_task.cancel()
                        await self.cancel_task('scheduled_task')
                        self.scheduled_task = None
                        if self.game_continue:
                            new_next_master = sorted(self.players_ids[self.match_id])[0]
                            logger.error(f'new_next_master: {new_next_master}')
                            await self.send_transfer_data()
                            await self.channel_layer.group_send(self.room_group_name, {
                                'type': 'start_game',
                                'master_name': new_next_master,
                                'state': 'ongoing',
                            })
            await self.channel_layer.group_discard(
                self.room_group_name, self.channel_name
            )
        except Exception as e:
            logger.error(f'Error disconnecting: {e}')

    async def receive(self, text_data=None, bytes_data=None):
        try:
            text_data_json = json.loads(text_data)
            action = text_data_json.get('action')

            if action == 'authenticate':
                await self.handle_authenticate(text_data_json)
            elif action == 'key_event':
                await self.handle_game_message(text_data)
            elif action == 'authenticateReconnect':
                await self.handle_authenticate(text_data_json, True)
            elif action == 'exit_game':
                await self.handle_exit_message(text_data)
        except json.JSONDecodeError as e:
            logger.error(f'JSON decode error: {e}')
        except Exception as e:
            logger.error(f'Error in receiving: {e}')

    async def handle_authenticate(self, text_data_json, is_reconnect=False):
        jwt = text_data_json.get('jwt')
        players_id, player_name, username, jwt_match_id = await self.authenticate_jwt(jwt)
        self.player_name = player_name

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
            logger.info(f'player:{players_id} is in match {self.match_id}!!')
            self.room_group_name = f'pong4_{self.match_id}'
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            self.players_id = players_id
            if self.match_id not in self.players_ids:
                self.players_ids[self.match_id] = set()
            self.players_ids[self.match_id].add(self.player_name)

            if is_reconnect == True:
                number_of_player = len(self.players_ids[self.match_id])
                if number_of_player == 1: # 再接続したplayerを含んで1人のみ（ゲーム開始前なのに再接続された１人目）
                    logger.error('No one in this match now, anyway start game...')
                elif number_of_player >= 2 and number_of_player <= 4: # 正常に再接続した場合（開始後のゲームに再接続）
                    logger.info('Rejoin to this match')
                    if match.get('status') == 'ongoing': # 再接続
                        await self.reset_game_data()
                        return
                    elif match.get('status') == 'before': # 再接続だがゲーム開始前なので通常のスタートへ
                        pass
                else: # number_of_player > 4
                    logger.error('Error too many players in this match')
                    self.close(code=4104)
                    return

            if len(self.players_ids[self.match_id]) == 4:  # 4人に決め打ち
                initial_master = sorted(self.players_ids[self.match_id])[0]
                logger.error(f'initial_master: {initial_master}')
                await self.channel_layer.group_send(self.room_group_name, {
                    'type': 'start.game',
                    'master_name': initial_master,
                    'state': 'start',
                })
                await database_sync_to_async(update_match_status_to_ongoing)(self.match_id)
            # TODO: 4人揃わない場合のタイムアウト処理
        else:
            logger.error('Match data not found or user is not for this match')
            await self.close(code=4102)
            return

    async def handle_exit_message(self, text_data):
        await self.deactivate_paddle(self.player_name)
        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'exit_game',
            'player_name': self.player_name,
        })

    async def exit_game(self, event):
        exited_player = event['player_name']
        await self.deactivate_paddle(exited_player)

    async def deactivate_paddle(self, exited_player):
        if exited_player == 'player1':
            self.left_paddle.deactivate(-1)
        elif exited_player == 'player2':
            self.right_paddle.deactivate(-1)
        elif exited_player == 'player3':
            self.upper_paddle.deactivate(-1)
        elif exited_player == 'player4':
            self.lower_paddle.deactivate(-1)

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

    # Receive message from room group
    async def pong_message(self, data):
        key = data.get('key')
        is_pressed = data.get('is_pressed', False)
        sent_player_name = data.get('player_name')

        side = None
        if sent_player_name == 'player1':
            side = 'left'
        elif sent_player_name == 'player2':
            side = 'right'
        elif sent_player_name == 'player3':
            side = 'upper'
        elif sent_player_name == 'player4':
            side = 'lower'
        self.update_paddle_speed(side, key, is_pressed)

    def update_paddle_speed(self, side, key, is_pressed):
        paddle_attr = f'{side}_paddle'

        if key in ['ArrowUp', 'w']:
            up_pressed_attr = f'{side}_up_pressed'
            setattr(self, up_pressed_attr, is_pressed)
        elif key in ['s', 'ArrowDown']:
            down_pressed_attr = f'{side}_down_pressed'
            setattr(self, down_pressed_attr, is_pressed)
        elif key in ['ArrowRight', 'd']:
            right_pressed_attr = f'{side}_right_pressed'
            setattr(self, right_pressed_attr, is_pressed)
        elif key in ['a', 'ArrowLeft']:
            left_pressed_attr = f'{side}_left_pressed'
            setattr(self, left_pressed_attr, is_pressed)

        if self.scheduled_task is not None:
            if side == 'left' or side == 'right':
                up_pressed = getattr(self, f'{side}_up_pressed', False)
                down_pressed = getattr(self, f'{side}_down_pressed', False)
                speed = self.PADDLE_SPEED * (down_pressed - up_pressed)
            else:
                left_pressed = getattr(self, f'{side}_left_pressed', False)
                right_pressed = getattr(self, f'{side}_right_pressed', False)
                speed = self.PADDLE_SPEED * (right_pressed - left_pressed)
            setattr(getattr(self, paddle_attr), 'speed', speed)

    async def schedule_ball_update(self):
        self.game_continue = True
        try:
            while self.game_continue:
                # await asyncio.sleep(0.1)
                await asyncio.sleep(1 / 60)  # 60Hz
                self.game_continue = await self.update_ball_and_send_data()
                if not self.game_continue:
                    await self.update_match_status(self.match_id, self.left_paddle.score, self.right_paddle.score,
                                                   self.upper_paddle.score, self.lower_paddle.score, 'after')
                    await self.channel_layer.group_send(self.room_group_name, {
                        'type': 'send_game_over_message',
                        'message': 'GameOver',
                    })
                    if self.scheduled_task is not None:
                        self.scheduled_task.cancel()
                        self.scheduled_task = None
        except asyncio.CancelledError:
            logger.error('schedule_ball_update cancelled')
        except Exception as e:
            logger.error(f'Error in schedule_ball_update: {e} by {self.username}')

    async def game_over(self, message, is_match_discarded=False):
        if not is_match_discarded:
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'send_game_over_message',
                'message': message,
            })

        await self.update_match_status(self.match_id, self.left_paddle.score, self.right_paddle.score, self.upper_paddle.score, self.lower_paddle.score, 'after')
        if self.scheduled_task is not None:
            self.scheduled_task.cancel()
            self.scheduled_task = None

    async def send_game_over_message(self, event):
        self.result_sent = True
        message = event['message']
        timestamp = dt.utcnow().isoformat()
        if self.scheduled_task is None:
            self.game_continue = False
        await self.send_game_data(game_status=False, message=message, timestamp=timestamp, sound_type='game_over')

    async def count_active_paddle(self):
        active_count = sum([
            self.left_paddle.is_active,
            self.right_paddle.is_active,
            self.upper_paddle.is_active,
            self.lower_paddle.is_active,
        ])
        return active_count

    async def remove_wall(self):
        if not self.left_paddle.is_active:
            # 左上縦 左下縦
            await self.remove_wall_by_position_and_orientation('vertical', 'LEFT')
        elif not self.right_paddle.is_active:
            # 右上縦 右下縦
            await self.remove_wall_by_position_and_orientation('vertical', 'RIGHT')
        elif not self.upper_paddle.is_active:
            # 左上横 右上横
            await self.remove_wall_by_position_and_orientation('horizontal', 'UPPER')
        elif not self.lower_paddle.is_active:
            # 左下横 右下横
            await self.remove_wall_by_position_and_orientation('horizontal', 'LOWER')

    async def remove_wall_by_position_and_orientation(self, orientation, position):
        walls_to_remove = [wall for wall in self.walls if wall.orientation == orientation and wall.position == position]
        if walls_to_remove:
            for wall in walls_to_remove:
                self.walls.remove(wall)
            logger.info("Wall removed")
        else:
            logger.info("No wall removed")

    async def send_transfer_data(self):
        game_state = serialize_transfer_data(self)
        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'receive_transfer_data',
            'game_state': game_state,
        })

    async def receive_transfer_data(self, event):
        data = event['game_state']
        deserialize_tranfer_data(data, self)
        logger.info(f'{self.username}: receive transfer data')

    async def update_ball_and_send_data(self):
        self.right_paddle.move_for_multiple()
        self.left_paddle.move_for_multiple()
        self.upper_paddle.move_for_multiple()
        self.lower_paddle.move_for_multiple()
        sound_type = self.ball.move_for_multiple(self.right_paddle, self.left_paddle, self.upper_paddle,
                                                 self.lower_paddle, self.walls)
        active_count = await self.count_active_paddle()
        if self.active_paddle_count != active_count:
            await self.remove_wall()
            self.active_paddle_count = active_count
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
        upper_paddle_tmp = {
            'x': self.upper_paddle.x,
            'y': self.upper_paddle.y,
            'horizontal': self.upper_paddle.length,
            'vertical': self.upper_paddle.thickness,
            'score': self.upper_paddle.score,
        }
        lower_paddle_tmp = {
            'x': self.lower_paddle.x,
            'y': self.lower_paddle.y,
            'horizontal': self.lower_paddle.length,
            'vertical': self.lower_paddle.thickness,
            'score': self.lower_paddle.score,
        }
        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'ball.message',
            'message': 'update_ball_pos',
            'timestamp': dt.utcnow().isoformat(),
            'player_name': self.player_name,
            'ball': ball_tmp,
            'right_paddle': right_paddle_tmp,
            'left_paddle': left_paddle_tmp,
            'upper_paddle': upper_paddle_tmp,
            'lower_paddle': lower_paddle_tmp,
            'sound_type': sound_type,
        })
        game_continue = active_count > 1
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
                'upper_paddle': {
                    'x': self.upper_paddle.x,
                    'y': self.upper_paddle.y,
                    'horizontal': self.upper_paddle.length,
                    'vertical': self.upper_paddle.thickness,
                    'score': self.upper_paddle.score,
                },
                'lower_paddle': {
                    'x': self.lower_paddle.x,
                    'y': self.lower_paddle.y,
                    'horizontal': self.lower_paddle.length,
                    'vertical': self.lower_paddle.thickness,
                    'score': self.lower_paddle.score,
                },
                'sound_type': sound_type,
            }))
        except Exception as e:
            logger.error(f'Error in send_game_data: {e}')

    async def reset_game_data(self):
        self.scheduled_task = None
        # horizontal -> 横向き    vertical -> 縦向き
        self.right_paddle = Paddle(CANVAS_WIDTH_MULTI - PADDLE_THICKNESS,
                                   (CANVAS_HEIGHT_MULTI / 2) - (PADDLE_LENGTH / 2),
                                   PADDLE_THICKNESS, PADDLE_LENGTH, 'vertical')
        self.left_paddle = Paddle(0, (CANVAS_HEIGHT_MULTI / 2) - (PADDLE_LENGTH / 2), PADDLE_THICKNESS,
                                  PADDLE_LENGTH, 'vertical')
        self.upper_paddle = Paddle((CANVAS_WIDTH_MULTI / 2) - (PADDLE_LENGTH / 2), 0, PADDLE_LENGTH,
                                   PADDLE_THICKNESS, 'horizontal')
        self.lower_paddle = Paddle((CANVAS_WIDTH_MULTI / 2) - (PADDLE_LENGTH / 2),
                                   CANVAS_HEIGHT_MULTI - PADDLE_THICKNESS,
                                   PADDLE_LENGTH, PADDLE_THICKNESS, 'horizontal')
        self.ball = Ball(CANVAS_WIDTH_MULTI / 2 - BALL_SIZE / 2, CANVAS_HEIGHT_MULTI / 2 - BALL_SIZE / 2, BALL_SIZE)
        self.game_continue = False

    async def init_walls(self):
        # 壁の初期化はplayer1が初回だけ行えばいい
        # 1.左上横
        wall_top_left_horizontal = Block(CORNER_BLOCK_THICKNESS, 0, CORNER_BLOCK_SIZE - CORNER_BLOCK_THICKNESS,
                                         CORNER_BLOCK_THICKNESS, 'horizontal', 'UPPER')
        # 2.左上縦
        wall_top_left_vertical = Block(0, CORNER_BLOCK_THICKNESS, CORNER_BLOCK_THICKNESS,
                                       CORNER_BLOCK_SIZE - CORNER_BLOCK_THICKNESS, 'vertical', 'LEFT')
        # 3.右上横
        wall_top_right_horizontal = Block(CANVAS_WIDTH_MULTI - CORNER_BLOCK_SIZE, 0,
                                          CORNER_BLOCK_SIZE - CORNER_BLOCK_THICKNESS, CORNER_BLOCK_THICKNESS,
                                          'horizontal', 'UPPER')
        # 4.右上縦
        wall_top_right_vertical = Block(CANVAS_WIDTH_MULTI - CORNER_BLOCK_THICKNESS, CORNER_BLOCK_THICKNESS,
                                        CORNER_BLOCK_THICKNESS, CORNER_BLOCK_SIZE - CORNER_BLOCK_THICKNESS,
                                        'vertical', 'RIGHT')
        # 5.左下横
        wall_bottom_left_horizontal = Block(CORNER_BLOCK_THICKNESS, CANVAS_HEIGHT_MULTI - CORNER_BLOCK_THICKNESS,
                                            CORNER_BLOCK_SIZE - CORNER_BLOCK_THICKNESS, CORNER_BLOCK_THICKNESS,
                                            'horizontal', 'LOWER')
        # 6.左下縦
        wall_bottom_left_vertical = Block(0, CANVAS_HEIGHT_MULTI - CORNER_BLOCK_SIZE, CORNER_BLOCK_THICKNESS,
                                          CORNER_BLOCK_SIZE - CORNER_BLOCK_THICKNESS, 'vertical', 'LEFT')
        # 7.右下横
        wall_bottom_right_horizontal = Block(CANVAS_WIDTH_MULTI - CORNER_BLOCK_SIZE,
                                             CANVAS_HEIGHT_MULTI - CORNER_BLOCK_THICKNESS,
                                             CORNER_BLOCK_SIZE - CORNER_BLOCK_THICKNESS, CORNER_BLOCK_THICKNESS,
                                             'horizontal', 'LOWER')
        # 8.右下縦
        wall_bottom_right_vertical = Block(CANVAS_WIDTH_MULTI - CORNER_BLOCK_THICKNESS,
                                           CANVAS_HEIGHT_MULTI - CORNER_BLOCK_SIZE,
                                           CORNER_BLOCK_THICKNESS, CORNER_BLOCK_SIZE - CORNER_BLOCK_THICKNESS,
                                           'vertical', 'RIGHT')
        self.walls = {
            wall_top_left_horizontal,
            wall_top_left_vertical,
            wall_top_right_horizontal,
            wall_top_right_vertical,
            wall_bottom_left_horizontal,
            wall_bottom_left_vertical,
            wall_bottom_right_horizontal,
            wall_bottom_right_vertical
        }

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
        # upper_paddle
        upper_paddle_data = data['upper_paddle']
        self.upper_paddle.x = upper_paddle_data['x']
        self.upper_paddle.y = upper_paddle_data['y']
        self.upper_paddle.thickness = upper_paddle_data['vertical']
        self.upper_paddle.length = upper_paddle_data['horizontal']
        self.upper_paddle.score = upper_paddle_data['score']
        # lower_paddle
        lower_paddle_data = data['lower_paddle']
        self.lower_paddle.x = lower_paddle_data['x']
        self.lower_paddle.y = lower_paddle_data['y']
        self.lower_paddle.thickness = lower_paddle_data['vertical']
        self.lower_paddle.length = lower_paddle_data['horizontal']
        self.lower_paddle.score = lower_paddle_data['score']
        # wall

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
            token_backend = TokenBackend(algorithm='HS256', signing_key=settings.SIMPLE_JWT['SIGNING_KEY'])
            validated_token = token_backend.decode(jwt, verify=True)
            logger.info(f'validated_token= {validated_token}')
            user_id = validated_token['user_id']
            username = validated_token['username']
            players_id = validated_token['players_id']
            player_name = validated_token['player_name']
            match_id = validated_token['match_id']
            logger.info(
                f'authenticate_jwt: user_id={user_id}, username={username}, players_id={players_id}, match_id={match_id}')
            return players_id, player_name, username, match_id
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
            player3_id = match.get('player3')
            player4_id = match.get('player4')
            logger.info(
                f'Checking if player_id:{players_id} is in the match with player1:{player1_id} or player2:{player2_id} or player3:{player3_id} or player4:{player4_id}')
            return players_id in [player1_id, player2_id, player3_id, player4_id]
        except Exception as e:
            logger.error(f'Error: is_user_in_match {str(e)}')
            return False

    @database_sync_to_async
    def update_match_status(self, match_id, score1, score2, score3, score4, game_state):
        send_data = {
            'score1': score1,
            'score2': score2,
            'score3': score3,
            'score4': score4,
            'status': game_state,
        }
        patch_match_to_api(match_id, send_data)

    async def start_game(self, event):
        master_name = event['master_name']
        state = event['state']
        if state == 'start':
            # ここで初期化しないとNoneTypeになってしまう
            await self.reset_game_data()
        if self.player_name == master_name:
            await self.init_walls()
            logger.info(f"New master appointed: [{self.players_id}]{self.player_name}")
            self.scheduled_task = asyncio.create_task(self.schedule_ball_update())