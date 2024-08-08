import requests
from urllib.parse import parse_qsl

from django.utils.http import urlencode

from allauth.socialaccount.adapter import get_adapter

import logging
logger = logging.getLogger(__name__)

class OAuth2Error(Exception):
    pass


class OAuth2Client:
    client_id_parameter = "client_id"

    def __init__(
        self,
        request,
        consumer_key,
        consumer_secret,
        access_token_method,
        access_token_url,
        callback_url,
        scope_delimiter=" ",
        headers=None,
        basic_auth=False,
    ):
        self.request = request
        self.access_token_method = access_token_method
        self.access_token_url = access_token_url
        self.callback_url = callback_url
        self.consumer_key = consumer_key
        self.consumer_secret = consumer_secret
        self.scope_delimiter = scope_delimiter
        self.state = None
        self.headers = headers
        self.basic_auth = basic_auth

    def get_redirect_url(self, authorization_url, scope, extra_params):
        logger.info(f'/////get_redirect_url')
        scope = self.scope_delimiter.join(set(scope))
        params = {
            self.client_id_parameter: self.consumer_key,
            "redirect_uri": self.callback_url,
            "scope": scope,
            "response_type": "code",
        }
        if self.state:
            params["state"] = self.state
        params.update(extra_params)
        return "%s?%s" % (authorization_url, urlencode(params))


    def _strip_empty_keys(self, params):
        """Added because the Dropbox OAuth2 flow doesn't
        work when scope is passed in, which is empty.
        """
        keys = [k for k, v in params.items() if v == ""]
        for key in keys:
            del params[key]
