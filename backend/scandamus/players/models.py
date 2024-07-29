from django.core.validators import FileExtensionValidator, MinValueValidator
from django.core.exceptions import ValidationError
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.exceptions import ObjectDoesNotExist
from PIL import Image

import logging
logger = logging.getLogger(__name__)

def get_default_user():
    try:
        return User.objects.first().id
    except ObjectDoesNotExist:
        return None

def validate_image(file):
    try:
        img = Image.open(file)
        img.verify()
    except (IOError, SyntaxError) as e:
        raise ValidationError("Invalid image file")

class Player(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        verbose_name="プレイヤー"
    )
    avatar = models.ImageField(
        upload_to='static/uploads/avatar/',
        validators=[FileExtensionValidator(['jpg', 'jpeg', 'png']), validate_image],
        blank=True,
        null=True,
        verbose_name="アバター"
    )
    level = models.FloatField(
        validators=[MinValueValidator(0.0)],
        default=0.0,
        verbose_name="レベル"
    )
    play_count = models.IntegerField(
        default=0,
        verbose_name="総試合数"
    )
    win_count = models.IntegerField(
        default=0,
        verbose_name="勝った試合数"
    )
    id_42 = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name="42 Intra ID"
    )
    link_42 = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="42 Intra link"
    )
    lang = models.CharField(
        max_length=10,
        choices=[
            ('en', '英語'),
            ('ja', '日本語'),
            ('fr', 'フランス語'),
            ('la', 'ラテン語'),
            ('he', 'ヘブライ語'),
            ('ar', 'アラビア語'),
        ],
        default='en',
        verbose_name="言語設定"
    )
    data_created = models.DateTimeField(
        auto_now_add=True,
        verbose_name="登録日時"
    )
    friends = models.ManyToManyField('self', symmetrical=True, blank=True)
    STATUS_CHOICES = [
        ('friend_match', 'フレンドマッチ中'),
        ('lounge_match', 'ラウンジマッチ中'),
        ('tournament_match', 'トーナメントマッチ中'),
        ('tournament_room', 'トーナメント控室'),
        ('tournament_prepare', 'トーナメント準備中'),
        ('tournament', 'トーナメント中'),
        ('friend_waiting', 'フレンドマッチ待機中'),
        ('lounge_waiting', 'ラウンジマッチ待機中'),
        ('waiting', '待機中'),
    ]
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='waiting',
        verbose_name="ステータス"
    )
    online = models.BooleanField(
        default=False,
        null=True,
        blank=True,
        verbose_name="オンラインステータス"
    )
    current_match = models.ForeignKey(
        'game.Match',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='current_players',
        verbose_name="現在のマッチ"
    )

    def save(self, *args, **kwargs):
        logger.info(f'//player save() {self.user.username}')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - level:{self.level} / win: {self.win_count} / lang: {self.lang}"


@receiver(post_save, sender=User)
def create_player(sender, instance, created, **kwargs):
    if created:
        Player.objects.create(user=instance)

class FriendRequest(models.Model):
    from_user = models.ForeignKey(Player, related_name='sent_requests', on_delete=models.CASCADE)
    to_user = models.ForeignKey(Player, related_name='receive_requests', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.from_user} -> {self.to_user}'

    def save(self, *args, **kwargs):
        logger.info(f'//FriendRequest save() {self.from_user} -> {self.to_user}')
        super().save(*args, **kwargs)
