import json
import asyncio
import logging

from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from datetime import datetime as dt
from .game_logic import Paddle, Ball
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from game.models import Match
#from .models import Match

logger = logging.getLogger(__name__)

CANVAS_WIDTH = 600
CANVAS_HEIGHT = 300

# 非同期通信を実現したいのでAsyncWebsocketConsumerクラスを継承
class PongConsumer(AsyncWebsocketConsumer):
    players = 0
    scheduled_task = None
    paddle1 = Paddle(CANVAS_WIDTH - 10, (CANVAS_HEIGHT - 75) / 2, 75, 10)
    paddle2 = Paddle(0, (CANVAS_HEIGHT - 75) / 2, 75, 10)
    ball = Ball(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 10)
    is_active = False
    ready = False

    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.match_id = None
        self.room_group_name = None
        self.authenticated = False

    async def connect(self):
        try:
            # URLからmatch_idを取得
            self.match_id = self.scope["url_route"]["kwargs"].get("match_id")
            if not self.match_id:
                logger.error(f"Match ID is missing in URL path: {self.match_id}")
                await self.close(code=4200)
                return
            logger.info('match_id exists')
            
            # データベースと照合
            match = await self.get_match(self.match_id)
            if not match:
                logger.error(f'No match found with match iD: {self.match_id}')
                await self.close(code=4201)
                return
            logger.info('match_id available in DB')

            # # ユーザーチェック
            # user = self.scope['user']
            # if user.is_anonymous:
            #     logger.error('Error Anonymous user')
            #     await self.close(code=4202)
            #     return
            # if not await self.is_user_in_match(user, match):
            #     logger.error(f'Error user not a paticipant in this match {match.match_id}')
            #     await self.close(code=4203)
            #     return

            # self.room_group_name = f"pong_{self.match_id}"
            # logger.info(f"Match ID: {self.match_id}, Room group name: {self.room_group_name}")
            # await self.channel_layer.group_add(
            #     self.room_group_name, self.channel_name
            # )
            await self.accept()

            # クライアント側でonopenが発火したらループを開始する
            self.is_active = True
            if not self.ready:
                self.ready = True
                self.scheduled_task = asyncio.create_task(self.schedule_ball_update())

        except Exception as e:
            logger.error(f"Error connecting: {e}")

    async def disconnect(self, close_code):
        # Leave room group
        self.is_active = False
        if self.scheduled_task:
            self.scheduled_task.cancel()
        await self.channel_layer.group_discard(
            self.room_group_name, self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data=None, bytes_data=None):
        if not self.authenticated:
            await self.handle_token_message(text_data)
        else:
            await self.handle_game_message(text_data)

    async def handle_token_message(self, text_data):
        text_data_json = json.loads(text_data)
        token = text_data_json.get('token')
        logger.info(f'handle_token_message in {text_data_json}')
        if token:
            user = await self.authenticate_token(token)
            if user:
                self.authenticated = True
                logger.info(f'User authenticated {user.username}')

                match = await self.get_match(self.match_id)
                if match and await self.is_user_in_match(user, match):
                    logger.info(f'User {user.username} is in match {self.match_id}')
                    self.room_group_name = f"pong_{self.match_id}"
                    logger.info(f"Match ID: {self.match_id}, Room group name: {self.room_group_name}")
                    await self.channel_layer.group_add(self.room_group_name, self.channel_name)
                else:
                    logger.error(f'Error user not a paticipant in this match {match.id}')
                    await self.close(code=4201)
            else:
                logger.error(f'Error user authentication')
                await self.close(code=4202)
        else:
            logger.error(f'Error token error')
            await self.close(code=4202)

    async def handle_game_message(self, text_data):
        text_data_json = json.loads(text_data)
        # token = text_data_json.get('token')
        # if token:
        #     logger.info("checking received token")
        #     if await self.authenticate_token(token):
        #         await self.channel_layer.group_add(
        #             self.room_group_name,
        #             self.channel_name
        #         )
        #         logger.info('Authenticated')
        #         return
        #     else:
        #         logger.info('Authenticatin failed')
        #         await self.close()
        #         return
        # if not self.user:
        #     await self.close()
        #     return
        

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

    # Receive message from room group
    async def pong_message(self, data):
        timestamp = data["timestamp"]
        message = data["message"]
        key = data.get('key')
        is_pressed = data.get('is_pressed', False)

        # キー入力によってパドルを操作
        if key and is_pressed:
            if key == "ArrowUp":
                self.paddle1.speed = -10
            elif key == "ArrowDown":
                self.paddle1.speed = 10
            elif key == "w":
                self.paddle2.speed = -10
            elif key == "s":
                self.paddle2.speed = 10
        else:
            if key == "ArrowUp":
                self.paddle1.speed = 0
            elif key == "ArrowDown":
                self.paddle1.speed = 0
            elif key == "w":
                self.paddle2.speed = 0
            elif key == "s":
                self.paddle2.speed = 0

        # Send message to WebSocket
        # await self.send_game_data(True, message=message, timestamp=timestamp)

    async def schedule_ball_update(self):
        try:
            while self.is_active:
#                await asyncio.sleep(0.05)  # 50ミリ秒待機
                await asyncio.sleep(1/60)  # 60Hz
                await self.update_ball_and_send_data()
        except asyncio.CancelledError:
            # タスクがキャンセルされたときのエラーハンドリング
            # 今は特に書いていないのでpass
            pass

    async def update_ball_and_send_data(self):
        self.paddle1.move("", CANVAS_HEIGHT)
        self.paddle2.move("", CANVAS_HEIGHT)
        self.is_active = self.ball.move(self.paddle1, self.paddle2, CANVAS_WIDTH, CANVAS_HEIGHT)
        await self.channel_layer.group_send(self.room_group_name, {
            "type": "ball.message",
            "message": "update_ball_pos",
            "timestamp": dt.utcnow().isoformat(),
        })

    async def ball_message(self, data):
        message = data["message"]
        timestamp = data["timestamp"]
        await self.send_game_data(game_status=self.is_active, message=message, timestamp=timestamp)

    async def send_game_data(self, game_status, message, timestamp):
        await self.send(text_data=json.dumps({
            "message": message + f'\n{timestamp}\n\n',
            "game_status": game_status,
            "ball": {
                "x": self.ball.x,
                "y": self.ball.y,
                "dx": self.ball.dx,
                "dy": self.ball.dy,
                "radius": self.ball.radius,
            },
            "paddle1": {
                "x": self.paddle1.x,
                "y": self.paddle1.y,
                "width": self.paddle1.width,
                "height": self.paddle1.height
            },
            "paddle2": {
                "x": self.paddle2.x,
                "y": self.paddle2.y,
                "width": self.paddle2.width,
                "height": self.paddle2.height
            },
        }))

    @database_sync_to_async
    def authenticate_token(self, token):
        try:
            decoded_data = AccessToken(token)
            user = User.objects.get(id=decoded_data['user_id'], is_active=True)
            return user
        except (TokenError, InvalidToken, User.DoesNotExist) as e:
            logger.error(f"Authenticatioin failed: {e}")
            return None
        
    @database_sync_to_async
    def get_match(self, match_id):
        try:
            return Match.objects.get(id=match_id)
        except Match.DoesNotExist:
            return None
    
    @database_sync_to_async
    def is_user_in_match(self, user, match):
        result = user == match.player1.user or user == match.player2.user
        logger.debug(f'Checking if user {user.username} (id: {user.id}) is in match {match.id}: {result}')
        logger.debug(f'user.id: {user.id}, match.player1.id: {match.player1.id}, match.player2.id: {match.player2.id}')
        logger.debug(f'match.player1.user.id: {match.player1.user.id}, match.player2.user.id: {match.player2.user.id}')
        return result