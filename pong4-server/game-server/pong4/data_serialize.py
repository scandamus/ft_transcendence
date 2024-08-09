from .game_logic import Block

def serialize_transfer_data(consumer):
    return {
        'active_paddle_count': consumer.active_paddle_count,
        'left_paddle_is_active': consumer.left_paddle.is_active,
        'right_paddle_is_active': consumer.right_paddle.is_active,
        'upper_paddle_is_active': consumer.upper_paddle.is_active,
        'lower_paddle_is_active': consumer.lower_paddle.is_active,
    }

def deserialize_tranfer_data(data, consumer):
    consumer.active_paddle_count = data['active_paddle_count']
    consumer.left_paddle.is_active = data['left_paddle_is_active']
    consumer.right_paddle.is_active = data['right_paddle_is_active']
    consumer.upper_paddle.is_active = data['upper_paddle_is_active']
    consumer.lower_paddle.is_active = data['lower_paddle_is_active']
