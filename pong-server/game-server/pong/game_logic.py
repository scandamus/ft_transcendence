import random
import math
from .consts import (CANVAS_WIDTH, CANVAS_HEIGHT, REFLECTION_ANGLE, CORNER_BLOCK_SIZE,
                     CANVAS_WIDTH_MULTI, CANVAS_HEIGHT_MULTI, CORNER_BLOCK_THICKNESS, BALL_SIZE)


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
        self.speed = 7  # 初期値
        tmp = self.get_ball_direction_and_random_speed(random.randint(0, 45), random.choice((-1, 1)))
        self.x = x
        self.y = y
        self.dx = tmp['dx']
        self.dy = tmp['dy']
        self.size = size
        self.flag = True  # 衝突判定を True:する False:しない

    def reset(self, x, y):
        self.speed = 7
        tmp = self.get_ball_direction_and_random_speed(random.randint(0, 45), random.choice((-1, 1)))
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

        # 左の壁との衝突判定
        if self.x + self.size + self.dx < 0:
            paddle1.increment_score()
            self.reset(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
            sound_type = 'scored'
            return paddle1.score < 10, sound_type
        # 右の壁との衝突判定
        elif self.x + self.dx > CANVAS_WIDTH:
            paddle2.increment_score()
            self.reset(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
            sound_type = 'scored'
            return paddle2.score < 10, sound_type
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
        else:
            self.x += self.dx
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
            new_direction = self.get_ball_direction_and_random_speed(angle_degrees, ball_direction)
        else:
            distance_from_paddle_center = (obj.x + (obj.length / 2)) - self.x
            angle_degrees = distance_from_paddle_center * normalize
            ball_direction = 1 if obj_side == 'UPPER' else -1
            new_direction = self.get_ball_direction_and_random_speed(angle_degrees, ball_direction, 'horizontal')
        self.dx = new_direction['dx']
        self.dy = new_direction['dy']
        # paddleのスピードアップ
        self.speed += 1

    def get_ball_direction_and_random_speed(self, angle_degrees, direction_multiplier, orientation='vertical'):
        angle_radians = angle_degrees * (math.pi / 180)
        speed = random.randint(self.speed, self.speed)
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