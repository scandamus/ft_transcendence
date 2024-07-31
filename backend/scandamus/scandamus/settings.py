"""
Django settings for scandamus project.

Generated by 'django-admin startproject' using Django 5.0.4.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.0/ref/settings/
"""

import os
from pathlib import Path
from django.core.exceptions import ImproperlyConfigured
from timedelta import datetime
from corsheaders.defaults import default_headers

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

def get_env_var(var):
    try:
        return os.environ[var]
    except KeyError:
        error_msg = f'Error: {var} is not set in .env/docker-compose.yml'
        raise ImproperlyConfigured(error_msg)

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = get_env_var('BACKEND_SECRET_KEY')
CHANNEL_SECRET_KEY = get_env_var('CHANNEL_SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = get_env_var('DEBUG')
CREATE_TOURNAMENT_TIMELIMIT_MIN = get_env_var('CREATE_TOURNAMENT_TIMELIMIT_MIN')
UID_42 = get_env_var('UID_42')
SECRET_KEY_42 = get_env_var('SECRET_KEY_42')
URL_AUTHORIZE_42 = get_env_var('URL_AUTHORIZE_42')
URL_ACCESS_TOKEN_42 = get_env_var('URL_ACCESS_TOKEN_42')
URL_PROFILE_42 = get_env_var('URL_PROFILE_42')
URL_AUTH_REDIRECT_42 = get_env_var('URL_AUTH_REDIRECT_42')
FRIENDS_MAX = get_env_var('FRIENDS_MAX')

# SERVER HOST
SERVER_HOST = get_env_var('DOMAIN_NAME')
ALLOWED_HOSTS = ['backend', 'frontend', 'pong-server', SERVER_HOST, 'localhost', '127.0.0.1', '[::1]']

# Application definition
INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    "rest_framework_simplejwt",
    'rest_framework_simplejwt.token_blacklist',
    'channels',
    'players.apps.PlayersConfig',
    'game.apps.GameConfig',
#    'game',
    'django_celery_beat',
    'django_celery_results',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.oauth2',
    'providers42',
]


MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # 'django.middleware.csrf.CsrfViewMiddleware', DRFでは直接APIにPOSTアクセスするので、CSRFはOFFにする
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware'
]

ROOT_URLCONF = 'scandamus.urls'

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    'http://localhost',
    'https://localhost',
    'http://localhost:80',
    'https://localhost:80',
    'https://localhost:443'
]

CSRF_TRUSTED_ORIGINS = ['https://localhost', 'https://127.0.0.1']

# クライアントからのリクエストヘッダーに含める項目をカスタマイズ
# CORS_ALLOW_HEADERS = list(default_headers) + [
#     'Refresh-Token',  # カスタムヘッダーを追加
# ]

CORS_ALLOW_METHODS = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'scandamus.authentication.InternalNetworkAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'players.auth.CustomJWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ]
}

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    # 'allauth.account.auth_backends.AuthenticationBackend',
)

#JWT_SECRET_KEY = get_env_var('SECRET_KEY')

SIMPLE_JWT = {
    'SIGNING_KEY': get_env_var('BACKEND_JWT_SIGNING_KEY'),
    'ALGORITHM': 'HS256',
    'ENCODE': 'utf-8',
    'ACCESS_TOKEN_LIFETIME': datetime.timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': datetime.timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True, # 期限切れなら自動でadcessTokenをrefreshする
    'BLACKLIST_AFTER_ROTATION': True, # 古いrefreshTokenを無効化
    'UPDATE_LAST_LOGIN': True,
}

GAME_JWT = {
    'ACCESS_TOKEN_LIFETIME': datetime.timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': datetime.timedelta(days=3),
    'SIGNING_KEY': get_env_var('GAME_JWT_SIGNING_KEY'),
    'ALGORITHM': 'HS256',
#    'AUDIENCE': '',
#    'ISSUER': 'pong-server'
}

SOCIALACCOUNT_PROVIDERS = {
    'providers42': {
        'APP': {
            'client_id': UID_42,
            'secret': SECRET_KEY_42,
            'key': ''
        }
    }
}

## ブラウザブルAPIレンダリングをOFFにする場合、下記を有効にする
# TRAILING_SLASH = False
#
# REST_FRAMEWORK = {
#     'DEFAULT_RENDERER_CLASSES': [
#         'rest_framework.renderers.JSONRenderer',
#         #
#         # 'rest_framework.renderers.BrowsableAPIRenderer',
#     ],
# }
## ここまで

WSGI_APPLICATION = 'scandamus.wsgi.application'

ASGI_APPLICATION = 'scandamus.asgi.application'

# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases
# We will use PostgreSQL though...

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': get_env_var('DB_NAME'),
        'USER': get_env_var('DB_USER'),
        'PASSWORD': get_env_var('DB_PASSWORD'),
        'HOST': 'db',
        'PORT': 5432
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = '/static/'
STATICFILES_DIRS = [
    BASE_DIR / "static",
]

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Log level
LOG_LEVEL = os.getenv('BACKEND_LOG_LEVEL', 'DEBUG')

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'level': LOG_LEVEL,
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': LOG_LEVEL,
            'propagate': False,
        },
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'WARNING',  # データベースのログを無視
            'propagate': False,
        },
        'scandamus' : {
            'handlers': ['console'],
            'level': LOG_LEVEL,
            'propagate': False,
        },
        'django.channels': {
            'handlers': ['console'],
            'level': LOG_LEVEL,
            'propagate': False,
        },
    },
}

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [('redis', 6379)],
            'symmetric_encryption_keys': [CHANNEL_SECRET_KEY],
            'expiry': 3600,
            'prefix': 'scandamus',
        },
    },
}

CELERY_IMPORTS = ['game.tasks']
