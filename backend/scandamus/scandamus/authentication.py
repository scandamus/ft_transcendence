from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.models import AnonymousUser
import os
import logging

logger = logging.getLogger(__name__)

# pong-serverからの接続を認証なしで通すクラス
class InternalNetworkAuthentication(BaseAuthentication):
    def __init__(self):
        logger.debug("InternalNetworkAuthentication initialized")

    def authenticate(self, request):
        allowed_hosts = ['pong-server', 'backend', 'backend:8001']

#        host_name =request.get_host()
        host_name = request.META.get('HTTP_HOST', '')
        logger.info(f'Hostname: {host_name}')
        logger.info(f'Allowd hosts: {allowed_hosts}')

        if any(allowed_host in host_name for allowed_host in allowed_hosts):
            logger.info(f'Request from allowd host: {host_name}')
            return (AnonymousUser(), None)
        
        #ip_addr = request.META.get('REMOTE_ADDR')
        #if host_name in allowed_hosts:
        #    return (None, None)

        logger.info(f'Request from unauthorized host: {host_name}')
        return None
