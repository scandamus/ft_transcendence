# Generated by Django 4.1 on 2024-07-05 08:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('players', '0002_alter_player_current_match'),
    ]

    operations = [
        migrations.AddField(
            model_name='player',
            name='online',
            field=models.BooleanField(default=False, verbose_name='オンラインステータス'),
        ),
    ]