FROM debian:bullseye

RUN apt-get update && apt-get install -y \
	nginx \
	openssl

COPY tools/nginx.conf /etc/nginx/
COPY tools/ssl.conf /etc/nginx/sites-available/default

COPY tools/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

CMD [ "nginx", "-g", "daemon off;" ]
ENTRYPOINT [ "docker-entrypoint.sh" ]
