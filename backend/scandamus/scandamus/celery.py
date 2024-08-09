import os
from celery import Celery
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scandamus.settings')

app = Celery('scandamus')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.conf.broker_url = os.environ.get('CELERY_BROKER_URL', 'redis://redis:6379/0')
app.conf.result_backend = os.environ.get('CELERY_RESULT_BACKEND', 'redis://redis:6379/0')
app.conf.broker_connection_retry_on_startup = True

app.conf.beat_schedule = {
    'check_tournament_start_times': {
        'task': 'game.tasks.check_tournament_start_times',
        'schedule': 60.0,
    },
    'check_matches_for_timeout': {
        'task': 'game.tasks.check_matches_for_timeout',
        'schedule': 60.0,
    },
}

# app.autodiscover_tasks()
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)