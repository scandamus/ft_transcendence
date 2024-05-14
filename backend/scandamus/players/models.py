from django.core.validators import FileExtensionValidator, MinValueValidator, MaxValueValidator
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class PlayerProfile(models.Model):
    player = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )
    avatar = models.ImageField(
        upload_to='uploads/avatar/',
        validators=[FileExtensionValidator(['jpg', 'png'])],
        null=True
    )
    level = models.FloatField(
        validators=[MinValueValidator(0.0)],
        default=0.0
    )
    play_count = models.IntegerField(
        default=0
    )
    win_count = models.IntegerField(
        default=0
    )
    id_42 = models.CharField(
        max_length=20,
        verbose_name="42 Intra ID",
        null=True
    )
    link_42 = models.CharField(
        max_length=255,
        verbose_name="42 Intra link",
        null=True
    )
    lang = models.CharField(
        max_length=10,
        choices=[
            ('en', '英語'),
            ('ja', '日本語'),
            ('after', '対戦後')
        ],
        default='en'
    )
    data_created = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.player.username}"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        PlayerProfile.objects.create(user=instance)
