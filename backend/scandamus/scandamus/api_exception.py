from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404
import logging

logger = logging.getLogger(__name__)

def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    
    logger.error(f'Exception: {str(exc)}, Context: {context}')

    if isinstance(exc, Http404):
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

    if response is not None:
        response.data = {
            'message': response.data.get('detail', 'An error occured')
        }
        if 'status_code' in response.data:
            del response.data['status_code']
        if 'detail' in response.data:
            del response.data['detail']        
    else:
        response = Response({'message': 'An unexpected error occured', 'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    return response