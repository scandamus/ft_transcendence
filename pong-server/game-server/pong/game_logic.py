import random
import math
from .consts import CANVAS_WIDTH, CANVAS_HEIGHT, PADDING


def get_ball_direction_and_random_speed(angle_degrees, direction_multiplier):
    angle_radians = angle_degrees * (math.pi / 180)
    cos_value = math.cos(angle_radians)
    sin_value = math.sin(angle_radians)
    speed = random.randint(1, 2)
    return {
        "dx": speed * direction_multiplier * cos_value,
        "dy": speed * -sin_value,
    }


class Paddle:
    def __init__(self, x, y, height, width):
        self.x = x
        self.y = y
        self.height = height
        self.width = width
        self.speed = 0
        self.score = 0

    def move(self):
        self.y += self.speed
        if self.y < 0:
            self.y = 0
        if self.y + self.height > CANVAS_HEIGHT:
            self.y = CANVAS_HEIGHT - self.height

    def increment_score(self):
        self.score += 1


class Ball:
    def __init__(self, x, y, size):
        tmp = get_ball_direction_and_random_speed(random.randint(30, 45), random.choice((-1, 1)))
        self.x = x
        self.y = y
        self.dx = tmp['dx']
        self.dy = tmp['dy']
        self.size = size
        self.flag = True  # 衝突判定を  True: する   False: しない

    def reset(self, x, y):
        tmp = get_ball_direction_and_random_speed(random.randint(30, 45), random.choice((-1, 1)))
        self.x = x
        self.y = y
        self.dx = tmp['dx']
        self.dy = tmp['dy']
        self.flag = True  # 衝突判定を  True: する   False: しない

    def move(self, paddle1, paddle2):
        # 上下の壁との衝突判定 # if 上 or 下
        if self.y + self.dy < 0 or self.y + self.size + self.dy > CANVAS_HEIGHT:
            self.dy = -self.dy
        if self.flag:
            if not collision_detection(self, paddle1, paddle2):
                self.flag = False
        # 左の壁との衝突判定
        if self.x + self.dx < 0:
            paddle1.increment_score()
            self.reset(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
            return paddle1.score < 10
        # 右の壁との衝突判定
        elif self.x + self.size + self.dx > CANVAS_WIDTH:
            paddle2.increment_score()
            self.reset(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
            return paddle2.score < 10
        else:
            self.x += self.dx
        self.y += self.dy
        return True

    def handle_paddle_collision(self, paddle, paddle_side):
        if paddle.y < self.y < paddle.y + paddle.height:
            distance_from_paddle_center = (paddle.y + (paddle.height / 2)) - self.y
            # 最大の反射角を45°に設定した場合
            # paddleの大きさに依存した数値(1.2)なので、paddleを修正する場合にはここも修正が必要
            # 角度 / paddleの大きさ で修正
            angle_degrees = distance_from_paddle_center * 1.2
            # 左右で方向を逆に
            ball_direction = 1 if paddle_side == "LEFT" else -1
            new_direction = get_ball_direction_and_random_speed(angle_degrees, ball_direction)
            self.dx = new_direction["dx"]
            self.dy = new_direction["dy"]
        else:
            return False  # Paddle missed the ball, game over condition

        return True  # Successful paddle hit


def collision_detection(ball, paddle1, paddle2):
    # 左のパドル
    if ball.x < paddle2.width + PADDING:
        if not ball.handle_paddle_collision(paddle2, "LEFT"):
            return False  # Game over, paddle missed the ball
    # 右のパドル
    elif ball.x + ball.size > paddle1.x:
        if not ball.handle_paddle_collision(paddle1, "RIGHT"):
            return False  # Game over, paddle missed the ball

    return True  # Continue playing
