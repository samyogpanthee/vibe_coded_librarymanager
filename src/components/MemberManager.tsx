// ============================================================
// MEMBER MANAGER COMPONENT - Register, Edit, Remove Members
// ============================================================
// Handles member registration and management with search.

import React, { useState } from 'react';
import { Member } from '../types';

interface MemberManagerProps {
  members: Member[];
  onAdd: (name: string, email: string, phone: string) => void;
  onEdit: (memberId: string, updates: Partial<Omit<Member, 'member_id'>>) => void;
  onDelete: (memberId: string) => void;
}

const MemberManager: React.FC<MemberManagerProps> = ({ members, onAdd, onEdit, onDelete }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Filter members by name or email
  const filteredMembers = members.filter(member => {
    const query = searchQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      member.member_id.toLowerCase().includes(query)
    );
  });

  const handleAddMember = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('⚠️ Please fill in at least the name and email.');
      return;
    }
    // Basic email validation
    if (!formData.email.includes('@')) {
      alert('⚠️ Please enter a valid email address.');
      return;
    }
    onAdd(formData.name.trim(), formData.email.trim(), formData.phone.trim());
    resetForm();
  };

  const handleEditMember = () => {
    if (!editingMember) return;
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('⚠️ Please fill in at least the name and email.');
      return;
    }
    onEdit(editingMember.member_id, {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
    });
    resetForm();
  };

  const handleDelete = (memberId: string) => {
    onDelete(memberId);
    setConfirmDelete(null);
  };

  const startEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({ name: member.name, email: member.email, phone: member.phone });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingMember(null);
    setFormData({ name: '', email: '', phone: '' });
  };

  return (
    <div className="space-y-4">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
          />
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium shadow-sm whitespace-nowrap"
        >
          + Register Member
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            {editingMember ? '✏️ Edit Member' : '👤 Register New Member'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="555-0100"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={editingMember ? handleEditMember : handleAddMember}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              {editingMember ? '💾 Save Changes' : '✅ Register'}
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

      {/* Members Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">ID</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Phone</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Registered</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    {searchQuery ? 'No members match your search.' : 'No members registered yet.'}
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.member_id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{member.member_id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{member.name}</td>
                    <td className="px-4 py-3 text-gray-600">{member.email}</td>
                    <td className="px-4 py-3 text-gray-600">{member.phone || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{member.registration_date}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => startEdit(member)}
                          className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        {confirmDelete === member.member_id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleDelete(member.member_id)}
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
                            onClick={() => setConfirmDelete(member.member_id)}
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                            title="Remove"
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
          Showing {filteredMembers.length} of {members.length} members
        </div>
      </div>
    </div>
  );
};

export default MemberManager;
