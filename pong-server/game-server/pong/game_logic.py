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
        self.speed = 0
        self.score = 0

    def move(self):
        self.y += self.speed
        if self.y < 0:
            self.y = 0
        elif self.y + self.length > CANVAS_HEIGHT:
            self.y = CANVAS_HEIGHT - self.length

    def increment_score(self):
        self.score += 1

    def decrement_score(self):
        self.score -= 1

    def reset(self):
        self.score = 0


class Ball:
    def __init__(self, x, y, size):
        self.speed = 50  # 初期値
        tmp = self.get_ball_direction_and_random_speed(random.randint(0, 0), random.choice((-1, 1)))
        self.x = x
        self.y = y
        self.dx = tmp['dx']
        self.dy = tmp['dy']
        self.size = size
        self.flag = True  # 衝突判定を True:する False:しない

    def reset(self, x, y):
        self.speed = 6
        tmp = self.get_ball_direction_and_random_speed(random.randint(-45, 45), random.choice((-1, 1)))
        self.x = x
        self.y = y
        self.dx = tmp['dx']
        self.dy = tmp['dy']
        self.flag = True

    def move(self, paddle1, paddle2):
        sound_type = None
        # 上下の壁との衝突判定 # if 上 or 下
        if self.y + self.dy < 0 or self.y + self.size + self.dy > CANVAS_HEIGHT:
            self.dy = -self.dy
            sound_type = 'wall_collision'
        collision_with_paddle1 = False
        collision_with_paddle2 = False
        # 衝突判定
        if 0 < self.dx:
            collision_with_paddle1 = self.collision_detection(paddle1, 'RIGHT')
        elif self.dx < 0:
            collision_with_paddle2 = self.collision_detection(paddle2, 'LEFT')

        if collision_with_paddle1 or collision_with_paddle2:
            sound_type = 'paddle_collision'
            # 衝突判定がTrueの場合はpaddleにballを接触させるように
            # x座標の操作
            if collision_with_paddle1 == 'collision_front':
                self.reflect_ball(paddle1, 'RIGHT')
                self.x = paddle1.x - self.size
            elif collision_with_paddle1 == 'collision_side':
                self.dy = -self.dy
                self.x += self.dx
            elif collision_with_paddle2 == 'collision_front':
                self.reflect_ball(paddle2, 'LEFT')
                self.x = paddle2.x + paddle2.thickness
            elif collision_with_paddle2 == 'collision_side':
                self.dy = -self.dy
                self.x += self.dx
            return True, sound_type
        else:
            self.x += self.dx

        # 左の壁との衝突判定
        if self.x + self.size + self.dx < 0:
            paddle1.increment_score()
            self.reset(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
            sound_type = 'scored'
            return paddle1.score < 1, sound_type
        # 右の壁との衝突判定
        elif self.x + self.dx > CANVAS_WIDTH:
            paddle2.increment_score()
            self.reset(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
            sound_type = 'scored'
            return paddle2.score < 1, sound_type
        # y座標の操作
        if self.y + self.dy < 0:
            self.y = 0
            self.dy -= self.dy
        elif CANVAS_HEIGHT < self.y + self.size:
            self.y = CANVAS_HEIGHT - self.size
            self.dy -= self.dy
        else:
            self.y += self.dy
        if (self.y == 0 or self.y == CANVAS_HEIGHT - self.size) and self.dy == 0:
            tmp = self.get_ball_direction_and_random_speed(random.randint(30, 45), random.choice((-1, 1)))
            self.dx = tmp['dx']
            self.dy = tmp['dy']
        return True, sound_type

    def collision_detection(self, obj, obj_side):
        # 衝突判定の基準となるボールの角を決定
        def get_ball_corner(side):
            if obj_side == 'RIGHT':
                if side == 'front':
                    # 半分より上か下か
                    if self.y + self.size / 2 < obj.y + obj.length / 2:
                        return Point(self.x + self.size, self.y + self.size)  # ボールの右下
                    else:
                        return Point(self.x + self.size, self.y)  # ボールの右上
                else:
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
                if side == 'front':
                    if self.y + self.size / 2 < obj.y + obj.length / 2:
                        return Point(self.x, self.y + self.size)  # ボールの左下
                    else:
                        return Point(self.x, self.y)  # ボールの左上
                else:
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
                if side == 'front':
                    if self.x + self.size / 2 < obj.x + obj.length / 2:
                        return Point(self.x + self.size, self.y)  # ボールの右上
                    else:
                        return Point(self.x, self.y)  # ボールの左上
                else:
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
                if side == 'front':
                    if self.x + self.size / 2 < obj.x + obj.length / 2:
                        return Point(self.x + self.size, self.y + self.size)  # ボールの右下
                    else:
                        return Point(self.x, self.y + self.size)  # ボールの左下
                else:
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

        ball_start = get_ball_corner('front')
        ball_end = Point(ball_start.x + self.dx, ball_start.y + self.dy)
        paddle_start = paddle_end = None
        collision_type = False

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
            collision_type = 'collision_front'

        ball_start2 = get_ball_corner('side')
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
        if intersects(ball_start2, ball_end2, paddle_start, paddle_end_side1):
            collision_type = 'collision_side'
        elif intersects(ball_start2, ball_end2, paddle_start2, paddle_end_side2):
            collision_type = 'collision_side'
        return collision_type

    def reflect_ball(self, obj, obj_side):
        normalize = REFLECTION_ANGLE / (obj.length / 2)
        if obj_side == 'RIGHT' or obj_side == 'LEFT':
            distance_from_paddle_center = (obj.y + (obj.length / 2)) - (self.y + (BALL_SIZE / 2))
            # 最大の反射角を45°に設定した場合
            # paddleの大きさに依存した数値(1.2)なので、paddleを修正する場合にはここも修正が必要
            # 角度 / paddleの大きさ で修正
            angle_degrees = distance_from_paddle_center * normalize
            # 左右で方向を逆に
            ball_direction = 1 if obj_side == 'LEFT' else -1
            new_direction = self.get_ball_direction_and_random_speed(angle_degrees, ball_direction)
        else:
            distance_from_paddle_center = (obj.x + (obj.length / 2)) - (self.y + (BALL_SIZE / 2))
            angle_degrees = distance_from_paddle_center * normalize
            ball_direction = 1 if obj_side == 'UPPER' else -1
            new_direction = self.get_ball_direction_and_random_speed(angle_degrees, ball_direction, 'horizontal')
        self.dx = new_direction['dx']
        self.dy = new_direction['dy']
        # paddleのスピードアップ
        self.speed += 1
        logger.error(f'{self.speed}')

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
