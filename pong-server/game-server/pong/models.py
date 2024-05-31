# from django.db import models

# # 最小限の実装
# class Player(models.Model):
#     name = models.CharField(max_length=100)

#     def __str__(self):
#         return self.name
    
# class Tournament(models.Model):
#     name = models.CharField(max_length=50, verbose_name="トーナメント名")
#     start = models.DateTimeField(verbose_name="開始時間")
#     period = models.DateTimeField(verbose_name="エントリー締切")

#     def __str__(self):
#         return self.name

#     class Meta:
#         verbose_name = 'トーナメント'

# class Match(models.Model):
#     tournament = models.ForeignKey(
#         'Tournament',
#         on_delete=models.SET_NULL,  # トーナメントが削除された場合、NULLに設定
#         null=True,  # NULLを許可
#         blank=True  # フォームで空白を許可
#     )
#     round = models.IntegerField(
#         null=True,
#         blank=True
#     )
#     player1 = models.ForeignKey(
#         'Player',
#         related_name='matches_as_player1',
#         on_delete=models.CASCADE  # プレイヤーが削除された場合、該当するマッチも削除
#     )
#     player2 = models.ForeignKey(
#         'Player',
#         related_name='matches_as_player2',
#         on_delete=models.CASCADE
#     )
#     status = models.CharField(
#         max_length=10,
#         choices=[
#             ('before', '対戦前'),
#             ('ongoing', '対戦中'),
#             ('after', '対戦後')
#         ],
#         default='before'
#     )
#     score1 = models.IntegerField(default=0)
#     score2 = models.IntegerField(default=0)

#     def __str__(self):
#         return f"{self.player1} vs {self.player2} - Round: {self.round} on {self.tournament}"

#     class Meta:
#         verbose_name = '対戦'


# class Entry(models.Model):
#     tournament = models.ForeignKey(
#         'Tournament',
#         on_delete=models.CASCADE,  # トーナメントが削除された場合、該当するエントリー削除
#     )
#     player = models.ForeignKey(
#         'Player',
#         on_delete=models.CASCADE
#     )
#     nickname = models.CharField(max_length=50, verbose_name="ニックネーム")

#     def __str__(self):
#         return f"{self.player} as {self.nickname} on {self.tournament}"

#     class Meta:
#         verbose_name = 'エントリー'

