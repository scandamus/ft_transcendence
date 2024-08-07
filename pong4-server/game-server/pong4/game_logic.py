import random
import math
from .consts import (CANVAS_WIDTH, CANVAS_HEIGHT, REFLECTION_ANGLE, CORNER_BLOCK_SIZE,
                     CANVAS_WIDTH_MULTI, CANVAS_HEIGHT_MULTI, CORNER_BLOCK_THICKNESS, BALL_SIZE)

import logging

logger = logging.getLogger(__name__)


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
        self.is_active = True
        self.speed = 0
        self.score = 4

    def deactivate(self, score=0):
        self.score = score
        self.is_active = False
        self.convert_to_wall()

    def convert_to_wall(self):
        if self.orientation == 'vertical':
            self.length = CANVAS_HEIGHT_MULTI
            self.y = 0
        elif self.orientation == 'horizontal':
            self.length = CANVAS_WIDTH_MULTI
            self.x = 0

    def move_for_multiple(self):
        if self.is_active:
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
        self.speed = 6
        tmp = self.get_ball_direction_and_random_speed(random.randint(-90, 90), random.choice((-1, 1)))
        self.x = x
        self.y = y
        self.dx = tmp['dx']
        self.dy = tmp['dy']
        self.size = size
        self.flag = True  # 衝突判定を True:する False:しない

    def reset(self, x, y):
        self.speed = 6
        tmp = self.get_ball_direction_and_random_speed(random.randint(-90, 90), random.choice((-1, 1)))
        self.x = x
        self.y = y
        self.dx = tmp['dx']
        self.dy = tmp['dy']
        self.flag = True

    def handle_scored(self, paddle):
        paddle.decrement_score()
        self.reset(CANVAS_WIDTH_MULTI / 2, CANVAS_HEIGHT_MULTI / 2)
        if paddle.score <= 0:
            paddle.deactivate()

    def move_for_multiple(self, right_paddle, left_paddle, upper_paddle, lower_paddle, walls):
        sound_type = None
        # 壁を超えているか
        if CANVAS_WIDTH_MULTI < self.x + self.dx:
            self.handle_scored(right_paddle)
            sound_type = 'scored'
            return sound_type
        elif self.x + self.size + self.dx < 0:
            self.handle_scored(left_paddle)
            sound_type = 'scored'
            return sound_type
        elif self.y + self.size + self.dy < 0:
            self.handle_scored(upper_paddle)
            sound_type = 'scored'
            return sound_type
        elif CANVAS_HEIGHT_MULTI < self.y + self.dy:
            self.handle_scored(lower_paddle)
            sound_type = 'scored'
            return sound_type

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
            return 'paddle_collision'

        for wall in walls:
            collision_detected = self.collision_detection(wall, wall.position)
            if collision_detected == 'collision_front':
                sound_type = 'wall_collision'
                tmp = random.uniform(0, 0.5)
                # 座標調整
                if wall.position == 'RIGHT':
                    tmp = tmp if self.y > 0 else -tmp
                    self.dx = -self.dx + tmp
                elif wall.position == 'LEFT':
                    tmp = tmp if self.y > 0 else -tmp
                    self.dx = -self.dx + tmp
                elif wall.position == 'UPPER':
                    tmp = tmp if self.x > 0 else -tmp
                    self.dy = -self.dy + tmp
                elif wall.position == 'LOWER':
                    tmp = tmp if self.x > 0 else -tmp
                    self.dy = -self.dy
                return sound_type
            elif collision_detected == 'collision_side':
                sound_type = 'wall_collision'
                if wall.position == 'RIGHT' or wall.position == 'LEFT':
                    self.dy = -self.dy
                    self.x += self.dx
                elif wall.position == 'UPPER' or wall.position == 'LOWER':
                    self.dx = -self.dx
                    self.y += self.dy
                return sound_type
        return sound_type

    def collision_detection(self, obj, obj_side):
        ball_start = self.get_ball_corner_for_front(obj, obj_side)
        ball_end = Point(ball_start.x + self.dx, ball_start.y + self.dy)
        paddle_start = paddle_end = None

        # paddleの正面との衝突判定
        if obj_side == 'RIGHT':
            paddle_start = Point(obj.x, obj.y)
            paddle_end = Point(obj.x, obj.y + obj.length)
        elif obj_side == 'LEFT':
            paddle_start = Point(obj.x + obj.thickness, obj.y)
            paddle_end = Point(obj.x + obj.thickness, obj.y + obj.length)
        elif obj_side == 'UPPER':
            paddle_start = Point(obj.x, obj.y + obj.thickness)
            paddle_end = Point(obj.x + obj.length, obj.y + obj.thickness)
        elif obj_side == 'LOWER':
            paddle_start = Point(obj.x, obj.y)
            paddle_end = Point(obj.x + obj.length, obj.y)
        if intersects(ball_start, ball_end, paddle_start, paddle_end):
            logger.error(f'{obj_side}: collision_front detected')
            return 'collision_front'

        ball_start2 = self.get_ball_corner_for_side(obj, obj_side)
        ball_end2 = Point(ball_start2.x + self.dx, ball_start2.y + self.dy)
        paddle_end_side1 = paddle_end_side2 = None
        # paddleの側面との衝突判定
        if obj_side == 'RIGHT':
            paddle_end_side1 = Point(obj.x + obj.thickness, obj.y)
            paddle_end_side2 = Point(obj.x + obj.thickness, obj.y + obj.length)
        elif obj_side == 'LEFT':
            paddle_end_side1 = Point(obj.x, obj.y)
            paddle_end_side2 = Point(obj.x, obj.y + obj.length)
        elif obj_side == 'UPPER':
            paddle_end_side1 = Point(obj.x, obj.y)
            paddle_end_side2 = Point(obj.x + obj.length, obj.y)
        elif obj_side == 'LOWER':
            paddle_end_side1 = Point(obj.x, obj.y + obj.thickness)
            paddle_end_side2 = Point(obj.x + obj.length, obj.y + obj.thickness)
        # paddle_endをもう片側の側面のスタート座標として使う
        paddle_start2 = paddle_end
        if (intersects(ball_start2, ball_end2, paddle_start, paddle_end_side1)
                or intersects(ball_start2, ball_end2, paddle_start2, paddle_end_side2)):
            logger.error(f'{obj_side}: collision_side detected')
            return 'collision_side'
        return False

    def reflect_ball(self, obj, obj_side):
        normalize = REFLECTION_ANGLE / (obj.length / 2)
        if obj_side == 'RIGHT' or obj_side == 'LEFT':
            distance_from_paddle_center = (obj.y + (obj.length / 2)) - (self.y + (BALL_SIZE / 2))
            if not obj.is_active:
                distance_from_paddle_center = random.choice((-1, 1)) if distance_from_paddle_center == 0 else distance_from_paddle_center
            # 最大の反射角を45°に設定した場合
            # paddleの大きさに依存した数値(1.2)なので、paddleを修正する場合にはここも修正が必要
            # 角度 / paddleの大きさ で修正
            angle_degrees = distance_from_paddle_center * normalize
            # 左右で方向を逆に
            ball_direction = 1 if obj_side == 'LEFT' else -1
            new_direction = self.get_ball_direction_and_random_speed(angle_degrees, ball_direction)
        else:
            distance_from_paddle_center = (obj.x + (obj.length / 2)) - (self.x + (BALL_SIZE / 2))
            if not obj.is_active:
                distance_from_paddle_center = random.choice((-1, 1)) if distance_from_paddle_center == 0 else distance_from_paddle_center
            angle_degrees = distance_from_paddle_center * normalize
            ball_direction = 1 if obj_side == 'UPPER' else -1
            new_direction = self.get_ball_direction_and_random_speed(angle_degrees, ball_direction, 'horizontal')
        self.dx = new_direction['dx']
        self.dy = new_direction['dy']
        self.speed += 1
        if self.speed > 60:
            self.speed = 60

    def get_ball_direction_and_random_speed(self, angle_degrees, direction_multiplier, orientation='vertical'):
        angle_radians = angle_degrees * (math.pi / 180)
        if orientation == 'vertical':
            cos_value = math.cos(angle_radians)
            sin_value = math.sin(angle_radians)
            return {
                'dx': self.speed * direction_multiplier * cos_value,
                'dy': self.speed * -sin_value,
            }
        elif orientation == 'horizontal':
            cos_value = math.cos(angle_radians)
            sin_value = math.sin(angle_radians)
            return {
                'dx': self.speed * -sin_value,
                'dy': self.speed * direction_multiplier * cos_value,
            }

    # 衝突判定の基準となるボールの角を決定
    def get_ball_corner_for_front(self, obj, obj_side):
        if obj_side == 'RIGHT':
            # 半分より上か下か
            if self.y + self.size / 2 < obj.y + obj.length / 2:
                return Point(self.x + self.size, self.y + self.size)  # ボールの右下
            else:
                return Point(self.x + self.size, self.y)  # ボールの右上
        elif obj_side == 'LEFT':
            if self.y + self.size / 2 < obj.y + obj.length / 2:
                return Point(self.x, self.y + self.size)  # ボールの左下
            else:
                return Point(self.x, self.y)  # ボールの左上
        elif obj_side == 'UPPER':
            if self.x + self.size / 2 < obj.x + obj.length / 2:
                return Point(self.x + self.size, self.y)  # ボールの右上
            else:
                return Point(self.x, self.y)  # ボールの左上
        elif obj_side == 'LOWER':
            if self.x + self.size / 2 < obj.x + obj.length / 2:
                return Point(self.x + self.size, self.y + self.size)  # ボールの右下
            else:
                return Point(self.x, self.y + self.size)  # ボールの左下

    # 衝突判定の基準となるボールの角を決定
    def get_ball_corner_for_side(self, obj, obj_side):
        if obj_side == 'RIGHT':
            if self.y + self.size / 2 < obj.y + obj.length / 2:
                if self.x + self.size / 2 < obj.x + obj.thickness / 2:
                    return Point(self.x + self.size, self.y + self.size)  # ボールの右下
                else:
                    return Point(self.x, self.y + self.size)  # ボールの左下
            else:
                if self.x + self.size / 2 < obj.x + obj.thickness / 2:
                    return Point(self.x + self.size, self.y)  # ボールの右上
                else:
                    return Point(self.x, self.y)  # ボールの左上
        elif obj_side == 'LEFT':
            if self.y + self.size / 2 < obj.y + obj.length / 2:
                if self.x + self.size / 2 < obj.x + obj.thickness / 2:
                    return Point(self.x + self.size, self.y + self.size)  # ボールの右下
                else:
                    return Point(self.x, self.y + self.size)  # ボールの左下
            else:  # side
                if self.x + self.size / 2 < obj.x + obj.thickness / 2:
                    return Point(self.x + self.size, self.y)  # ボールの右上
                else:
                    return Point(self.x, self.y)  # ボールの左上
        elif obj_side == 'UPPER':
            if self.x + self.size / 2 < obj.x + obj.length / 2:
                if self.y + self.size / 2 < obj.y + obj.thickness / 2:
                    return Point(self.x + self.size, self.y + self.size)  # ボールの右下
                else:
                    return Point(self.x + self.size, self.y)  # ボールの右上
            else:  # side
                if self.y + self.size / 2 < obj.y + obj.thickness / 2:
                    return Point(self.x, self.y + self.size)  # ボールの左下
                else:  # side
                    return Point(self.x, self.y)  # ボールの左上
        elif obj_side == 'LOWER':
            if self.x + self.size / 2 < obj.x + obj.length / 2:
                if self.y + self.size / 2 < obj.y + obj.thickness / 2:
                    return Point(self.x + self.size, self.y + self.size)  # ボールの右下
                else:
                    return Point(self.x + self.size, self.y)  # ボールの右上
            else:  # side
                if self.y + self.size / 2 < obj.y + obj.thickness / 2:
                    return Point(self.x, self.y + self.size)  # ボールの左下
                else:
                    return Point(self.x, self.y)  # ボールの左上


# 座標を扱うクラス
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y


# 線分が交差するかを確認する関数
# abとcdが交差するか
def intersects(a: Point, b: Point, c: Point, d: Point):
    if a is None or b is None or c is None or d is None:
        return False
    # 線分ABと点Cを用いた外積
    s = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
    # 線分ABと点Dを用いた外積
    t = (b.x - a.x) * (d.y - a.y) - (b.y - a.y) * (d.x - a.x)
    # 線分CDと点Aを用いた外積
    u = (d.x - c.x) * (a.y - c.y) - (d.y - c.y) * (a.x - c.x)
    # 線分CDと点Bを用いた外積
    v = (d.x - c.x) * (b.y - c.y) - (d.y - c.y) * (b.x - c.x)
    # すべての外積の符号が一致しない場合、交差していると判定
    if (s * t <= 0) and (u * v <= 0):
        return True
    # それ以外は交差していない
    return False
