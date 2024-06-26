from django.urls import re_path

from . import consumers

pong4_websocket_urlpatterns = [
    re_path(r"ws/pong4/(?P<match_id>\w+)/$", consumers.PongConsumer.as_asgi()),
]
