// ============================================================
// BOOK MANAGER COMPONENT - Add, Edit, Delete, Search Books
// ============================================================
// Handles all book-related operations with a clean table view.

import React, { useState } from 'react';
import { Book } from '../types';

interface BookManagerProps {
  books: Book[];
  onAdd: (title: string, author: string, genre: string, copies: number) => void;
  onEdit: (bookId: string, updates: Partial<Omit<Book, 'book_id'>>) => void;
  onDelete: (bookId: string) => void;
}

const BookManager: React.FC<BookManagerProps> = ({ books, onAdd, onEdit, onDelete }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({ title: '', author: '', genre: '', copies: 1 });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Filter books based on search (by title, author, or genre)
  const filteredBooks = books.filter(book => {
    const query = searchQuery.toLowerCase();
    return (
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.genre.toLowerCase().includes(query)
    );
  });

  const handleAddBook = () => {
    if (!formData.title.trim() || !formData.author.trim()) {
      alert('⚠️ Please fill in at least the title and author.');
      return;
    }
    if (formData.copies < 1) {
      alert('⚠️ Copies must be at least 1.');
      return;
    }
    onAdd(formData.title.trim(), formData.author.trim(), formData.genre.trim() || 'General', formData.copies);
    resetForm();
  };

  const handleEditBook = () => {
    if (!editingBook) return;
    if (!formData.title.trim() || !formData.author.trim()) {
      alert('⚠️ Please fill in at least the title and author.');
      return;
    }
    onEdit(editingBook.book_id, {
      title: formData.title.trim(),
      author: formData.author.trim(),
      genre: formData.genre.trim() || 'General',
      total_copies: formData.copies,
    });
    resetForm();
  };

  const handleDelete = (bookId: string) => {
    onDelete(bookId);
    setConfirmDelete(null);
  };

  const startEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      genre: book.genre,
      copies: book.total_copies,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingBook(null);
    setFormData({ title: '', author: '', genre: '', copies: 1 });
  };

  return (
    <div className="space-y-4">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search by title, author, or genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm whitespace-nowrap"
        >
          + Add Book
        </button>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            {editingBook ? '✏️ Edit Book' : '📕 Add New Book'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Book title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Author *</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Author name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Genre</label>
              <input
                type="text"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Fiction, Science, History"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Total Copies</label>
              <input
                type="number"
                min="1"
                value={formData.copies}
                onChange={(e) => setFormData({ ...formData, copies: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={editingBook ? handleEditBook : handleAddBook}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              {editingBook ? '💾 Save Changes' : '✅ Add Book'}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Books Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">ID</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Title</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Author</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Genre</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Available</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Total</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    {searchQuery ? 'No books match your search.' : 'No books in the library yet.'}
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr key={book.book_id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{book.book_id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{book.title}</td>
                    <td className="px-4 py-3 text-gray-600">{book.author}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {book.genre}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold ${book.copies_available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {book.copies_available}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{book.total_copies}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => startEdit(book)}
                          className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        {confirmDelete === book.book_id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleDelete(book.book_id)}
                              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(book.book_id)}
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
          Showing {filteredBooks.length} of {books.length} books
        </div>
      </div>
    </div>
  );
};

export default BookManager;
