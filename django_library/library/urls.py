"""
Library URL Configuration - Maps URLs to view functions.
"""
from django.urls import path
from . import views

urlpatterns = [
    # Dashboard
    path('', views.dashboard, name='dashboard'),

    # Books
    path('books/', views.book_list, name='book_list'),
    path('books/add/', views.book_add, name='book_add'),
    path('books/<int:book_id>/edit/', views.book_edit, name='book_edit'),
    path('books/<int:book_id>/delete/', views.book_delete, name='book_delete'),

    # Members
    path('members/', views.member_list, name='member_list'),
    path('members/add/', views.member_add, name='member_add'),
    path('members/<int:member_id>/edit/', views.member_edit, name='member_edit'),
    path('members/<int:member_id>/delete/', views.member_delete, name='member_delete'),

    # Rentals
    path('rentals/', views.rental_list, name='rental_list'),
    path('rentals/issue/', views.rental_issue, name='rental_issue'),
    path('rentals/<int:rental_id>/return/', views.rental_return, name='rental_return'),
]
