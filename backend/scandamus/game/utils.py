import jwt
from datetime import datetime, timedelta
from django.conf import settings

def generate_game_jwt(user):

    game_jwt_settings = settings.GAME_JWT
    payload = {
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(minutes=game_jwt_settings['ACCESS_TOKEN_LIFETIME'].minutes),
        'game_session': 'unique_session_id',
    }
    return jwt.encode(payload, game_jwt_settings['SIGNING_KEY'], algorithm=game_jwt_settings['ALGORITHM'])