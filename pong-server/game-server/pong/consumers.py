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
from .api_access import get_match_from_api
#from .models import Match

logger = logging.getLogger(__name__)


# 非同期通信を実現したいのでAsyncWebsocketConsumerクラスを継承
class PongConsumer(AsyncWebsocketConsumer):
    scheduled_task = None
    right_paddle = Paddle(CANVAS_WIDTH - PADDLE_THICKNESS - PADDING, (CANVAS_HEIGHT - PADDLE_LENGTH) / 2,
                          PADDLE_THICKNESS, PADDLE_LENGTH)
    left_paddle = Paddle(PADDING, (CANVAS_HEIGHT - PADDLE_LENGTH) / 2, PADDLE_THICKNESS, PADDLE_LENGTH)
    ball = Ball(CANVAS_WIDTH / 2 - BALL_SIZE / 2, CANVAS_HEIGHT / 2 - BALL_SIZE / 2, BALL_SIZE)
    ready = False
    game_continue = False
    players_ids = set()

    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.match_id = None
        self.room_group_name = None
    #    self.user_id = None
        self.players_id = None
        self.username = None
    #    self.authenticated = False

    async def connect(self):
        try:
            # URLからmatch_idを取得
            self.match_id = self.scope["url_route"]["kwargs"].get("match_id")
            if not self.match_id:
                logger.error(f"Match ID is missing in URL path: {self.match_id}")
                await self.close(code=4200)
                return
            logger.info('match_id exists')

            await self.accept()

            # # クライアント側でonopenが発火したらループを開始する
            # self.is_active = True
            # if not self.ready:
            #     self.ready = True
            #     self.scheduled_task = asyncio.create_task(self.schedule_ball_update())

        except Exception as e:
            logger.error(f"Error connecting: {e}")

    async def disconnect(self, close_code):
        # Leave room group
        self.is_active = False
        if self.scheduled_task:
            self.scheduled_task.cancel()
        if not self.room_group_name:
            self.room_group_name = f'pong_{self.match_id}'
        await self.channel_layer.group_discard(
            self.room_group_name, self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)
        action = text_data_json.get('action')

        if action == 'authenticate':
            jwt = text_data_json.get('jwt')
            players_id, username, jwt_match_id = await self.auhtnticate_jwt(jwt)

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
                self.players_ids.add(players_id)
                if len(self.players_ids) == 2: # 2人に決め打ち
                    await self.start_game()
                # TODO: 2人揃わない場合のタイムアウト処理
                # クライアント側からリクエストする？
            else:
                logger.error('Match data not found or user is not for this match')
                self.close(code=5000)
                return
        else:
            await self.handle_game_message(text_data)


    async def handle_game_message(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]
        if message == 'key_event':
            key = text_data_json['key']
            is_pressed = text_data_json['is_pressed']
            print(f"Key event received: {key}" f"\tis_pressed: {is_pressed}")  # コンソールにキーイベントを出力

            # Send message to room group
            await self.channel_layer.group_send(self.room_group_name, {
                # typeキーはgroup_send メソッド内で指定されるキーで、どのハンドラ関数をトリガするかを指定する
                "type": "pong.message",
                # ここで二つのキーを渡すことでpong_message内で辞書としてアクセスできる
                "timestamp": dt.utcnow().isoformat(),
                "message": message,
                "key": key,
                "is_pressed": is_pressed,
            })
        else:
            logger.info("unknown message:", text_data)

    # Receive message from room group
    async def pong_message(self, data):
        timestamp = data["timestamp"]
        message = data["message"]
        key = data.get('key')
        is_pressed = data.get('is_pressed', False)

        # キー入力によってパドルを操作
        if key and is_pressed:
            if key == "ArrowUp":
                self.right_paddle.speed = -10
            elif key == "ArrowDown":
                self.right_paddle.speed = 10
            elif key == "w":
                self.left_paddle.speed = -10
            elif key == "s":
                self.left_paddle.speed = 10
        else:
            if key == "ArrowUp":
                self.right_paddle.speed = 0
            elif key == "ArrowDown":
                self.right_paddle.speed = 0
            elif key == "w":
                self.left_paddle.speed = 0
            elif key == "s":
                self.left_paddle.speed = 0

        # Send message to WebSocket
        # await self.send_game_data(True, message=message, timestamp=timestamp)

    async def schedule_ball_update(self):
        self.game_continue = True
        try:
            while self.game_continue:
                #                await asyncio.sleep(0.05)  # 50ミリ秒待機
                await asyncio.sleep(0.1)  # 60Hz
                # await asyncio.sleep(1 / 60)  # 60Hz
                self.game_continue = await self.update_ball_and_send_data()
                if not self.game_continue:
                    await self.channel_layer.group_send(self.room_group_name, {
                        "type": "send_game_over_message",
                        "message": "GameOver",
                    })
        except asyncio.CancelledError:
            # タスクがキャンセルされたときのエラーハンドリング
            # 今は特に書いていないのでpass
            pass

    async def send_game_over_message(self, event):
        message = event["message"]
        timestamp = dt.utcnow().isoformat()
        await self.send_game_data(game_status=False, message=message, timestamp=timestamp)

    async def update_ball_and_send_data(self):
        self.right_paddle.move()
        self.left_paddle.move()
        game_continue = self.ball.move(self.right_paddle, self.left_paddle)
        await self.channel_layer.group_send(self.room_group_name, {
            "type": "ball.message",
            "message": "update_ball_pos",
            "timestamp": dt.utcnow().isoformat(),
        })
        return game_continue

    async def ball_message(self, data):
        message = data["message"]
        timestamp = data["timestamp"]
        await self.send_game_data(game_status=True, message=message, timestamp=timestamp)

    async def send_game_data(self, game_status, message, timestamp):
        await self.send(text_data=json.dumps({
            "message": message + f'\n{timestamp}\n\n',
            "game_status": game_status,
            "ball": {
                "x": self.ball.x,
                "y": self.ball.y,
                "dx": self.ball.dx,
                "dy": self.ball.dy,
                "size": self.ball.size,
            },
            "right_paddle": {
                "x": self.right_paddle.x,
                "y": self.right_paddle.y,
                "horizontal": self.right_paddle.thickness,
                "vertical": self.right_paddle.length,
                "score": self.right_paddle.score,
            },
            "left_paddle": {
                "x": self.left_paddle.x,
                "y": self.left_paddle.y,
                "horizontal": self.left_paddle.thickness,
                "vertical": self.left_paddle.length,
                "score": self.left_paddle.score,
            },
        }))

    @database_sync_to_async
    def auhtnticate_jwt(self, jwt):
        try:
            token_backend = TokenBackend(algorithm='HS256', signing_key=settings.SIMPLE_JWT['SIGNING_KEY'])
            validated_token = token_backend.decode(jwt, verify=True)
            logger.info(f'validated_token= {validated_token}')
            user_id = validated_token['user_id']
            username = validated_token['username']
            players_id = validated_token['players_id']
            match_id = validated_token['match_id']
            logger.info(f'authenticate_jwt: user_id={user_id}, username={username}, players_id={players_id}, match_id={match_id}')
            return players_id, username, match_id
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
            logger.info(f'Checking if player_id:{players_id} is in the match with player1:{player1_id} or player2:{player2_id}')
            return players_id in [player1_id, player2_id]
        except Exception as e:
            logger.error(f'Error: is_user_in_match {str(e)}')
            return False
    
    async def start_game(self):
        logger.info(f'Starting game for match_id {self.match_id}')
        await self.send(text_data=json.dumps({
            'type': 'startGame',
            'message': 'The pong match is starting!'
        }))
        # return # これを消すとゲームが始まります
        # クライアント側でonopenが発火したらループを開始する
        self.is_active = True
        if not self.ready:
            self.ready = True
            self.scheduled_task = asyncio.create_task(self.schedule_ball_update())
            
