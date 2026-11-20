// ============================================================
// SAMPLE DATA - Initial data created on first run
// ============================================================
// Just like the Python version creates sample books and members
// on first run, this provides starter data so the app isn't empty.

import { Book, Member, Rental } from '../types';

export const sampleBooks: Record<string, Book> = {
  'B001': {
    book_id: 'B001',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: 'Classic Fiction',
    copies_available: 3,
    total_copies: 3,
  },
  'B002': {
    book_id: 'B002',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    genre: 'Classic Fiction',
    copies_available: 2,
    total_copies: 2,
  },
  'B003': {
    book_id: 'B003',
    title: '1984',
    author: 'George Orwell',
    genre: 'Dystopian',
    copies_available: 4,
    total_copies: 4,
  },
  'B004': {
    book_id: 'B004',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    genre: 'Romance',
    copies_available: 1,
    total_copies: 2,
  },
  'B005': {
    book_id: 'B005',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    genre: 'Fantasy',
    copies_available: 3,
    total_copies: 3,
  },
  'B006': {
    book_id: 'B006',
    title: 'Python Crash Course',
    author: 'Eric Matthes',
    genre: 'Programming',
    copies_available: 5,
    total_copies: 5,
  },
};

export const sampleMembers: Record<string, Member> = {
  'M001': {
    member_id: 'M001',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '555-0101',
    registration_date: '2025-01-15',
  },
  'M002': {
    member_id: 'M002',
    name: 'Bob Smith',
    email: 'bob@example.com',
    phone: '555-0102',
    registration_date: '2025-02-20',
  },
  'M003': {
    member_id: 'M003',
    name: 'Carol Davis',
    email: 'carol@example.com',
    phone: '555-0103',
    registration_date: '2025-03-10',
  },
};

// Sample rentals - one active, one overdue, one returned
const today = new Date();
const twoWeeksAgo = new Date(today);
twoWeeksAgo.setDate(today.getDate() - 14);

const threeWeeksAgo = new Date(today);
threeWeeksAgo.setDate(today.getDate() - 21);

const oneWeekAgo = new Date(today);
oneWeekAgo.setDate(today.getDate() - 7);

export const sampleRentals: Record<string, Rental> = {
  'R001': {
    rental_id: 'R001',
    book_id: 'B004',
    member_id: 'M001',
    issue_date: twoWeeksAgo.toISOString().split('T')[0],
    due_date: today.toISOString().split('T')[0],
    return_date: null,
    status: 'active',
    fine_amount: 0,
  },
  'R002': {
    rental_id: 'R002',
    book_id: 'B002',
    member_id: 'M002',
    issue_date: threeWeeksAgo.toISOString().split('T')[0],
    due_date: oneWeekAgo.toISOString().split('T')[0],
    return_date: null,
    status: 'overdue',
    fine_amount: 3.5, // $0.50/day * 7 days late
  },
};
