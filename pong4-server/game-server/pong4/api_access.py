import requests
import logging

logger = logging.getLogger(__name__)

def get_match_from_api(match_id):
    try:
        logger.info(f'get_match_from_api: start')
        response = requests.get(f'http://backend:8001/api-internal/game/match/{match_id}/')
        response.raise_for_status()
        logger.info(f'API response: {response.json()}')
        return response.json()
    except requests.exceptions.HTTPError as e:
        logger.error('HTTP Errpr: ', e)
    except requests.exceptions.ConnectionError as e:
        logger.error('Error Connecting: ', e)
    except requests.exceptions.Timeout as e:
        logger.error('Error Timeout: ', e)
    except requests.exceptions.RequestException as e:
        logger.error('Error: ', e)
    return None