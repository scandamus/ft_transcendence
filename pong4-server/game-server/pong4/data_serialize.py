from .game_logic import Block

def serialize_transfer_data(consumer):
    return {
        'walls': [serialize_block(block) for block in consumer.walls],
        'active_paddle_count': consumer.active_paddle_count,
        'left_paddle_is_active': consumer.left_paddle.is_active,
        'right_paddle_is_active': consumer.right_paddle.is_active,
        'upper_paddle_is_active': consumer.upper_paddle.is_active,
        'lower_paddle_is_active': consumer.lower_paddle.is_active,
    }

def deserialize_tranfer_data(data, consumer):
    consumer.walls = {deseriarize_block(block_data) for block_data in data['walls']}
    consumer.active_paddle_count = data['active_paddle_count']
    consumer.left_paddle.is_active = data['left_paddle_is_active']
    consumer.right_paddle.is_active = data['right_paddle_is_active']
    consumer.upper_paddle.is_active = data['upper_paddle_is_active']
    consumer.lower_paddle.is_active = data['lower_paddle_is_active']

def serialize_block(block):
    return {
        'x': block.x,
        'y': block.y,
        'thickness': block.thickness,
        'length': block.length,
        'orientation': block.orientation,
        'position': block.position,
    }
    
def deseriarize_block(data):
    return Block(
        data['x'],
        data['y'],
        data['thickness'],
        data['length'],
        data['orientation'],
        data['position']
    )