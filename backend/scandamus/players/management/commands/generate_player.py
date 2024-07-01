import random
from django.core.management.base import BaseCommand
from faker import Faker
from django.contrib.auth.models import User
from players.models import Player

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        fake = Faker()

        # ユーザーデータを生成
        num_users = 55
        for _ in range(num_users):
            username = fake.user_name()
            email = fake.email()
            password = 'pass1@PASS'
            user, created = User.objects.get_or_create(username=username, email=email)
            if created:
                user.set_password(password)
                user.save()

        # プレイヤーデータを生成
        users = list(User.objects.all())
        for user in users:
            if not hasattr(user, 'player'):
                player = Player.objects.create(
                    user=user,
                    level=random.uniform(0.0, 100.0),
                    play_count=random.randint(0, 1000),
                    win_count=random.randint(0, 1000),
                    lang=random.choice(['en', 'ja', 'fr', 'emoji']),
                )
                player.friends.set(random.sample(list(Player.objects.all()), random.randint(0, 10)))
                player.save()

        self.stdout.write(self.style.SUCCESS('Successfully created 55 dummy User and Player records'))
