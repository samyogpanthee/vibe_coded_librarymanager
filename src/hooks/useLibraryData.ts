// ============================================================
// DATA PERSISTENCE HOOK - Manages library data with localStorage
// ============================================================
// This replaces the Python JSON file handling. It automatically
// loads data on startup and saves whenever data changes.
// Handles missing or corrupted data gracefully (like try/except).

import { useState, useEffect, useCallback } from 'react';
import { Book, Member, Rental, LibraryData } from '../types';
import { sampleBooks, sampleMembers, sampleRentals } from '../utils/sampleData';

const STORAGE_KEY = 'library_data';
const LATE_FINE_PER_DAY = 50; // Rs. 50 per day late (NPR)
const DEFAULT_LOAN_DAYS = 14;

function generateId(prefix: string, existingIds: string[]): string {
  // Generate a new unique ID with the given prefix
  let counter = existingIds.length + 1;
  let newId = `${prefix}${String(counter).padStart(3, '0')}`;
  while (existingIds.includes(newId)) {
    counter++;
    newId = `${prefix}${String(counter).padStart(3, '0')}`;
  }
  return newId;
}

function loadLibraryData(): LibraryData {
  // Try to load from localStorage (like loading from JSON file)
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as LibraryData;
      // Validate the data structure
      if (parsed.book_catalog && parsed.member_records && parsed.active_rentals) {
        return parsed;
      }
    }
  } catch (error) {
    // If data is corrupted, start fresh with sample data
    console.warn('Corrupted library data detected. Loading sample data.', error);
  }

  // Return sample data for first run (or if file was corrupted)
  return {
    book_catalog: { ...sampleBooks },
    member_records: { ...sampleMembers },
    active_rentals: { ...sampleRentals },
  };
}

function saveLibraryData(data: LibraryData): void {
  // Save all data to localStorage (like saving to JSON file)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save library data:', error);
  }
}

function calculateOverdueStatus(rental: Rental): { status: 'active' | 'overdue'; fine: number } {
  // Check if a rental is overdue and calculate fine
  if (rental.return_date) {
    return { status: 'active', fine: rental.fine_amount };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(rental.due_date);
  dueDate.setHours(0, 0, 0, 0);

  if (today > dueDate) {
    const daysLate = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    const fine = daysLate * LATE_FINE_PER_DAY;
    return { status: 'overdue', fine };
  }

  return { status: 'active', fine: 0 };
}

export function useLibraryData() {
  const [data, setData] = useState<LibraryData>(loadLibraryData);

  // Auto-save whenever data changes
  useEffect(() => {
    saveLibraryData(data);
  }, [data]);

  // ---- BOOK OPERATIONS ----

  const addBook = useCallback((title: string, author: string, genre: string, copies: number) => {
    setData(prev => {
      const existingIds = Object.keys(prev.book_catalog);
      const newId = generateId('B', existingIds);
      const newBook: Book = {
        book_id: newId,
        title,
        author,
        genre,
        copies_available: copies,
        total_copies: copies,
      };
      return { ...prev, book_catalog: { ...prev.book_catalog, [newId]: newBook } };
    });
  }, []);

  const editBook = useCallback((bookId: string, updates: Partial<Omit<Book, 'book_id'>>) => {
    setData(prev => {
      const book = prev.book_catalog[bookId];
      if (!book) return prev;
      const updatedBook = { ...book, ...updates };
      // If total copies changed, adjust available copies proportionally
      if (updates.total_copies !== undefined && updates.total_copies !== book.total_copies) {
        const diff = updates.total_copies - book.total_copies;
        updatedBook.copies_available = Math.max(0, book.copies_available + diff);
      }
      return {
        ...prev,
        book_catalog: { ...prev.book_catalog, [bookId]: updatedBook },
      };
    });
  }, []);

  const deleteBook = useCallback((bookId: string) => {
    setData(prev => {
      const newCatalog = { ...prev.book_catalog };
      delete newCatalog[bookId];
      return { ...prev, book_catalog: newCatalog };
    });
  }, []);

  // ---- MEMBER OPERATIONS ----

  const addMember = useCallback((name: string, email: string, phone: string) => {
    setData(prev => {
      const existingIds = Object.keys(prev.member_records);
      const newId = generateId('M', existingIds);
      const newMember: Member = {
        member_id: newId,
        name,
        email,
        phone,
        registration_date: new Date().toISOString().split('T')[0],
      };
      return { ...prev, member_records: { ...prev.member_records, [newId]: newMember } };
    });
  }, []);

  const editMember = useCallback((memberId: string, updates: Partial<Omit<Member, 'member_id'>>) => {
    setData(prev => {
      const member = prev.member_records[memberId];
      if (!member) return prev;
      return {
        ...prev,
        member_records: { ...prev.member_records, [memberId]: { ...member, ...updates } },
      };
    });
  }, []);

  const deleteMember = useCallback((memberId: string) => {
    setData(prev => {
      const newRecords = { ...prev.member_records };
      delete newRecords[memberId];
      return { ...prev, member_records: newRecords };
    });
  }, []);

  // ---- RENTAL OPERATIONS ----

  const issueBook = useCallback((bookId: string, memberId: string) => {
    setData(prev => {
      const book = prev.book_catalog[bookId];
      if (!book || book.copies_available <= 0) return prev;

      const existingIds = Object.keys(prev.active_rentals);
      const newId = generateId('R', existingIds);

      const today = new Date();
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + DEFAULT_LOAN_DAYS);

      const newRental: Rental = {
        rental_id: newId,
        book_id: bookId,
        member_id: memberId,
        issue_date: today.toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        return_date: null,
        status: 'active',
        fine_amount: 0,
      };

      // Decrease available copies
      const updatedBook = { ...book, copies_available: book.copies_available - 1 };

      return {
        ...prev,
        book_catalog: { ...prev.book_catalog, [bookId]: updatedBook },
        active_rentals: { ...prev.active_rentals, [newId]: newRental },
      };
    });
  }, []);

  const returnBook = useCallback((rentalId: string) => {
    setData(prev => {
      const rental = prev.active_rentals[rentalId];
      if (!rental || rental.return_date) return prev;

      const today = new Date();
      const dueDate = new Date(rental.due_date);
      dueDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      let fine = 0;
      if (today > dueDate) {
        const daysLate = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        fine = daysLate * LATE_FINE_PER_DAY;
      }

      const updatedRental: Rental = {
        ...rental,
        return_date: today.toISOString().split('T')[0],
        fine_amount: fine,
      };

      // Increase available copies
      const book = prev.book_catalog[rental.book_id];
      const updatedBook = book
        ? { ...book, copies_available: book.copies_available + 1 }
        : book;

      return {
        ...prev,
        book_catalog: updatedBook ? { ...prev.book_catalog, [rental.book_id]: updatedBook } : prev.book_catalog,
        active_rentals: { ...prev.active_rentals, [rentalId]: updatedRental },
      };
    });
  }, []);

  // ---- COMPUTED VALUES ----

  const getBooksList = useCallback((): Book[] => {
    return Object.values(data.book_catalog);
  }, [data.book_catalog]);

  const getMembersList = useCallback((): Member[] => {
    return Object.values(data.member_records);
  }, [data.member_records]);

  const getRentalsList = useCallback((): Rental[] => {
    // Update overdue statuses on the fly
    return Object.values(data.active_rentals).map(rental => {
      if (!rental.return_date) {
        const { status, fine } = calculateOverdueStatus(rental);
        return { ...rental, status, fine_amount: fine };
      }
      return rental;
    });
  }, [data.active_rentals]);

  const getDashboardStats = useCallback(() => {
    const books = Object.values(data.book_catalog);
    const rentals = Object.values(data.active_rentals);
    const activeRentals = rentals.filter(r => !r.return_date);
    const overdueRentals = activeRentals.filter(r => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(r.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return today > dueDate;
    });

    const totalBooks = books.length;
    const totalCopies = books.reduce((sum, b) => sum + b.total_copies, 0);
    const copiesAvailable = books.reduce((sum, b) => sum + b.copies_available, 0);
    const totalMembers = Object.keys(data.member_records).length;
    const activeRentalCount = activeRentals.length;
    const overdueCount = overdueRentals.length;
    const totalFines = overdueRentals.reduce((sum, r) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(r.due_date);
      dueDate.setHours(0, 0, 0, 0);
      const daysLate = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      return sum + (daysLate * LATE_FINE_PER_DAY);
    }, 0);

    return { totalBooks, totalCopies, copiesAvailable, totalMembers, activeRentalCount, overdueCount, totalFines };
  }, [data]);

  const getBookById = useCallback((bookId: string): Book | undefined => {
    return data.book_catalog[bookId];
  }, [data.book_catalog]);

  const getMemberById = useCallback((memberId: string): Member | undefined => {
    return data.member_records[memberId];
  }, [data.member_records]);

  return {
    data,
    addBook,
    editBook,
    deleteBook,
    addMember,
    editMember,
    deleteMember,
    issueBook,
    returnBook,
    getBooksList,
    getMembersList,
    getRentalsList,
    getDashboardStats,
    getBookById,
    getMemberById,
  };
}
