from django.db import models
from django.core.exceptions import ValidationError
from players.models import Player


class Tournament(models.Model):
    name = models.CharField(
        max_length=50,
        verbose_name="トーナメント名"
    )
    start = models.DateTimeField(
        verbose_name="開始時間"
    )
    period = models.DateTimeField(
        verbose_name="エントリー締切"
    )

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'トーナメント'


class Match(models.Model):
    tournament = models.ForeignKey(
        'Tournament',
        on_delete=models.SET_NULL,  # トーナメントが削除されたらNULLに設定
        null=True, blank=True,
        verbose_name="トーナメント"
    )
    round = models.IntegerField(
        default=-1,  # トーナメント外のmatchは-1
        null=True, blank=True,
        verbose_name="ラウンド"
    )
    player1 = models.ForeignKey(
        'players.Player',
        related_name='matches_as_player1',
        on_delete=models.SET_NULL,  # プレイヤーが削除されたらNULLに設定
        null=True, blank=False,  # on_delete=SET_NULL なので nullを許可
        verbose_name="プレイヤー1"
    )
    player2 = models.ForeignKey(
        'players.Player',
        related_name='matches_as_player2',
        on_delete=models.SET_NULL,
        null=True, blank=False,
        verbose_name="プレイヤー2"
    )
    status = models.CharField(
        max_length=10,
        choices=[
            ('before', '対戦前'),
            ('ongoing', '対戦中'),
            ('after', '対戦後')
        ],
        default='before',
        verbose_name="status"
    )
    score1 = models.IntegerField(
        default=0,
        null=True, blank=True,
        verbose_name="スコア(プレイヤー1)"
    )
    score2 = models.IntegerField(
        default=0,
        null=True, blank=True,
        verbose_name="スコア(プレイヤー2)"
    )

    def __str__(self):
        return f"{self.player1} vs {self.player2} - Round: {self.round} on {self.tournament}"

    class Meta:
        verbose_name = '対戦'

    def clean(self):
        if self.player1 == self.player2:
            raise ValidationError('player1 and player2 cannot be the same player')

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class Entry(models.Model):
    tournament = models.ForeignKey(
        'Tournament',
        on_delete=models.CASCADE,  # トーナメントが削除された場合、該当するエントリー削除
    )
    player = models.ForeignKey(
        'players.Player',
        on_delete=models.CASCADE
    )
    nickname = models.CharField(
        max_length=20,
        verbose_name="ニックネーム",
        null=True,
        default='User.username'
    )

    def __str__(self):
        return f"{self.player} as {self.nickname} on {self.tournament}"

    class Meta:
        verbose_name = 'エントリー'
