from django.contrib import admin
from .models import Tournament, Match, Entry

#admin.site.register(Tournament)
admin.site.register(Match)
admin.site.register(Entry)

class MatchInline(admin.TabularInline):
    model = Tournament.matches.through
    extra = 1

@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    inlines = [MatchInline]
    exclude = ('matches',)  # 'matches' フィールドを除外
