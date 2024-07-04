FROM debian:bullseye

RUN apt-get update && apt-get install -y \
	nginx \
	openssl \
	netcat-traditional

COPY tools/nginx.conf /etc/nginx/
COPY tools/ssl.conf ssl.conf
COPY tools/test_ssl.conf test_ssl.conf

COPY tools/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

CMD [ "nginx", "-g", "daemon off;" ]
ENTRYPOINT [ "docker-entrypoint.sh" ]
