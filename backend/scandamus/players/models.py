from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class Player(models.Model):
    playername = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

class UserProfile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    level = models.IntegerField(default=1)
    createdDate = models.DateTimeField(auto_now_add=True)
    playCount = models.IntegerField(default=0)
    winCount = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} - {self.level}"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

