#!/bin/bash

chown -R www-data:www-data /var/www

if [ ! -f $CERTS ]; then
    echo "Making certs directory..."
    mkdir -p $CERTS
fi

if [ ! -f /etc/nginx/ssl/server.key ] || [ ! -f /etc/nginx/ssl/server.crt ]; then
    echo "Generating self-signed certificate..."
    echo "[req]" > config.tmp
	echo "distinguished_name=req_distinguished_name" >> config.tmp
	echo "x509_extensions = v3_ca" >> config.tmp
	echo "prompt = no" >> config.tmp
	echo "[req_distinguished_name]" >> config.tmp
	echo "C = $COUNTRY" >> config.tmp
	echo "ST = $STATE" >> config.tmp
	echo "L = $LOCALITY" >> config.tmp
	echo "O = $ORGANIZATION" >> config.tmp
	echo "OU = $ORGANIZATION_UNIT" >> config.tmp
	echo "CN = $DOMAIN_NAME" >> config.tmp
	echo "emailAddress = $EMAIL" >> config.tmp
	echo "[alt_names]" >> config.tmp
	echo "DNS.1 = $DOMAIN_NAME" >> config.tmp
	echo "DNS.2 = www.$DOMAIN_NAME" >> config.tmp
	echo "DNS.3 = secret.$DOMAIN_NAME" >> config.tmp
	echo "[v3_ca]" >> config.tmp
	echo "subjectKeyIdentifier=hash" >> config.tmp
	echo "authorityKeyIdentifier=keyid:always,issuer" >> config.tmp
	echo "basicConstraints = critical,CA:true" >> config.tmp
	echo "keyUsage = critical, digitalSignature, cRLSign, keyCertSign" >> config.tmp
	echo "subjectAltName = @alt_names" >> config.tmp
    openssl req -newkey rsa:2048 -x509 -nodes -days 365 -keyout /etc/nginx/ssl/server.key -out /etc/nginx/ssl/server.crt -config config.tmp
fi

echo "Waiting for backend booting..."
for i in {30..0}; do
    if nc -z backend 8001; then
        echo "backend OK"
	    break;
    fi
    if [ $i -eq 0 ]; then
        echo "bakcend not reachable"
        exit 1
    fi
    sleep 1
done

echo "Waiting for pong-server booting..."
for i in {30..0}; do
    if nc -z pong-server 8002; then
        echo "pong-server OK"
	    break;
    fi
	if [ $i -eq 0 ]; then
        echo "pong-server not reachable"
        exit 1
    fi
    sleep 1
done

echo "Waiting for pong4-server booting..."
for i in {30..0}; do
    if nc -z pong4-server 8003; then
        echo "pong4-server OK"
	    break;
    fi
	if [ $i -eq 0 ]; then
        echo "pong4-server not reachable"
        exit 1
    fi
    sleep 1
done

exec "$@"