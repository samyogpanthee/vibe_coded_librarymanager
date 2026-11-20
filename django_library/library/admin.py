"""
Library Admin Configuration - Register models with Django admin.
"""
from django.contrib import admin
from .models import Book, Member, Rental


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'genre', 'copies_available', 'total_copies')
    list_filter = ('genre',)
    search_fields = ('title', 'author', 'genre')


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'registration_date')
    search_fields = ('name', 'email')


@admin.register(Rental)
class RentalAdmin(admin.ModelAdmin):
    list_display = ('book', 'member', 'issue_date', 'due_date', 'return_date', 'fine_amount')
    list_filter = ('return_date',)
    search_fields = ('book__title', 'member__name')
