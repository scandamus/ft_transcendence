import random
import math


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

    def move(self, direction, canvas_height):
        self.y += self.speed
        if self.y < 0:
            self.y = 0
        if self.y + self.height > canvas_height:
            self.y = canvas_height - self.height


class Ball:
    def __init__(self, x, y, radius):
        tmp = get_ball_direction_and_random_speed(random.randint(30, 45), random.choice((-1, 1)))
        self.x = x
        self.y = y
        self.dx = tmp['dx']
        self.dy = tmp['dy']
        self.radius = radius
        self.flag = True  # 衝突判定を  True: する   False: しない

    def move(self, paddle1, paddle2, canvas_width, canvas_height):
        if self.y + self.dy > canvas_height - self.radius or self.y + self.dy < self.radius:
            self.dy = -self.dy
        if self.flag:
            if not collision_detection(self, paddle1, paddle2, canvas_width):
                self.flag = False
        if self.x - self.radius + self.dx < 0 or self.x + self.radius + self.dx > canvas_width:
            return False
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


def collision_detection(ball, paddle1, paddle2, canvas_width):
    # 左のパドル
    if ball.x - ball.radius < paddle2.width:
        if not ball.handle_paddle_collision(paddle2, "LEFT"):
            return False  # Game over, paddle missed the ball
    # 右のパドル
    elif ball.x + ball.radius > canvas_width - paddle1.width:
        if not ball.handle_paddle_collision(paddle1, "RIGHT"):
            return False  # Game over, paddle missed the ball

    return True  # Continue playing
