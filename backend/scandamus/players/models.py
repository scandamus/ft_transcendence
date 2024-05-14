from django.core.validators import FileExtensionValidator, MinValueValidator, MaxValueValidator
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class PlayerProfile(models.Model):
    player = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        verbose_name="プレイヤー"
    )
    avatar = models.ImageField(
        upload_to='uploads/avatar/',
        validators=[FileExtensionValidator(['jpg', 'png'])],
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
        null=True,
        verbose_name="42 Intra ID"
    )
    link_42 = models.CharField(
        max_length=255,
        null=True,
        verbose_name="42 Intra link"
    )
    lang = models.CharField(
        max_length=10,
        choices=[
            ('en', '英語'),
            ('ja', '日本語'),
            ('fr', 'フランス語'),
            ('emoji', '絵文字')
        ],
        default='en',
        verbose_name="言語設定"
    )
    data_created = models.DateTimeField(
        auto_now_add=True,
        verbose_name="登録日時"
    )

    def __str__(self):
        return f"{self.player.username}"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        PlayerProfile.objects.create(user=instance)
