import json
import asyncio

from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer
from datetime import datetime as dt
from .game_logic import Paddle, Ball

import logging

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
        self.room_name = None
        self.room_group_name = None

    async def connect(self):
        try:
            self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
            self.room_group_name = f"pong_{self.room_name}"
            logger.info(f"Room name: {self.room_name}, Room group name: {self.room_group_name}")
            await self.channel_layer.group_add(
                self.room_group_name, self.channel_name
            )

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
