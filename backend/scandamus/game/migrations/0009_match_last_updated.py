# Generated by Django 4.2 on 2024-07-26 00:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0008_alter_tournament_matches'),
    ]

    operations = [
        migrations.AddField(
            model_name='match',
            name='last_updated',
            field=models.DateTimeField(auto_now=True),
        ),
    ]