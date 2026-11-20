"""
Library Views - Handles all HTTP requests for the Library Management System.

Each view function processes a request and returns an HTML response.
"""
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.utils import timezone
from django.conf import settings
from datetime import timedelta

from .models import Book, Member, Rental


def dashboard(request):
    """
    Dashboard view - Shows summary statistics.
    Displays total books, members, active rentals, overdue count, and fines.
    """
    total_books = Book.objects.count()
    total_copies = sum(book.total_copies for book in Book.objects.all())
    copies_available = sum(book.copies_available for book in Book.objects.all())
    total_members = Member.objects.count()

    active_rentals = Rental.objects.filter(return_date__isnull=True)
    active_count = active_rentals.count()

    today = timezone.now().date()
    overdue_rentals = active_rentals.filter(due_date__lt=today)
    overdue_count = overdue_rentals.count()

    # Calculate total outstanding fines
    total_fines = sum(rental.calculated_fine for rental in overdue_rentals)

    context = {
        'total_books': total_books,
        'total_copies': total_copies,
        'copies_available': copies_available,
        'total_members': total_members,
        'active_count': active_count,
        'overdue_count': overdue_count,
        'total_fines': total_fines,
        'late_fine_per_day': settings.LATE_FINE_PER_DAY,
        'loan_days': settings.DEFAULT_LOAN_DAYS,
        'availability_rate': round((copies_available / total_copies * 100), 1) if total_copies > 0 else 0,
    }
    return render(request, 'library/dashboard.html', context)


def book_list(request):
    """
    Book list view - Display all books with search functionality.
    Supports searching by title, author, or genre.
    """
    query = request.GET.get('search', '')
    if query:
        books = Book.objects.filter(
            models.Q(title__icontains=query) |
            models.Q(author__icontains=query) |
            models.Q(genre__icontains=query)
        )
    else:
        books = Book.objects.all()

    context = {
        'books': books,
        'query': query,
    }
    return render(request, 'library/books.html', context)


def book_add(request):
    """Add a new book to the catalog."""
    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        author = request.POST.get('author', '').strip()
        genre = request.POST.get('genre', 'General').strip()
        copies = int(request.POST.get('copies', 1))

        if not title or not author:
            messages.error(request, '⚠️ Title and author are required.')
            return redirect('book_list')

        if copies < 1:
            messages.error(request, '⚠️ Copies must be at least 1.')
            return redirect('book_list')

        Book.objects.create(
            title=title,
            author=author,
            genre=genre or 'General',
            copies_available=copies,
            total_copies=copies,
        )
        messages.success(request, f'✅ Book "{title}" added successfully!')
        return redirect('book_list')

    return redirect('book_list')


def book_edit(request, book_id):
    """Edit an existing book's details."""
    book = get_object_or_404(Book, id=book_id)

    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        author = request.POST.get('author', '').strip()
        genre = request.POST.get('genre', 'General').strip()
        new_total = int(request.POST.get('total_copies', book.total_copies))

        if not title or not author:
            messages.error(request, '⚠️ Title and author are required.')
            return redirect('book_list')

        # Adjust available copies if total changed
        diff = new_total - book.total_copies
        book.title = title
        book.author = author
        book.genre = genre or 'General'
        book.total_copies = new_total
        book.copies_available = max(0, book.copies_available + diff)
        book.save()

        messages.success(request, f'✅ Book "{title}" updated successfully!')
        return redirect('book_list')

    return redirect('book_list')


def book_delete(request, book_id):
    """Delete a book from the catalog (with confirmation)."""
    book = get_object_or_404(Book, id=book_id)

    if request.method == 'POST':
        title = book.title
        book.delete()
        messages.success(request, f'🗑️ Book "{title}" has been deleted.')
        return redirect('book_list')

    return redirect('book_list')


def member_list(request):
    """Display all registered members with search."""
    query = request.GET.get('search', '')
    if query:
        members = Member.objects.filter(
            models.Q(name__icontains=query) |
            models.Q(email__icontains=query)
        )
    else:
        members = Member.objects.all()

    context = {
        'members': members,
        'query': query,
    }
    return render(request, 'library/members.html', context)


def member_add(request):
    """Register a new library member."""
    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        email = request.POST.get('email', '').strip()
        phone = request.POST.get('phone', '').strip()

        if not name or not email:
            messages.error(request, '⚠️ Name and email are required.')
            return redirect('member_list')

        if '@' not in email:
            messages.error(request, '⚠️ Please enter a valid email address.')
            return redirect('member_list')

        if Member.objects.filter(email=email).exists():
            messages.error(request, f'⚠️ A member with email "{email}" already exists.')
            return redirect('member_list')

        Member.objects.create(name=name, email=email, phone=phone)
        messages.success(request, f'✅ Member "{name}" registered successfully!')
        return redirect('member_list')

    return redirect('member_list')


def member_edit(request, member_id):
    """Edit an existing member's details."""
    member = get_object_or_404(Member, id=member_id)

    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        email = request.POST.get('email', '').strip()
        phone = request.POST.get('phone', '').strip()

        if not name or not email:
            messages.error(request, '⚠️ Name and email are required.')
            return redirect('member_list')

        member.name = name
        member.email = email
        member.phone = phone
        member.save()

        messages.success(request, f'✅ Member "{name}" updated successfully!')
        return redirect('member_list')

    return redirect('member_list')


def member_delete(request, member_id):
    """Remove a member from the library."""
    member = get_object_or_404(Member, id=member_id)

    if request.method == 'POST':
        name = member.name
        member.delete()
        messages.success(request, f'🗑️ Member "{name}" has been removed.')
        return redirect('member_list')

    return redirect('member_list')


def rental_list(request):
    """
    Display all rentals with filtering and overdue highlighting.
    Overdue rentals are highlighted in red with fine calculations.
    """
    filter_status = request.GET.get('status', 'all')
    rentals = Rental.objects.select_related('book', 'member').all()

    if filter_status == 'active':
        rentals = rentals.filter(return_date__isnull=True, due_date__gte=timezone.now().date())
    elif filter_status == 'overdue':
        rentals = rentals.filter(return_date__isnull=True, due_date__lt=timezone.now().date())
    elif filter_status == 'returned':
        rentals = rentals.filter(return_date__isnull=False)

    # Annotate each rental with computed fine
    rental_data = []
    for rental in rentals:
        rental_data.append({
            'rental': rental,
            'fine': rental.calculated_fine,
            'status': rental.status,
        })

    context = {
        'rental_data': rental_data,
        'filter_status': filter_status,
    }
    return render(request, 'library/rentals.html', context)


def rental_issue(request):
    """
    Issue a book to a member (create a new rental).
    Prevents issuing if no copies are available.
    Default loan period: 14 days.
    """
    if request.method == 'POST':
        book_id = request.POST.get('book_id')
        member_id = request.POST.get('member_id')

        if not book_id or not member_id:
            messages.error(request, '⚠️ Please select both a book and a member.')
            return redirect('rental_list')

        book = get_object_or_404(Book, id=book_id)
        member = get_object_or_404(Member, id=member_id)

        if not book.is_available:
            messages.error(
                request,
                f'⚠️ No copies available for "{book.title}". All copies are currently checked out.'
            )
            return redirect('rental_list')

        # Create rental with due date = today + loan period
        due_date = timezone.now().date() + timedelta(days=settings.DEFAULT_LOAN_DAYS)
        Rental.objects.create(
            book=book,
            member=member,
            due_date=due_date,
        )

        # Decrease available copies
        book.copies_available -= 1
        book.save()

        messages.success(
            request,
            f'✅ "{book.title}" issued to {member.name}. Due date: {due_date}'
        )
        return redirect('rental_list')

    return redirect('rental_list')


def rental_return(request, rental_id):
    """
    Return a book (mark rental as returned).
    Calculates late fine if overdue.
    """
    rental = get_object_or_404(Rental, id=rental_id)

    if rental.return_date:
        messages.warning(request, '⚠️ This book has already been returned.')
        return redirect('rental_list')

    if request.method == 'POST':
        today = timezone.now().date()
        rental.return_date = today

        # Calculate fine if overdue
        if rental.is_overdue:
            days_late = (today - rental.due_date).days
            rental.fine_amount = days_late * settings.LATE_FINE_PER_DAY
            messages.warning(
                request,
                f'⚠️ "{rental.book.title}" was {days_late} day(s) overdue. '
                f'Late fine: Rs. {rental.fine_amount:.2f}'
            )
        else:
            messages.success(request, f'✅ "{rental.book.title}" returned on time!')

        rental.save()

        # Increase available copies
        rental.book.copies_available += 1
        rental.book.save()

        return redirect('rental_list')

    return redirect('rental_list')
