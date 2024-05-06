#!/bin/sh

echo "Waiting for progreSQL booting..."
for i in {30..0}; do
    if nc -z db 5432; then
        echo "db OK"
	    break;
    fi
    sleep 1
done

python manage.py makemigrations
python manage.py migrate

# userの作成
echo """
from django.contrib.auth import get_user_model
User = get_user_model()

superuser_exists = User.objects.filter(username='$DJANGO_SU_USER').exists()
if not superuser_exists:
    User.objects.create_superuser('$DJANGO_SU_USER', '$DJANGO_SU_MAIL', '$DJANGO_SU_PASSWORD')

player1_exists = User.objects.filter(username='$DJANGO_PLAYER1_USER').exists()
if not player1_exists:
    User.objects.create_user('$DJANGO_PLAYER1_USER', '$DJANGO_PLAYER1_MAIL', '$DJANGO_PLAYER1_PASSWORD')

player2_exists = User.objects.filter(username='$DJANGO_PLAYER2_USER').exists()
if not player2_exists:
    User.objects.create_user('$DJANGO_PLAYER2_USER', '$DJANGO_PLAYER2_MAIL', '$DJANGO_PLAYER2_PASSWORD')
""" | python manage.py shell

exec "$@"