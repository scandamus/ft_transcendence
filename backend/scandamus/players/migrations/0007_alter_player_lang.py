# Generated by Django 4.2 on 2024-08-04 04:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('players', '0006_merge_0005_alter_player_lang_0005_merge_20240710_0904'),
    ]

    operations = [
        migrations.AlterField(
            model_name='player',
            name='lang',
            field=models.CharField(choices=[('en', '英語'), ('ja', '日本語'), ('fr', 'フランス語')], default='en', max_length=10, verbose_name='言語設定'),
        ),
    ]
