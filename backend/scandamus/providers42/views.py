import json
import asyncio

from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.conf import settings
import urllib.parse
import random
import string
from requests import get
from django.views.decorators.csrf import csrf_exempt
from allauth.socialaccount.models import SocialApp
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.db import transaction
from players.models import Player
from allauth.socialaccount.models import SocialAccount
from rest_framework.authtoken.models import Token
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .adapters import FortyTwoOAuth2Adapter

import requests
from io import BytesIO
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.core.files.base import ContentFile
from players.player_utils import resize_avatar
from asgiref.sync import async_to_sync, sync_to_async
from channels.layers import get_channel_layer

#
# from django.urls import reverse
#
# from django.shortcuts import redirect
# from urllib.parse import urlencode
import logging
logger = logging.getLogger(__name__)

def generate_state(length=32):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))


def get_authorize42_url(request):
    # redirect_uri = request.build_absolute_uri(reverse('fortytwo_callback'))
    response_type = 'code'
    scope = 'public'
    state = generate_state()

    authorize_url = (
        f"{settings.URL_AUTHORIZE_42}?client_id={settings.UID_42}"
        f"&redirect_uri={urllib.parse.quote(settings.URL_AUTH_REDIRECT_42)}"
        f"&response_type={response_type}"
        f"&scope={scope}"
        f"&state={state}"
    )
    return JsonResponse({'authorize_url': authorize_url})


def list_social_apps():
    apps = SocialApp.objects.all()
    for app in apps:
        logger.info(f'App Name: {app.name}, Provider: {app.provider}')


def generate_unique_username(base_username):
    username_max_length = 32
    generate_random_username_max_attempt = 256

    def generate_random_suffix(length=6):
        return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

    if not User.objects.filter(username=base_username).exists():
        return base_username

    suffix = '42'
    base_username_with_suffix = f"{base_username}{suffix}"
    if not User.objects.filter(username=base_username_with_suffix).exists():
        return base_username_with_suffix

    count = 0
    while count < generate_random_username_max_attempt:
        candidate_username = f"{base_username[:username_max_length - 9]}42_{generate_random_suffix()}"
        if len(candidate_username) <= username_max_length and not User.objects.filter(username=candidate_username).exists():
            return candidate_username
        count += 1

    raise Exception("NoUsernamesAvailable")


async def notify_new_login(player_id):
    channel_layer = get_channel_layer()
    await channel_layer.group_send(
        f'friends_{player_id}',
        {
            'type': 'disconnect_by_new_login',
        }
    )

async def wait_for_old_ws_disconnect(player_id):
    max_wait_time = 5
    wait_interval = 0.1
    elapsed_time = 0

    while elapsed_time < max_wait_time:
        player = await sync_to_async(Player.objects.get)(id=player_id)
        if not player.online:
            break
        await asyncio.sleep(wait_interval)
        elapsed_time += wait_interval

    if elapsed_time >= max_wait_time:
        player.online = False
        sync_to_async(player.save)(update_fields=['online'])
        logger.info(f'//-- player save() on: wait_for_old_ws_disconnect')

@csrf_exempt
def exchange_token42(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        code = data.get('code')
        state = data.get('state')

        if not code or not state:
            return JsonResponse({'error': 'Missing code or state'}, status=400)
        provider_name = 'providers42'
        # list_social_apps()
        social_apps = SocialApp.objects.filter(provider=provider_name)

        if not social_apps.exists():
            logger.error(f'No SocialApp found for provider: {provider_name}')
            return JsonResponse({'error': 'No SocialApp found for provider'}, status=404)

        app = social_apps.first()
        adapter = FortyTwoOAuth2Adapter(request)
        token_data = adapter.get_access_token(request, code)
        access_token = token_data.get('access_token')

        headers = {'Authorization': f'Bearer {access_token}'}
        response = get('https://api.intra.42.fr/v2/me', headers=headers)
        response.raise_for_status()
        user_info = response.json()

        login_name = user_info.get('login')
        avatar_url = user_info.get('image').get('link')

        try:
            with transaction.atomic():
                # 42login存在確認
                social_account = SocialAccount.objects.filter(uid=login_name, provider='providers42').first()
                # 存在していればログインするだけ。
                if social_account:
                    user = social_account.user
                # 存在していない=>playerID重複チェックしてアカウント作成
                else:
                    player_name = generate_unique_username(login_name)
                    user = User.objects.create(username=player_name)

                    social_account = SocialAccount.objects.create(user=user, provider='providers42')
                    social_account.uid = login_name
                    social_account.save()

                    player = Player.objects.get(user=user)
                    if player:
                        response = requests.get(avatar_url)
                        response.raise_for_status()

                        image_data = BytesIO(response.content)
                        file_name = f'{player_name}.jpg'
                        image_file = InMemoryUploadedFile(image_data, 'ImageField', file_name, 'image/jpeg', len(response.content), None)
                        if image_file:
                            resized_avatar = resize_avatar(image_file)
                            player.avatar.save(file_name, resized_avatar)

        except Exception as e:
            logger.error(f"Exception occurred: {e}")
            return JsonResponse({'error': str(e)}, status=400)

        refresh = RefreshToken.for_user(user)
        if refresh:
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            if access_token and refresh_token:
                player = Player.objects.get(user=user)
                async_to_sync(notify_new_login)(player.id)
                async_to_sync(wait_for_old_ws_disconnect)(player.id)

                return JsonResponse({
                    'access_token': access_token,
                    'refresh_token': refresh_token,
                })
        return JsonResponse({'error': 'Token generation failed'}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)
