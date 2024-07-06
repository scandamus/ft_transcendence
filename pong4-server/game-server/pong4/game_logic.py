import random
import math
from .consts import (CANVAS_WIDTH, CANVAS_HEIGHT, REFLECTION_ANGLE, CORNER_BLOCK_SIZE,
                     CANVAS_WIDTH_MULTI, CANVAS_HEIGHT_MULTI, CORNER_BLOCK_THICKNESS, BALL_SIZE)


def get_ball_direction_and_random_speed(angle_degrees, direction_multiplier, orientation='vertical'):
    angle_radians = angle_degrees * (math.pi / 180)
    speed = random.randint(7, 7)
    if orientation == 'vertical':
        cos_value = math.cos(angle_radians)
        sin_value = math.sin(angle_radians)
        return {
            'dx': speed * direction_multiplier * cos_value,
            'dy': speed * -sin_value,
        }
    elif orientation == 'horizontal':
        cos_value = math.cos(angle_radians)
        sin_value = math.sin(angle_radians)
        return {
            'dx': speed * -sin_value,
            'dy': speed * direction_multiplier * cos_value,
        }


class Block:
    def __init__(self, x, y, horizontal, vertical, orientation='vertical', position=None):
        self.x = x
        self.y = y
        # 垂直方向のpaddleは厚さが横,長さが縦
        # 垂直方向のpaddleは厚さが縦,長さが横
        # これによって変数名でより視覚的にpaddleを管理できるように(二人対戦のときはデフォルトでvertical)
        if orientation == 'vertical':
            self.thickness = horizontal
            self.length = vertical
        elif orientation == 'horizontal':
            self.thickness = vertical
            self.length = horizontal
        self.orientation = orientation
        # RIGHT, LEFT, UPPER, LOWER
        self.position = position


class Paddle(Block):
    # 第三引数:horizontal->横の長さ   第四引数:vertical->縦の長さ   第五引数:orientation->paddleの移動方向
    def __init__(self, x, y, horizontal, vertical, orientation='vertical'):
        super().__init__(x, y, horizontal, vertical, orientation)
        self.speed = 0
        self.score = 4

    def move_for_multiple(self):
        if self.orientation == 'horizontal':
            self.x += self.speed
            if self.x < CORNER_BLOCK_SIZE:
                self.x = CORNER_BLOCK_SIZE
            elif CANVAS_WIDTH_MULTI - CORNER_BLOCK_SIZE < self.x + self.length:
                self.x = CANVAS_WIDTH_MULTI - CORNER_BLOCK_SIZE - self.length
        elif self.orientation == 'vertical':
            self.y += self.speed
            if self.y < CORNER_BLOCK_SIZE:
                self.y = CORNER_BLOCK_SIZE
            elif CANVAS_HEIGHT_MULTI - CORNER_BLOCK_SIZE < self.y + self.length:
                self.y = CANVAS_HEIGHT_MULTI - CORNER_BLOCK_SIZE - self.length

    def increment_score(self):
        self.score += 1

    def decrement_score(self):
        self.score -= 1

    def reset(self):
        self.score = 0


class Ball:
    def __init__(self, x, y, size):
        tmp = get_ball_direction_and_random_speed(random.randint(0, 45), random.choice((-1, 1)))
        self.x = x
        self.y = y
        self.dx = tmp['dx']
        self.dy = tmp['dy']
        self.size = size
        self.flag = True  # 衝突判定を True:する False:しない

    def reset(self, x, y):
        tmp = get_ball_direction_and_random_speed(random.randint(0, 45), random.choice((-1, 1)))
        self.x = x
        self.y = y
        self.dx = tmp['dx']
        self.dy = tmp['dy']
        self.flag = True

    def move_for_multiple(self, right_paddle, left_paddle, upper_paddle, lower_paddle, walls):
        sound_type = None
        # 壁を超えているか
        if CANVAS_WIDTH_MULTI < self.x + self.dx:
            right_paddle.decrement_score()
            self.reset(CANVAS_WIDTH_MULTI / 2, CANVAS_HEIGHT_MULTI / 2)
            sound_type = 'scored'
            return right_paddle.score > 0, sound_type
        elif self.x + self.size + self.dx < 0:
            left_paddle.decrement_score()
            self.reset(CANVAS_WIDTH_MULTI / 2, CANVAS_HEIGHT_MULTI / 2)
            sound_type = 'scored'
            return left_paddle.score > 0, sound_type
        elif self.y + self.size + self.dy < 0:
            upper_paddle.decrement_score()
            self.reset(CANVAS_WIDTH_MULTI / 2, CANVAS_HEIGHT_MULTI / 2)
            sound_type = 'scored'
            return upper_paddle.score > 0, sound_type
        elif CANVAS_HEIGHT_MULTI < self.y + self.dy:
            lower_paddle.decrement_score()
            self.reset(CANVAS_WIDTH_MULTI / 2, CANVAS_HEIGHT_MULTI / 2)
            sound_type = 'scored'
            return lower_paddle.score > 0, sound_type

        for wall in walls:
            collision_detected = self.collision_detection(wall, wall.position)
            if collision_detected == 'collision_front':
                sound_type = 'wall_collision'
                tmp = random.uniform(0, 0.5)
                # 座標調整
                if wall.position == 'RIGHT':
                    tmp = tmp if self.y > 0 else -tmp
                    self.dx = -self.dx + tmp
                    self.x = wall.x - self.size
                elif wall.position == 'LEFT':
                    tmp = tmp if self.y > 0 else -tmp
                    self.dx = -self.dx + tmp
                    self.x = wall.thickness
                elif wall.position == 'UPPER':
                    tmp = tmp if self.x > 0 else -tmp
                    self.dy = -self.dy + tmp
                    self.y = wall.y + wall.thickness
                elif wall.position == 'LOWER':
                    tmp = tmp if self.x > 0 else -tmp
                    self.dy = -self.dy
                    self.y = wall.y - wall.thickness
                return True, sound_type
            elif collision_detected == 'collision_side':
                sound_type = 'wall_collision'
                if wall.position == 'RIGHT' or wall.position == 'LEFT':
                    self.dy = -self.dy
                    self.x += self.dx
                elif wall.position == 'UPPER' or wall.position == 'LOWER':
                    self.dx = -self.dx
                    self.y += self.dy
                return True, sound_type
        # x座標の操作
        collision_detected_right = self.collision_detection(right_paddle, 'RIGHT')
        if collision_detected_right == 'collision_front':
            self.reflect_ball(right_paddle, 'RIGHT')
            # 位置調整
            self.x = right_paddle.x - self.size
        elif collision_detected_right == 'collision_side':
            # 位置調整
            self.y += self.dy
            # 設定
            self.dy = -self.dy
            self.x += self.dx
        collision_detected_left = self.collision_detection(left_paddle, 'LEFT')
        if collision_detected_left == 'collision_front':
            self.reflect_ball(left_paddle, 'LEFT')
            # 位置調整
            self.x = left_paddle.thickness
        elif collision_detected_left == 'collision_side':
            # 位置調整
            self.y += self.dy
            # 設定
            self.dy = -self.dy
            self.x += self.dx
        if not collision_detected_right and not collision_detected_left:
            self.y += self.dy
        # y座標の操作
        collision_detected_upper = self.collision_detection(upper_paddle, 'UPPER')
        if collision_detected_upper == 'collision_front':
            self.reflect_ball(upper_paddle, 'UPPER')
            # 位置調整
            self.y = upper_paddle.y + upper_paddle.thickness
        elif collision_detected_upper == 'collision_side':
            # 位置調整
            self.x += self.dx
            # 設定
            self.dx = -self.dx
            self.y += self.dy
        collision_detected_lower = self.collision_detection(lower_paddle, 'LOWER')
        if collision_detected_lower == 'collision_front':
            self.reflect_ball(lower_paddle, 'LOWER')
            # 位置調整
            self.y = lower_paddle.y - self.size
        elif collision_detected_lower == 'collision_side':
            # 位置調整
            self.x += self.dx
            # 設定
            self.dx = -self.dx
            self.y += self.dy
        if not collision_detected_upper and not collision_detected_lower:
            self.x += self.dx
        if collision_detected_left or collision_detected_right or collision_detected_lower or collision_detected_upper:
            sound_type = 'paddle_collision'
        return True, sound_type

    def collision_detection(self, obj, obj_side):
        next_x = self.x + self.dx
        next_y = self.y + self.dy
        collision_type = False
        if obj_side == 'RIGHT' and obj.x <= next_x + self.size and next_x <= obj.x + obj.thickness:
            if obj.y <= next_y + self.size and next_y <= obj.y + obj.length:
                if self.x + self.size <= obj.x:
                    collision_type = 'collision_front'
                elif obj.x < self.x + self.size:
                    collision_type = 'collision_side'
                return collision_type
        elif obj_side == 'LEFT' and obj.x <= next_x + self.size and next_x <= obj.x + obj.thickness:
            if obj.y <= next_y + self.size and next_y <= obj.y + obj.length:
                if obj.x + obj.thickness <= self.x:
                    collision_type = 'collision_front'
                elif self.x < obj.x:
                    collision_type = 'collision_side'
                return collision_type
        elif obj_side == 'UPPER' and obj.y <= next_y + self.size and next_y <= obj.y + obj.thickness:
            if obj.x <= next_x + self.size and next_x <= obj.x + obj.length:
                if obj.y + obj.thickness <= self.y:
                    collision_type = 'collision_front'
                elif self.y < obj.y + obj.thickness:
                    collision_type = 'collision_side'
                return collision_type
        elif obj_side == 'LOWER' and obj.y <= next_y + self.size and next_y <= obj.y + obj.thickness:
            if obj.x <= next_x + self.size and next_x <= obj.x + obj.length:
                if self.y + self.size <= obj.y:
                    collision_type = 'collision_front'
                elif obj.y < self.y + self.size:
                    collision_type = 'collision_side'
                return collision_type
        return collision_type

    def reflect_ball(self, obj, obj_side):
        normalize = REFLECTION_ANGLE / (obj.length / 2)
        if obj_side == 'RIGHT' or obj_side == 'LEFT':
            distance_from_paddle_center = (obj.y + (obj.length / 2)) - self.y
            # 最大の反射角を45°に設定した場合
            # paddleの大きさに依存した数値(1.2)なので、paddleを修正する場合にはここも修正が必要
            # 角度 / paddleの大きさ で修正
            angle_degrees = distance_from_paddle_center * normalize
            # 左右で方向を逆に
            ball_direction = 1 if obj_side == 'LEFT' else -1
            new_direction = get_ball_direction_and_random_speed(angle_degrees, ball_direction)
        else:
            distance_from_paddle_center = (obj.x + (obj.length / 2)) - self.x
            angle_degrees = distance_from_paddle_center * normalize
            ball_direction = 1 if obj_side == 'UPPER' else -1
            new_direction = get_ball_direction_and_random_speed(angle_degrees, ball_direction, 'horizontal')
        self.dx = new_direction['dx']
        self.dy = new_direction['dy']