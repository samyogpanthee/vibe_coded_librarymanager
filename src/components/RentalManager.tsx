// ============================================================
// RENTAL MANAGER COMPONENT - Issue, Return, Overdue Tracking
// ============================================================
// Handles book rentals with 14-day loan period, overdue detection,
// and fine calculation ($0.50/day late).

import React, { useState } from 'react';
import { Rental, Book, Member } from '../types';

interface RentalManagerProps {
  rentals: Rental[];
  books: Book[];
  members: Member[];
  onIssue: (bookId: string, memberId: string) => void;
  onReturn: (rentalId: string) => void;
  getBookById: (bookId: string) => Book | undefined;
  getMemberById: (memberId: string) => Member | undefined;
}

const RentalManager: React.FC<RentalManagerProps> = ({
  rentals,
  books,
  members,
  onIssue,
  onReturn,
  getBookById,
  getMemberById,
}) => {
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'overdue' | 'returned'>('all');

  // Filter rentals by status
  const filteredRentals = rentals.filter(rental => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'returned') return rental.return_date !== null;
    if (filterStatus === 'active') return rental.status === 'active' && !rental.return_date;
    if (filterStatus === 'overdue') return rental.status === 'overdue' && !rental.return_date;
    return true;
  });

  // Sort: overdue first, then active, then returned
  const sortedRentals = [...filteredRentals].sort((a, b) => {
    const statusOrder = { overdue: 0, active: 1, returned: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const handleIssueBook = () => {
    if (!selectedBookId || !selectedMemberId) {
      alert('⚠️ Please select both a book and a member.');
      return;
    }
    const book = getBookById(selectedBookId);
    if (!book) {
      alert('⚠️ Book not found.');
      return;
    }
    if (book.copies_available <= 0) {
      alert(`⚠️ No copies available for "${book.title}". All copies are currently checked out.`);
      return;
    }
    onIssue(selectedBookId, selectedMemberId);
    setShowIssueForm(false);
    setSelectedBookId('');
    setSelectedMemberId('');
  };

  const handleReturn = (rentalId: string) => {
    const rental = rentals.find(r => r.rental_id === rentalId);
    if (!rental) return;

    const book = getBookById(rental.book_id);
    const member = getMemberById(rental.member_id);

    // Calculate fine for confirmation message
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(rental.due_date);
    dueDate.setHours(0, 0, 0, 0);
    const daysLate = today > dueDate
      ? Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    const fine = daysLate * 0.50;

    const message = fine > 0
      ? `Return "${book?.title}" for ${member?.name}?\n\n⚠️ OVERDUE by ${daysLate} day(s) — Late fine: $${fine.toFixed(2)}`
      : `Return "${book?.title}" for ${member?.name}?`;

    if (window.confirm(message)) {
      onReturn(rentalId);
    }
  };

  // Get available books (those with copies available)
  const availableBooks = books.filter(b => b.copies_available > 0);

  const getStatusBadge = (rental: Rental) => {
    if (rental.return_date) {
      return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Returned</span>;
    }
    if (rental.status === 'overdue') {
      return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium animate-pulse">⚠️ Overdue</span>;
    }
    return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span>;
  };

  return (
    <div className="space-y-4">
      {/* Header with Filter and Issue Button */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'active', 'overdue', 'returned'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filterStatus === status
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? '📋 All' : status === 'active' ? '✅ Active' : status === 'overdue' ? '⚠️ Overdue' : '↩️ Returned'}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowIssueForm(true)}
          className="px-4 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium shadow-sm whitespace-nowrap"
        >
          📤 Issue Book
        </button>
      </div>

      {/* Issue Book Form */}
      {showIssueForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">📤 Issue Book to Member</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Select Book *</label>
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="">-- Choose a book --</option>
                {availableBooks.map(book => (
                  <option key={book.book_id} value={book.book_id}>
                    {book.title} by {book.author} ({book.copies_available} available)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Select Member *</label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="">-- Choose a member --</option>
                {members.map(member => (
                  <option key={member.member_id} value={member.member_id}>
                    {member.name} ({member.member_id})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100 text-sm text-amber-700">
            ℹ️ Loan period: <strong>14 days</strong> from today. Late fine: <strong>$0.50/day</strong>.
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleIssueBook}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              ✅ Issue Book
            </button>
            <button
              onClick={() => { setShowIssueForm(false); setSelectedBookId(''); setSelectedMemberId(''); }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rentals Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Rental ID</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Book</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Member</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Issue Date</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Due Date</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Return Date</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Fine</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedRentals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                    No rentals found.
                  </td>
                </tr>
              ) : (
                sortedRentals.map((rental) => {
                  const book = getBookById(rental.book_id);
                  const member = getMemberById(rental.member_id);
                  const isOverdue = rental.status === 'overdue' && !rental.return_date;

                  return (
                    <tr
                      key={rental.rental_id}
                      className={`transition ${isOverdue ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{rental.rental_id}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {book ? book.title : <span className="text-red-400">Deleted</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {member ? member.name : <span className="text-red-400">Deleted</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{rental.issue_date}</td>
                      <td className={`px-4 py-3 text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                        {rental.due_date}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {rental.return_date || '—'}
                      </td>
                      <td className="px-4 py-3 text-center">{getStatusBadge(rental)}</td>
                      <td className="px-4 py-3 text-center">
                        {rental.fine_amount > 0 ? (
                          <span className="text-red-600 font-bold">${rental.fine_amount.toFixed(2)}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {!rental.return_date ? (
                          <button
                            onClick={() => handleReturn(rental.rental_id)}
                            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-medium"
                          >
                            ↩️ Return
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
          Showing {sortedRentals.length} of {rentals.length} rentals
          {filterStatus !== 'all' && ` (filtered: ${filterStatus})`}
        </div>
      </div>
    </div>
  );
};

export default RentalManager;
