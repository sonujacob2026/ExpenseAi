import React, { useState, useEffect } from 'react';
import { useToast } from './ToastProvider';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { supabase } from '../lib/supabase';
import { createOrder, payWithRazorpay } from '../services/paymentService';

const RecurringExpensesManager = ({ refreshKey = 0 }) => {
  const { user } = useSupabaseAuth();
  const toast = useToast();
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: '',
    frequency: 'monthly',
    nextDueDate: '',
    description: '',
    isActive: true
  });

  // Load recurring expenses
  useEffect(() => {
    if (user?.id) {
      loadRecurringExpenses();
    }
  }, [user?.id, refreshKey]);

  const loadRecurringExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_recurring', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading recurring expenses:', error);
      } else {
        setRecurringExpenses(data || []);
      }
    } catch (error) {
      console.error('Exception loading recurring expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.amount || !formData.category || !formData.nextDueDate) {
      toast.info('Please fill in all required fields');
      return;
    }

    try {
      const expenseData = {
        user_id: user.id,
        amount: parseFloat(formData.amount),
        description: formData.description || `Recurring: ${formData.name}`,
        category: formData.category,
        subcategory: 'Recurring',
        date: formData.nextDueDate,
        payment_method: 'Auto Debit',
        is_recurring: true,
        recurring_frequency: formData.frequency,
        tags: ['recurring', 'auto'],
        notes: `Recurring expense: ${formData.name}`
      };

      const { data, error } = await supabase
        .from('expenses')
        .insert([expenseData])
        .select();

      if (error) {
        console.error('Error adding recurring expense:', error);
        toast.error('Error adding recurring expense. Please try again.');
      } else {
        console.log('Recurring expense added successfully:', data);
        setShowAddForm(false);
        setFormData({
          name: '',
          amount: '',
          category: '',
          frequency: 'monthly',
          nextDueDate: '',
          description: '',
          isActive: true
        });
        loadRecurringExpenses();
        toast.success('Recurring expense added successfully!');
      }
    } catch (error) {
      console.error('Exception adding recurring expense:', error);
      toast.error('Error adding recurring expense. Please try again.');
    }
  };

  const markAsPaid = async (expenseId) => {
    try {
      const expense = recurringExpenses.find(exp => exp.id === expenseId);
      if (!expense) return;

      // Create a new expense entry for this payment
      const paymentData = {
        user_id: user.id,
        amount: expense.amount,
        description: expense.description,
        category: expense.category,
        subcategory: expense.subcategory,
        date: new Date().toISOString().split('T')[0],
        payment_method: expense.payment_method,
        is_recurring: false,
        tags: ['recurring-payment'],
        notes: `Paid recurring expense: ${expense.description}`
      };

      const { error } = await supabase
        .from('expenses')
        .insert([paymentData]);

      if (error) {
        console.error('Error marking as paid:', error);
        toast.error('Error marking as paid. Please try again.');
      } else {
        toast.success('Expense marked as paid!');
        loadRecurringExpenses();
      }
    } catch (error) {
      console.error('Exception marking as paid:', error);
      toast.error('Error marking as paid. Please try again.');
    }
  };

  const deleteRecurringExpense = async (expenseId) => {
    if (!confirm('Are you sure you want to delete this recurring expense?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) {
        console.error('Error deleting recurring expense:', error);
        toast.error('Error deleting recurring expense. Please try again.');
      } else {
        toast.success('Recurring expense deleted successfully!');
        loadRecurringExpenses();
      }
    } catch (error) {
      console.error('Exception deleting recurring expense:', error);
      toast.error('Error deleting recurring expense. Please try again.');
    }
  };

  // Check if payment system is properly configured
  const isPaymentSystemConfigured = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    
    // Valid if either Supabase+RZP or Backend URL+RZP is configured
    const supabaseOk = supabaseUrl && supabaseKey && !supabaseUrl.includes('your_') && !supabaseKey.includes('your_');
    const backendOk = backendUrl && backendUrl.length > 0;
    return razorpayKey && !razorpayKey.includes('your_') && (supabaseOk || backendOk);
  };

  // Trigger Razorpay payment for a recurring expense
  const payRecurring = async (expense) => {
    try {
      // Check if payment system is configured
      if (!isPaymentSystemConfigured()) {
        // Demo mode - simulate payment
        const confirmed = confirm(
          `Demo Payment Mode\n\n` +
          `Expense: ${expense.description}\n` +
          `Amount: ₹${expense.amount}\n\n` +
          `This is a demo payment. In production, this would open Razorpay checkout.\n\n` +
          `Would you like to mark this as paid?`
        );
        
        if (confirmed) {
          await markAsPaid(expense.id);
          toast.success('Demo payment completed! Expense marked as paid.');
        }
        return;
      }

      const { success, order, message } = await createOrder({
        amount: Number(expense.amount),
        userId: user.id,
        expenseId: expense.id,
        description: expense.description
      });

      if (!success) {
        toast.error(message || 'Failed to create order');
        return;
      }

      await payWithRazorpay({ order, user, expense });
      try { window.Swal && await window.Swal.fire({ icon: 'success', title: 'Payment successful', text: expense.description }); } catch {}
      // Mark paid by creating a concrete expense row
      await markAsPaid(expense.id);
      // Advance the recurring expense's anchor date to today so next due shifts to next cycle
      const todayIso = new Date().toISOString().split('T')[0];
      await supabase.from('expenses').update({ date: todayIso }).eq('id', expense.id);
      loadRecurringExpenses();
    } catch (e) {
      console.error('Payment error:', e);
      toast.error(e.message || 'Payment failed or cancelled');
    }
  };

  const getFrequencyIcon = (frequency) => {
    const icons = {
      daily: '📅',
      weekly: '📅',
      monthly: '📅',
      quarterly: '📅',
      yearly: '📅'
    };
    return icons[frequency] || '📅';
  };

  const getNextDueDate = (expense) => {
    const lastDate = new Date(expense.date);
    const frequency = expense.recurring_frequency;
    
    let nextDate = new Date(lastDate);
    switch (frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }
    
    return nextDate.toISOString().split('T')[0];
  };

  const isOverdue = (expense) => {
    const nextDue = new Date(getNextDueDate(expense));
    const today = new Date();
    return nextDue < today;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recurring Expenses</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          {showAddForm ? 'Cancel' : 'Add Recurring'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h4 className="text-md font-medium text-gray-900 mb-4">Add New Recurring Expense</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Rent, EMI, Insurance"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Rent, EMI, Utilities"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency *</label>
              <select
                value={formData.frequency}
                onChange={(e) => handleInputChange('frequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Next Due Date *</label>
              <input
                type="date"
                value={formData.nextDueDate}
                onChange={(e) => handleInputChange('nextDueDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Optional description"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Recurring Expense
            </button>
          </div>
        </form>
      )}

      {recurringExpenses.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">📅</div>
          <p className="text-gray-600">No recurring expenses found</p>
          <p className="text-sm text-gray-500">Add your first recurring expense to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recurringExpenses.map((expense) => (
            <div
              key={expense.id}
              className={`p-4 border rounded-lg ${
                isOverdue(expense) ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{expense.description}</span>
                    {isOverdue(expense) && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        Overdue
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="font-semibold text-green-600">₹{expense.amount.toLocaleString()}</span>
                    <span className="mx-2">•</span>
                    <span>{getFrequencyIcon(expense.recurring_frequency)} {expense.recurring_frequency}</span>
                    <span className="mx-2">•</span>
                    <span>Next due: {getNextDueDate(expense)}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {(() => {
                    const nextDue = getNextDueDate(expense);
                    const isPaidThisCycle = new Date(nextDue) > new Date();
                    return (
                      <div className="flex flex-col items-end">
                        <button
                          onClick={() => payRecurring(expense)}
                          disabled={isPaidThisCycle}
                          className={`px-3 py-1 rounded-lg transition-colors text-sm ${
                            isPaidThisCycle
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : (!isPaymentSystemConfigured()
                                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200')
                          }`}
                          title={
                            isPaidThisCycle
                              ? `Next payment: ${nextDue}`
                              : (!isPaymentSystemConfigured() ? 'Demo Mode - Click to simulate payment' : 'Pay with Razorpay')
                          }
                        >
                          {isPaidThisCycle ? 'Paid' : (!isPaymentSystemConfigured() ? 'Pay (Demo)' : 'Pay')}
                        </button>
                        <span className="text-xs text-gray-500 mt-1">Next: {nextDue}</span>
                      </div>
                    );
                  })()}
                  <button
                    onClick={() => deleteRecurringExpense(expense.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecurringExpensesManager;