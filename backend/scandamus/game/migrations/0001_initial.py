# Generated by Django 4.1 on 2024-06-01 13:29

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('players', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Tournament',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, verbose_name='トーナメント名')),
                ('start', models.DateTimeField(verbose_name='開始時間')),
                ('period', models.DateTimeField(verbose_name='エントリー締切')),
            ],
            options={
                'verbose_name': 'トーナメント',
            },
        ),
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
        migrations.CreateModel(
            name='Entry',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nickname', models.CharField(max_length=50, verbose_name='ニックネーム')),
                ('player', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='players.player')),
                ('tournament', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='game.tournament')),
            ],
            options={
                'verbose_name': 'エントリー',
            },
        ),
    ]
