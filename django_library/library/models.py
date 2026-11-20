"""
Library Models - Data structures for the Library Management System.

Defines Book, Member, and Rental models using Django ORM.
These map to database tables and replace the Python dictionaries
from the Tkinter version.
"""
from django.db import models
from django.utils import timezone
from datetime import timedelta


class Book(models.Model):
    """Represents a book in the library catalog."""
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=150)
    genre = models.CharField(max_length=100, default='General')
    copies_available = models.PositiveIntegerField(default=1)
    total_copies = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return f"{self.title} by {self.author}"

    @property
    def is_available(self):
        """Check if the book has copies available for rental."""
        return self.copies_available > 0


class Member(models.Model):
    """Represents a library member."""
    name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, default='')
    registration_date = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Rental(models.Model):
    """Represents a book rental (issue/return record)."""
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='rentals')
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='rentals')
    issue_date = models.DateField(auto_now_add=True)
    due_date = models.DateField()
    return_date = models.DateField(null=True, blank=True)
    fine_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    class Meta:
        ordering = ['-issue_date']

    def __str__(self):
        return f"{self.book.title} → {self.member.name}"

    @property
    def is_overdue(self):
        """Check if the rental is overdue (not returned and past due date)."""
        if self.return_date:
            return False
        return timezone.now().date() > self.due_date

    @property
    def days_overdue(self):
        """Calculate how many days overdue."""
        if not self.is_overdue:
            return 0
        return (timezone.now().date() - self.due_date).days

    @property
    def calculated_fine(self):
        """Calculate the current fine based on days overdue."""
        from django.conf import settings
        if not self.is_overdue:
            return self.fine_amount
        return self.days_overdue * settings.LATE_FINE_PER_DAY

    @property
    def status(self):
        """Return the current status of the rental."""
        if self.return_date:
            return 'returned'
        if self.is_overdue:
            return 'overdue'
        return 'active'
