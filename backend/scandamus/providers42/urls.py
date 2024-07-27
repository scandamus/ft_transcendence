from django.urls import include, path
from allauth.socialaccount.providers.oauth2.views import OAuth2LoginView, OAuth2CallbackView

from .provider import FortyTwoProvider
from .views import FortyTwoOAuth2Adapter, get_authorize42_url

oauth2_login = OAuth2LoginView.adapter_view(FortyTwoOAuth2Adapter)
oauth2_callback = OAuth2CallbackView.adapter_view(FortyTwoOAuth2Adapter)

urlpatterns = [
    # path('login/', oauth2_login, name=FortyTwoProvider.id + '_login'),
    path('authorize42/', get_authorize42_url, name='get_authorize42_url'),
    # path('callback/', oauth2_callback, name=FortyTwoProvider.id + '_callback'),
]
