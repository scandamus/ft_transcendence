from django.urls import re_path
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from . import consumers

game_websocket_urlpatterns = [
    re_path(r'^ws/lounge/$', consumers.LoungeSession.as_asgi()),
]