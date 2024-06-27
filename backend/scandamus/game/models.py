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
    game_name = models.CharField(
        max_length=20,
        choices=[
            ('pong', 'Pong'),
            ('pong4', 'Pong4'),
        ],
        default='pong',
        verbose_name="ゲームタイプ"
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
    player3 = models.ForeignKey(
        'players.Player',
        related_name='matches_as_player3',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        verbose_name="プレイヤー3"
    )
    player4 = models.ForeignKey(
        'players.Player',
        related_name='matches_as_player4',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        verbose_name="プレイヤー4"
    )
    status = models.CharField(
        max_length=10,
        choices=[
            ('before', '対戦前'),
            ('ongoing', '対戦中'), # 現在未使用
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
    score3 = models.IntegerField(
        default=0,
        null=True, blank=True,
        verbose_name="スコア(プレイヤー3)"
    )
    score4 = models.IntegerField(
        default=0,
        null=True, blank=True,
        verbose_name="スコア(プレイヤー4)"
    )
    def __str__(self):
        player_names = ", ".join([str(player) for player in [self.player1, self.player2, self.player3, self.player4] if player])
        return f"{player_names} - Round: {self.round} on {self.tournament}"
    
    class Meta:
        verbose_name = '対戦'

    def clean(self):
        players = [self.player1, self.player2, self.player3, self.player4]
        required_players = 2 if self.game_name == 'pong' else 4 if self.game_name == 'pong4' else 0
        actual_players = [player for player in players if player is not None]

        if len(actual_players) != required_players:
            raise ValidationError(f'{self.game_name} requires {required_players} players')
        if len(set(actual_players)) != len(actual_players):
            raise ValidationError('Players cannnot be the same')          

    def delete(self, *args, **kwargs): # 万一、試合中のMatchを削除する場合に関連するPlayerのstatusを変更するオーバーライド
        if self.status != 'after':
            players = [self.player1, self.player2, self.player3, self.player4]
            for player in players:
                if player and player.current_match == self:
                    player.status = 'waiting'
                    player.current_match = None
                    player.save()
        super().delete(*args, **kwargs)

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
