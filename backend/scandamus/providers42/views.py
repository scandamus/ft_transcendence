import json

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
    logger.info(f'/////list_social_apps')
    apps = SocialApp.objects.all()
    for app in apps:
        logger.info(f'App Name: {app.name}, Provider: {app.provider}')



@csrf_exempt
def exchange_token42(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        code = data.get('code')
        state = data.get('state')

        if not code or not state:
            return JsonResponse({'error': 'Missing code or state'}, status=400)
        adapter = FortyTwoOAuth2Adapter(request)
        provider_name = 'providers42'
        # list_social_apps()
        social_apps = SocialApp.objects.filter(provider=provider_name)

        if not social_apps.exists():
            logger.error(f'No SocialApp found for provider: {provider_name}')
            return JsonResponse({'error': 'No SocialApp found for provider'}, status=404)

        app = social_apps.first()
        token_data = adapter.get_access_token(request, code)
        access_token = token_data.get('access_token')

        headers = {'Authorization': f'Bearer {access_token}'}
        response = get('https://api.intra.42.fr/v2/me', headers=headers)
        response.raise_for_status()
        user_info = response.json()

        login_name = user_info.get('login')
        avatar_url = user_info.get('image').get('link')

        # todo: username重複時
        user, created = User.objects.get_or_create(username=login_name)
        if created:
            player = Player.objects.get(user=user)
            if player:
                response = requests.get(avatar_url)
                response.raise_for_status()

                image_data = BytesIO(response.content)
                file_name = f'{login_name}.jpg'
                # todo: _resize_avatar
                image_file = InMemoryUploadedFile(image_data, 'ImageField', file_name, 'image/jpeg', len(response.content), None)
                player.avatar.save(file_name, image_file, save=True)

        social_account, _ = SocialAccount.objects.get_or_create(user=user, provider='providers42')
        # todo: 取得したuser_info不要か確認
        # social_account.extra_data = user_info
        # social_account.save()

        refresh = RefreshToken.for_user(user)
        if refresh:
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            return JsonResponse({
                'access_token': access_token,
                'refresh_token': refresh_token,
            })
        return JsonResponse({'error': 'Token generation failed'}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)