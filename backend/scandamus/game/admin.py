from django.contrib import admin
from .models import Tournament, Match, Entry

admin.site.register(Tournament)
admin.site.register(Match)
admin.site.register(Entry)

