# Generated by Django 4.2 on 2024-07-09 14:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('players', '0004_alter_player_online'),
    ]

    operations = [
        migrations.AlterField(
            model_name='player',
            name='lang',
            field=models.CharField(choices=[('en', '英語'), ('ja', '日本語'), ('fr', 'フランス語'), ('la', 'ラテン語'), ('he', 'ヘブライ語'), ('ar', 'アラビア語')], default='en', max_length=10, verbose_name='言語設定'),
        ),
    ]