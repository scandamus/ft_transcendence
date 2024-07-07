FROM python:3.12 AS base

RUN apt-get update && \
    apt-get install -y netcat-traditional postgresql-client && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY tools/requirements.txt .
RUN pip install -r requirements.txt

# backend container
FROM base AS backend

COPY tools/docker-entrypoint.sh /usr/local/bin/
COPY tools/user_dummy.sql /usr/local/bin/
COPY tools/player_dummy.sql /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT [ "/usr/local/bin/docker-entrypoint.sh" ]
CMD [ "python", "manage.py", "runserver", "0.0.0.0:8001" ]

# celery container
FROM base AS celery

COPY tools/docker-entrypoint-waitonly.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint-waitonly.sh

ENTRYPOINT [ "/usr/local/bin/docker-entrypoint-waitonly.sh" ]
CMD ["celery", "-A", "scandamus", "worker", "--loglevel=info"]

# celery-beat constainer
FROM base AS celery-beat

COPY tools/docker-entrypoint-waitonly.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint-waitonly.sh

ENTRYPOINT [ "/usr/local/bin/docker-entrypoint-waitonly.sh" ]
CMD ["celery", "-A", "scandamus", "beat", "--loglevel=info"]