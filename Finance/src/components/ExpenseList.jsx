import React, { useState } from 'react';

const ExpenseList = ({ expenses, onDelete, onEdit }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Food & Dining': '🍽️',
      'Transportation': '🚗',
      'Shopping': '🛍️',
      'Entertainment': '🎬',
      'Bills & Utilities': '📄',
      'Healthcare': '🏥',
      'Education': '📚',
      'Travel': '✈️',
      'Groceries': '🛒',
      'Gas': '⛽',
      'Other': '📦'
    };
    return icons[category] || '📦';
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      'cash': '💵',
      'credit_card': '💳',
      'debit_card': '💳',
      'bank_transfer': '🏦',
      'digital_wallet': '📱'
    };
    return icons[method] || '💳';
  };

  const startEdit = (expense) => {
    setEditingId(expense.id);
    setEditForm({
      amount: expense.amount,
      description: expense.description,
      category: expense.category,
      date: expense.date,
      paymentMethod: expense.paymentMethod
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    onEdit(editingId, editForm);
    setEditingId(null);
    setEditForm({});
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Build a UPI payment deep link that opens supported apps (GPay/PhonePe/etc.) on mobile
  const buildUpiUrl = ({ pa, pn, am, tn, cu = 'INR', tr }) => {
    const params = new URLSearchParams();
    if (pa) params.set('pa', pa); // Payee VPA
    if (pn) params.set('pn', pn); // Payee name
    if (am) params.set('am', am); // Amount
    if (tn) params.set('tn', tn); // Note
    params.set('cu', cu);
    if (tr) params.set('tr', tr); // Transaction reference (optional)
    return `upi://pay?${params.toString()}`;
  };

  // Trigger payment via UPI deep link
  const handlePay = (expense) => {
    const upiId = expense.upiId || import.meta.env.VITE_DEFAULT_UPI_ID;
    if (!upiId) {
      alert('UPI ID not configured. Please set VITE_DEFAULT_UPI_ID in your .env or provide expense.upiId');
      return;
    }
    const payeeName = import.meta.env.VITE_UPI_PAYEE_NAME || 'ExpenseAI';
    const amount = Number(expense.amount || 0).toFixed(2);
    const note = (expense.description || 'Expense Payment').slice(0, 40);

    const url = buildUpiUrl({ pa: upiId, pn: payeeName, am: amount, tn: note });

    // On mobile, this will open the UPI app; on desktop, it may do nothing
    window.location.href = url;
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
        <div className="text-6xl mb-4">💸</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No expenses yet</h3>
        <p className="text-gray-600">Start tracking your expenses by adding your first transaction above.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Recent Expenses</h2>
        <p className="text-gray-600">Total: {expenses.length} transactions</p>
      </div>

      <div className="divide-y divide-gray-200">
        {expenses.map((expense) => (
          <div key={expense.id} className="p-6 hover:bg-gray-50 transition-colors">
            {editingId === expense.id ? (
              // Edit Mode
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input
                      type="number"
                      value={editForm.amount}
                      onChange={(e) => handleEditChange('amount', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={editForm.category}
                      onChange={(e) => handleEditChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Food & Dining">Food & Dining</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Bills & Utilities">Bills & Utilities</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Travel">Travel</option>
                      <option value="Groceries">Groceries</option>
                      <option value="Gas">Gas</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) => handleEditChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={saveEdit}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">
                    {getCategoryIcon(expense.category)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{expense.description}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{expense.category}</span>
                      <span>•</span>
                      <span>{formatDate(expense.date)}</span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <span>{getPaymentMethodIcon(expense.paymentMethod)}</span>
                        <span>{expense.paymentMethod.replace('_', ' ')}</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {formatAmount(expense.amount)}
                    </div>
                    {expense.updatedAt && (
                      <div className="text-xs text-gray-500">
                        Updated {formatDate(expense.updatedAt)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePay(expense)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                      title="Pay via UPI (GPay/PhonePe)"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.5 0-3 .75-3 2s1.5 2 3 2 3 .75 3 2-1.5 2-3 2m0-8V7m0 10v-1m7-6a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => startEdit(expense)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit expense"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(expense.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete expense"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseList;
