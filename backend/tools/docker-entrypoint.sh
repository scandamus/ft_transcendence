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

exec "$@"