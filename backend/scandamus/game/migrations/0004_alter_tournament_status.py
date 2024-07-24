# Generated by Django 4.2 on 2024-07-10 05:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0003_tournament_bye_player_tournament_current_round_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tournament',
            name='status',
            field=models.CharField(choices=[('upcoming', '開始前'), ('ongoing', '進行中'), ('finished', '終了'), ('canceled', 'キャンセル')], default='upcoming', max_length=10, verbose_name='状態'),
        ),
    ]