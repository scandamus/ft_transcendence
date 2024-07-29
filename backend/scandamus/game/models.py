from django.db import models
from django.core.exceptions import ValidationError
from players.models import Player
from asgiref.sync import async_to_sync, sync_to_async
import logging
import json

logger = logging.getLogger(__name__)

class Tournament(models.Model):
    name = models.CharField(
        max_length=50,
        unique=True,
        blank=False,
        verbose_name="トーナメント名"
    )
    start = models.DateTimeField(
        verbose_name="開始時間"
    )
    period = models.DateTimeField(
        verbose_name="エントリー締切"
    )
    max_participants = models.IntegerField(
        verbose_name='最大人数',
        default=16
    )
    # 毎回カウントする方式にするのでコメントアウトしておく
    # 処理が重すぎる場合はイキに（その場合はEntryする際にatomicで変更する処理が必要）
    # current_participants = models.IntegerField(
    #     verdose_name='参加人数',
    #     default=0
    # )

    status = models.CharField(
        max_length=10,
        choices=[
            ('upcoming', '開始前'),
            ('preparing', '準備中'),
            ('ongoing', '進行中'),
            ('finished', '終了'),
            ('canceled', 'キャンセル'),
        ],
        default='upcoming',
        verbose_name='状態',
    )
    matches = models.ManyToManyField(
        'Match',
        blank=True,
        related_name='tournament_matches',
        verbose_name="全マッチ"
    )
    current_round = models.IntegerField(
        default=1,
        verbose_name="ラウンド"    
    )
    winner = models.ForeignKey(
        'players.Player',
        related_name='winner',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="優勝"
    )
    second_place = models.ForeignKey(
        'players.Player',
        related_name='second',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="2位"
    )
    third_place = models.ForeignKey(
        'players.Player',
        related_name='third',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="3位"
    )    
    bye_player = models.ForeignKey(
        'players.player',
        related_name='bye_tournaments',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="不戦勝"
    )
    result_json = models.TextField(
        default='[]'
    )

    def __str__(self):
        return self.name

    def update_result_json(self, round):
        result = json.loads(self.result_json)

        matches = self.matches.filter(round=round)
        round_result = self.get_round_result(matches)
        bye_player_entry = Entry.objects.get(player=self.bye_player, tournament=self) if self.bye_player else None
        
        result.append({
            "round": round,
            "matches": round_result,
            "bye_player": bye_player_entry.nickname if bye_player_entry else None,
            "bye_player_id": bye_player_entry.player.id if bye_player_entry else None,
        })
        self.result_json = json.dumps(result)
        self.save(update_fields=['result_json'])
        logger.info(f'//-- tournament save() on: update_result_json')

    def get_round_result(self, matches):
        round_result = []
        for match in matches:
            player1_entry = Entry.objects.get(player=match.player1, tournament=self) if match.player1 else None
            player2_entry = Entry.objects.get(player=match.player2, tournament=self) if match.player2 else None
            winner_entry = Entry.objects.get(player=match.winner, tournament=self) if match.winner else None
            round_result.append({
                "player1": player1_entry.nickname if player1_entry else None,
                "player2": player2_entry.nickname if player2_entry else None,
                "score1": match.score1,
                "score2": match.score2,
                "player1_id": match.player1.id,
                "player2_id": match.player2.id,
                "winner": winner_entry.nickname if winner_entry else None
            })
        return round_result
    
    def finalize_result_json(self, is_three_players=False):
        if is_three_players:
            self.update_result_json(-4)
            self.update_result_json(-5)
            self.update_result_json(-6)
        else:
            self.update_result_json(-3)
            self.update_result_json(-1)
        result = json.loads(self.result_json)

        winner_entry = Entry.objects.get(player=self.winner, tournament=self) if self.winner else None
        second_place_entry = Entry.objects.get(player=self.second_place, tournament=self) if self.second_place else None
        third_place_entry = Entry.objects.get(player=self.third_place, tournament=self) if self.third_place else None

        rankings = {
            "rankings": {
                "winner": winner_entry.nickname if winner_entry else None,
                "winner_id": self.winner.id,
                "second": second_place_entry.nickname if second_place_entry else None,
                "second_id": self.second_place.id,
                "third": third_place_entry.nickname if third_place_entry else None,
                "third_id": self.third_place.id
            }
        }
        result.append(rankings)
        self.result_json = json.dumps(result)
        self.save(update_fields=['result_json'])
        logger.info(f'//-- tournament save() on: finalize_result_json')

    class Meta:
        verbose_name = 'トーナメント'

    def save(self, *args, **kwargs):
        logger.info(f'//Tournament save() {self.name}')
        super().save(*args, **kwargs)

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
    winner = models.ForeignKey(
        Player,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
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
                    player.save(update_fields=['status', 'current_match'])
                    logger.info(f'//-- Player save() on: delete')
        super().delete(*args, **kwargs)

    def set_winner(self):
        if self.status == 'after':
            scores = [self.score1, self.score2, self.score3, self.score4]
            players = [self.player1, self.player2, self.player3, self.player4]
            max_score = max(score for score in scores if score is not None)
            winners = [players[i] for i, score in enumerate(scores) if score == max_score]

            if len(winners) == 1:
                self.winner = winners[0]
            elif len(winners) > 1 and self.tournament and self.tournament.status == 'ongoing':
                # 最高点のPlayerが複数人いてトーナメントの場合
                self.winner = self.player1
            else: # トーナメント以外では必ず勝敗を決するまで試合が続行されるためあり得ないが一応
                self.winner = None
            self.save(update_fields=['winner'])
            logger.info(f'//-- Match save() on: set_winner')


    def save(self, *args, **kwargs):
        logger.info(f'//Match save() {self.game_name}')
        self.full_clean()
        super().save(*args, **kwargs)

    # def send_jwt(self):
    #     from .match_utils import send_tournament_match_jwt

    #     logger.info('send_jwt')
    #     if self.tournament:
    #         logger.info('if self.tournament')
    #         async_to_sync(send_tournament_match_jwt)(self)

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
