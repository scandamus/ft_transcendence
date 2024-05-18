# Generated by Django 4.1 on 2024-05-18 11:32

from django.conf import settings
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Player',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('level', models.FloatField(default=0.0, validators=[django.core.validators.MinValueValidator(0.0)], verbose_name='Lv.')),
                ('play_count', models.IntegerField(default=0, verbose_name='総試合数')),
                ('win_count', models.IntegerField(default=0, verbose_name='勝った試合数')),
                ('id_42', models.CharField(max_length=20, null=True, verbose_name='42 Intra ID')),
                ('link_42', models.CharField(max_length=255, null=True, verbose_name='42 Intra link')),
                ('lang', models.CharField(choices=[('en', '英語'), ('ja', '日本語'), ('fr', 'フランス語'), ('emoji', '絵文字')], default='en', max_length=10, verbose_name='言語設定')),
                ('data_created', models.DateTimeField(auto_now_add=True, verbose_name='登録日時')),
                ('player', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='プレイヤー')),
            ],
        ),
    ]
