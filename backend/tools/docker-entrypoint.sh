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

# superuserの作成
#echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('$DJANGO_SU_USER', '$DJANGO_SU_MAIL', '$DJANGO_SU_PASSWORD') if not User.objects.filter(username='$DJANGO_SUPERUSER_USERNAME').exists() else None" | python manage.py shell

exec "$@"