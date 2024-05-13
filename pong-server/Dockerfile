FROM python:3.12

RUN apt-get update && apt-get install -y netcat-traditional
WORKDIR /app
COPY tools/requirements.txt .
RUN pip install -r requirements.txt

COPY game-server /app/

# 環境変数を設定
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

CMD [ "python", "manage.py", "runserver", "0.0.0.0:8002" ]