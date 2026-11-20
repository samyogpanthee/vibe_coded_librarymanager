// ============================================================
// TYPE DEFINITIONS - Data structures for the Library System
// ============================================================
// These interfaces define the shape of our data, similar to
// how Python dictionaries would be structured.

export interface Book {
  book_id: string;
  title: string;
  author: string;
  genre: string;
  copies_available: number;
  total_copies: number;
}

export interface Member {
  member_id: string;
  name: string;
  email: string;
  phone: string;
  registration_date: string; // ISO date string
}

export interface Rental {
  rental_id: string;
  book_id: string;
  member_id: string;
  issue_date: string;   // ISO date string
  due_date: string;     // ISO date string
  return_date: string | null; // null if not yet returned
  status: 'active' | 'returned' | 'overdue';
  fine_amount: number;
}

export interface LibraryData {
  book_catalog: Record<string, Book>;
  member_records: Record<string, Member>;
  active_rentals: Record<string, Rental>;
}

export type TabType = 'dashboard' | 'books' | 'members' | 'rentals';
