# Generated by Django 4.1 on 2024-04-30 09:39

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('players', '0002_userprofile'),
        ('game', '0002_alter_tournament_period_alter_tournament_start'),
    ]

    operations = [
        migrations.CreateModel(
            name='Match',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('round', models.IntegerField(blank=True, null=True)),
                ('status', models.CharField(choices=[('before', '対戦前'), ('ongoing', '対戦中'), ('after', '対戦後')], default='before', max_length=10)),
                ('score1', models.IntegerField(default=0)),
                ('score2', models.IntegerField(default=0)),
                ('player1', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='matches_as_player1', to='players.player')),
                ('player2', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='matches_as_player2', to='players.player')),
                ('tournament', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='game.tournament')),
            ],
            options={
                'verbose_name': '対戦',
            },
        ),
    ]
