# Generated by Django 4.1 on 2024-07-05 13:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('players', '0003_player_online'),
    ]

    operations = [
        migrations.AlterField(
            model_name='player',
            name='online',
            field=models.BooleanField(blank=True, default=False, null=True, verbose_name='オンラインステータス'),
        ),
    ]
