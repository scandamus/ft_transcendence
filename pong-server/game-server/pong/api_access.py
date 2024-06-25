import requests
import logging

logger = logging.getLogger(__name__)


def get_match_from_api(storage_token, match_id):
    response = None
    try:
        logger.info(f'get_match_from_api: start')
        logger.info(f'sent jwt_token in pong ->  {storage_token}')
        headers = {
            'Authorization': f'Bearer {storage_token}',
        }
        response = requests.get(f'http://backend:8001/api/game/match/{match_id}/', headers=headers)
        response.raise_for_status()
        logger.info(f'API response: {response.json()}')
        return response.json()
    except requests.exceptions.HTTPError as e:
        logger.info(f'API response: {response.json()}')
        logger.error('HTTP Error: %s', e)
    except requests.exceptions.ConnectionError as e:
        logger.info(f'API response: {response.json()}')
        logger.error('Error Connecting: %s', e)
    except requests.exceptions.Timeout as e:
        logger.info(f'API response: {response.json()}')
        logger.error('Error Timeout: %s', e)
    except requests.exceptions.RequestException as e:
        logger.info(f'API response: {response.json()}')
        logger.error('Error: %s', e)
    return None


def patch_match_to_api(storage_token, match_id, send_data):
    try:
        url = f'http://backend:8001/api/game/match/{match_id}/'
        logger.info(f'patch_match_to_api: start')
        headers = {
            'Authorization': f'Bearer {storage_token}',
        }
        response = requests.patch(url, json=send_data, headers=headers)
        response.raise_for_status()
        logger.info(f'API response: {response.json()}')
    except requests.exceptions.HTTPError as e:
        logger.error('HTTP Error: %s', e)
    except requests.exceptions.ConnectionError as e:
        logger.error('Error Connecting: %s', e)
    except requests.exceptions.Timeout as e:
        logger.error('Error Timeout: %s', e)
    except requests.exceptions.RequestException as e:
        logger.error('Error: %s', e)
