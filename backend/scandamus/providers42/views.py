from django.http import JsonResponse
from django.conf import settings
import urllib.parse
import random
import string
from allauth.socialaccount.providers.oauth2.views import OAuth2Adapter, OAuth2LoginView, OAuth2CallbackView
from django.contrib.sites import requests
from django.urls import reverse
from .provider import FortyTwoProvider
from django.shortcuts import redirect


class FortyTwoOAuth2Adapter(OAuth2Adapter):
    provider_id = FortyTwoProvider.id
    # access_token_url = 'https://api.intra.42.fr/oauth/token'
    # authorize_url = 'https://api.intra.42.fr/oauth/authorize'
    # profile_url = 'https://api.intra.42.fr/v2/me'

    def complete_login(self, request, app, token, **kwargs):
        headers = {'Authorization': f'Bearer {token.token}'}
        extra_data = requests.get(self.profile_url, headers=headers).json()
        return self.get_provider().sociallogin_from_response(request, extra_data)


def generate_state(length=32):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))


def get_authorize42_url(request):
    # redirect_uri = request.build_absolute_uri(reverse('fortytwo_callback'))
    response_type = 'code'
    scope = 'public'
    state = generate_state()

    authorize_url = (
        f"{settings.URL_AUTHORIZE_42}?client_id={settings.UID_42}"
        f"&redirect_uri={urllib.parse.quote('https://localhost')}"
        f"&response_type={response_type}"
        f"&scope={scope}"
        f"&state={state}"
    )
    return JsonResponse({'authorize_url': authorize_url})
