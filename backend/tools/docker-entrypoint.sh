#!/bin/bash

echo "Waiting for PostgreSQL to start..."
for i in {60..0}; do
    if pg_isready -h db -p 5432 -U $POSTGRES_USER; then
        echo "PostgreSQL is ready"
        break;
    fi
    if [ "$i" -eq 0 ]; then
        echo "Error: PostgreSQL is not ready within expected time."
        exit 1
    fi
    sleep 1
    echo "wait counter: $i"
done

python manage.py makemigrations
python manage.py migrate

echo "Collecting static files..."
python manage.py collectstatic --noinput

superuser_exists=$(python manage.py shell << END
from django.contrib.auth import get_user_model

User = get_user_model()
superuser_exists = User.objects.filter(username='$DJANGO_SU_USER', is_superuser=True).exists()

print(superuser_exists)
END
)

# userの作成
echo """
from django.contrib.auth import get_user_model
User = get_user_model()

superuser_exists = User.objects.filter(username='$DJANGO_SU_USER', is_superuser=True).exists()
if not superuser_exists:
    User.objects.create_superuser('$DJANGO_SU_USER', '$DJANGO_SU_MAIL', '$DJANGO_SU_PASSWORD')
""" | python manage.py shell

if [ "$superuser_exists" = "False" ]; then
    export PGPASSWORD=$DB_PASSWORD
    psql -h db -p 5432 -U $POSTGRES_USER -d $DB_NAME -f /usr/local/bin/user_dummy.sql
    psql -h db -p 5432 -U $POSTGRES_USER -d $DB_NAME -f /usr/local/bin/player_dummy.sql
    unset PGPASSWORD
fi

# user0〜user${n}をsqlから連番で作成し、range(1, n)に対しパスワード指定。
# user0がpassword設定済みなら全員設定済みとみなす

echo """
from django.contrib.auth import get_user_model

User = get_user_model()
password = '$DJANGO_PLAYER1_PASSWORD'

try:
    user0 = User.objects.get(username='testplayer0')
    if user0.password == '':
        for i in range(0, 56):
            username = f'testplayer{i}'
            try:
                user = User.objects.get(username=username)
                if user.password == '':
                    user.set_password(password)
                    user.save()
                    print(f'Password for {username} set successfully.')
                else:
                    print(f'Password for {username} is already set.')
            except User.DoesNotExist:
                print(f'User {username} does not exist.')
    else:
        print(f'User testplayer0 has a usable password.')
except User.DoesNotExist:
    print(f'User testplayer0 does not exist.')
""" | python manage.py shell

if [ "$superuser_exists" = "False" ]; then
    python manage.py random_friend
    python manage.py gen_dummy_match
fi

exec "$@"