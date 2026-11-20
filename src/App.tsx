// ============================================================
// MAIN APPLICATION - Library Management System
// ============================================================
// This is the entry point that organizes the app into tabs:
// Dashboard, Books, Members, and Rentals.
//
// Structure:
// - Data layer: useLibraryData hook (manages state + localStorage persistence)
// - UI layer: Tab-based navigation with dedicated components per section
//
// Features:
// 1. Book management: add, edit, delete, search
// 2. Member management: register, edit, remove
// 3. Rentals: issue books (14-day loan), return, overdue tracking
// 4. Dashboard: summary statistics
// 5. Data persistence: auto-save/load from localStorage (JSON)
// ============================================================

import React, { useState } from 'react';
import { TabType } from './types';
import { useLibraryData } from './hooks/useLibraryData';
import Dashboard from './components/Dashboard';
import BookManager from './components/BookManager';
import MemberManager from './components/MemberManager';
import RentalManager from './components/RentalManager';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Load all library data (from localStorage or sample data)
  const {
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
  } = useLibraryData();

  // Tab configuration
  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'books', label: 'Books', icon: '📚' },
    { id: 'members', label: 'Members', icon: '👥' },
    { id: 'rentals', label: 'Rentals', icon: '🔄' },
  ];

  const stats = getDashboardStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* ===== HEADER / TITLE BAR ===== */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-xl">📖</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Library Management System</h1>
                <p className="text-xs text-gray-500">Manage books, members, and rentals</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Data auto-saved
            </div>
          </div>
        </div>
      </header>

      {/* ===== TAB NAVIGATION (like ttk.Notebook) ===== */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
                {tab.id === 'rentals' && stats.overdueCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {stats.overdueCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ===== MAIN CONTENT AREA ===== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'dashboard' && <Dashboard stats={stats} />}
        {activeTab === 'books' && (
          <BookManager
            books={getBooksList()}
            onAdd={addBook}
            onEdit={editBook}
            onDelete={deleteBook}
          />
        )}
        {activeTab === 'members' && (
          <MemberManager
            members={getMembersList()}
            onAdd={addMember}
            onEdit={editMember}
            onDelete={deleteMember}
          />
        )}
        {activeTab === 'rentals' && (
          <RentalManager
            rentals={getRentalsList()}
            books={getBooksList()}
            members={getMembersList()}
            onIssue={issueBook}
            onReturn={returnBook}
            getBookById={getBookById}
            getMemberById={getMemberById}
          />
        )}
      </main>

      {/* ===== STATUS BAR (bottom) ===== */}
      <footer className="bg-white border-t border-gray-200 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>📚 {stats.totalBooks} books</span>
            <span>👥 {stats.totalMembers} members</span>
            <span>🔄 {stats.activeRentalCount} active rentals</span>
          </div>
          <div className="flex items-center gap-2">
            {stats.overdueCount > 0 && (
              <span className="text-red-500 font-medium">
                ⚠️ {stats.overdueCount} overdue
              </span>
            )}
            <span className="text-gray-400">|</span>
            <span>Library Management System v1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
