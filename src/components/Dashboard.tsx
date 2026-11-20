// ============================================================
// DASHBOARD COMPONENT - Summary statistics and overview
// ============================================================
// Shows total books, copies available, active rentals, overdue count.

import React from 'react';

interface DashboardProps {
  stats: {
    totalBooks: number;
    totalCopies: number;
    copiesAvailable: number;
    totalMembers: number;
    activeRentalCount: number;
    overdueCount: number;
    totalFines: number;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  const statCards = [
    { label: 'Total Books', value: stats.totalBooks, icon: '📚', color: 'from-blue-500 to-blue-600' },
    { label: 'Total Copies', value: stats.totalCopies, icon: '📖', color: 'from-indigo-500 to-indigo-600' },
    { label: 'Available Copies', value: stats.copiesAvailable, icon: '✅', color: 'from-green-500 to-green-600' },
    { label: 'Members', value: stats.totalMembers, icon: '👥', color: 'from-purple-500 to-purple-600' },
    { label: 'Active Rentals', value: stats.activeRentalCount, icon: '🔄', color: 'from-amber-500 to-amber-600' },
    { label: 'Overdue', value: stats.overdueCount, icon: '⚠️', color: 'from-red-500 to-red-600' },
    { label: 'Total Fines', value: `$${stats.totalFines.toFixed(2)}`, icon: '💰', color: 'from-rose-500 to-rose-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Library Dashboard</h2>
        <p className="text-gray-500 mt-1">Overview of your library's current status</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`bg-gradient-to-br ${card.color} rounded-xl p-5 text-white shadow-lg transform hover:scale-105 transition-transform duration-200`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">{card.label}</p>
                <p className="text-3xl font-bold mt-1">{card.value}</p>
              </div>
              <span className="text-4xl opacity-80">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Info Section */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">📋 Quick Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-sm text-blue-600 font-medium">Loan Period</p>
            <p className="text-xl font-bold text-blue-800">14 Days</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-100">
            <p className="text-sm text-red-600 font-medium">Late Fine Rate</p>
            <p className="text-xl font-bold text-red-800">$0.50 / day</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <p className="text-sm text-green-600 font-medium">Books Checked Out</p>
            <p className="text-xl font-bold text-green-800">{stats.totalCopies - stats.copiesAvailable}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
            <p className="text-sm text-amber-600 font-medium">Availability Rate</p>
            <p className="text-xl font-bold text-amber-800">
              {stats.totalCopies > 0 ? Math.round((stats.copiesAvailable / stats.totalCopies) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
