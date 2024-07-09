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
from .api_access import get_match_from_api, patch_match_to_api

#from .models import Match

logger = logging.getLogger(__name__)


# 非同期通信を実現したいのでAsyncWebsocketConsumerクラスを継承
class PongConsumer(AsyncWebsocketConsumer):
    players_ids = {}

    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.match_id = None
        self.room_group_name = None
        self.players_id = None
        self.username = None
        self.player_name = None
        self.scheduled_task = None
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
                await self.close(code=4200)
                return
            logger.info('match_id exists')
            await self.accept()

        except Exception as e:
            logger.error(f'Error connecting: {e}')

    async def disconnect(self, close_code):
        # Leave room group
        if self.match_id in self.players_ids and self.players_id in self.players_ids[self.match_id]:
            if self.scheduled_task is not None:
                self.scheduled_task.cancel()
                self.scheduled_task = None
                await self.channel_layer.group_send(self.room_group_name, {
                    'type': 'start.game',
                    'state': 'ongoing',
                })
            logger.info(f'remove: players_ids[{self.match_id}]: {self.players_id}')
            self.players_ids[self.match_id].remove(self.players_id)
            if not self.players_ids[self.match_id]:
                logger.info(f'del: {self.players_ids}[{self.match_id}]')
                del self.players_ids[self.match_id]
            else:
                new_next_master = sorted(self.players_ids[self.match_id])[0]
                await self.channel_layer.group_send(self.room_group_name, {
                    'type': 'start_game',
                    'master_id': new_next_master,
                    'state': 'ongoing',
                })
        await self.channel_layer.group_discard(
            self.room_group_name, self.channel_name
        )
        if self.scheduled_task is not None:
            self.scheduled_task.cancel()
            self.scheduled_task = None

    async def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)
        action = text_data_json.get('action')

        if action == 'authenticate':
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
                return

            self.username = username
            match = await self.get_match(self.match_id)
            if match and await self.is_player_in_match(players_id, match):
                logger.info(f'player:{players_id} is in match {self.match_id}!!')
                self.room_group_name = f'pong_{self.match_id}'
                await self.channel_layer.group_add(self.room_group_name, self.channel_name)
                self.players_id = players_id
                if self.match_id not in self.players_ids:
                    self.players_ids[self.match_id] = set()
                self.players_ids[self.match_id].add(self.players_id)
                if len(self.players_ids[self.match_id]) == 2:  # 2人に決め打ち
                    initial_master = sorted(self.players_ids[self.match_id])[0]
                    await self.channel_layer.group_send(self.room_group_name, {
                        'type': 'start.game',
                        'master_id': initial_master,
                        'state': 'start',
                    })
                # TODO: 2人揃わない場合のタイムアウト処理
            else:
                logger.error('Match data not found or user is not for this match')
                await self.close(code=1000)
                return
        elif action == 'key_event':
            await self.handle_game_message(text_data)

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

        if key in ['ArrowUp', 'w']:
            self.up_pressed = is_pressed
        elif key in ['s', 'ArrowDown']:
            self.down_pressed = is_pressed
        speed = -7 * self.up_pressed + 7 * self.down_pressed

        # if self.player_name == 'player1':
        if self.scheduled_task is not None:
            if sent_player_name == 'player1':
                self.left_paddle.speed = speed
            elif sent_player_name == 'player2':
                self.right_paddle.speed = speed

    async def schedule_ball_update(self):
        self.game_continue = True
        try:
            while self.game_continue:
                #                await asyncio.sleep(0.05)  # 50ミリ秒待機
                # await asyncio.sleep(0.1)  # 60Hz
                await asyncio.sleep(1 / 60)  # 60Hz
                self.game_continue = await self.update_ball_and_send_data()
                if not self.game_continue:
                    await self.update_match_status(self.match_id, self.left_paddle.score, self.right_paddle.score, 'after')
                    await self.channel_layer.group_send(self.room_group_name, {
                        'type': 'send_game_over_message',
                        'message': 'GameOver',
                    })
                    self.scheduled_task.cancel()
        except asyncio.CancelledError:
            # タスクがキャンセルされたときのエラーハンドリング
            # 今は特に書いていないのでpass
            pass

    async def send_game_over_message(self, event):
        message = event['message']
        timestamp = dt.utcnow().isoformat()
        # if self.player_name == 'player2':
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
        if self.player_name != 'player1':
            await self.init_game_state_into_self(data)
        await self.send_game_data(game_status=True, message=message, timestamp=timestamp, sound_type=sound_type)

    async def send_game_data(self, game_status, message, timestamp, sound_type):
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

    def reset_game_data(self):
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
            logger.info(
                f'Checking if player_id:{players_id} is in the match with player1:{player1_id} or player2:{player2_id}')
            return players_id in [player1_id, player2_id]
        except Exception as e:
            logger.error(f'Error: is_user_in_match {str(e)}')
            return False

    @database_sync_to_async
    def update_match_status(self, match_id, score1, score2, game_state):
        send_data = {
            'score1': score1,
            'score2': score2,
            'status': game_state,
        }
        patch_match_to_api(match_id, send_data)

    async def start_game(self, event):
        master_id = event['master_id']
        state = event['state']
        if self.players_id == master_id:
            logger.info(f"New master appointed: {self.player_name}")
            if state != 'ongoing':
                self.reset_game_data()
            self.scheduled_task = asyncio.create_task(self.schedule_ball_update())