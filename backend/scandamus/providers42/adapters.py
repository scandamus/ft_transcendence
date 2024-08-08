import requests
from allauth.socialaccount.providers.oauth2.views import OAuth2Adapter
from .provider import FortyTwoProvider
from django.conf import settings

import logging
logger = logging.getLogger(__name__)


class FortyTwoOAuth2Adapter(OAuth2Adapter):
    provider_id = FortyTwoProvider.id

    def complete_login(self, request, app, token, **kwargs):
        headers = {'Authorization': f'Bearer {token.token}'}
        resp = requests.get(settings.URL_PROFILE_42, headers=headers)
        resp.raise_for_status()
        extra_data = resp.json()
        return self.get_provider().sociallogin_from_response(request, extra_data)

    def get_access_token(self, request, code):
        payload = {
            'grant_type': 'authorization_code',
            'client_id': settings.UID_42,
            'client_secret': settings.SECRET_KEY_42,
            'code': code,
            'redirect_uri': settings.URL_AUTH_REDIRECT_42,
        }
        response = requests.post(settings.URL_ACCESS_TOKEN_42, data=payload)
        response.raise_for_status()
        return response.json()