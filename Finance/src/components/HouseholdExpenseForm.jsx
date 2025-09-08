import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { supabase } from '../lib/supabase';
import { 
  EXPENSE_CATEGORIES, 
  PAYMENT_METHODS, 
  RECURRING_FREQUENCIES,
  getCategoryIcon,
  getSubcategories,
  isRecurringCategory,
  getRecurringFrequency
} from '../services/expenseCategoriesService';

const HouseholdExpenseForm = ({ onExpenseAdded, onClose }) => {
  const { user } = useSupabaseAuth();
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Utilities',
    subcategory: '',
    paymentMethod: 'UPI',
    date: new Date().toISOString().split('T')[0],
    description: '',
    isRecurring: false,
    recurringFrequency: 'monthly',
    tags: [],
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [availableSubcategories, setAvailableSubcategories] = useState([]);

  // Update subcategories when category changes
  useEffect(() => {
    const subcategories = getSubcategories(formData.category);
    setAvailableSubcategories(subcategories);
    
    // Auto-select first subcategory if available
    if (subcategories.length > 0) {
      setFormData(prev => ({
        ...prev,
        subcategory: subcategories[0].name,
        isRecurring: subcategories[0].isRecurring || false,
        recurringFrequency: subcategories[0].frequency || 'monthly'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        subcategory: '',
        isRecurring: false
      }));
    }
  }, [formData.category]);

  // Update recurring settings when subcategory changes
  useEffect(() => {
    if (formData.subcategory) {
      const isRecurring = isRecurringCategory(formData.category, formData.subcategory);
      const frequency = getRecurringFrequency(formData.category, formData.subcategory);
      
      setFormData(prev => ({
        ...prev,
        isRecurring,
        recurringFrequency: frequency || 'monthly'
      }));
    }
  }, [formData.subcategory, formData.category]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  // Map UI category/subcategory to DB category (matches CHECK constraint in transactions table)
  const mapToDbCategory = (category, subcategory) => {
    const name = (subcategory || category || '').toLowerCase();
    if (name.includes('grocery') || name.includes('food')) return 'Food';
    if (name.includes('rent') || name.includes('mortgage') || name.includes('housing')) return 'Rent';
    if (name.includes('transport') || name.includes('fuel') || name.includes('taxi') || name.includes('parking') || name.includes('toll')) return 'Transport';
    if (name.includes('electric') || name.includes('water') || name.includes('gas') || name.includes('internet') || name.includes('broadband') || name.includes('recharge') || name.includes('bill') || name.includes('utility')) return 'Bills';
    if (name.includes('emi') || name.includes('loan')) return 'EMI';
    if (name.includes('education') || name.includes('school') || name.includes('tuition') || name.includes('book') || name.includes('course')) return 'Education';
    if (name.includes('entertain') || name.includes('movie') || name.includes('stream') || name.includes('gaming') || name.includes('hobby')) return 'Entertainment';
    if (name.includes('invest') || name.includes('sip')) return 'Investments';
    if (name.includes('insurance')) return 'Bills';
    return 'Shopping';
  };

  // Map UI payment method to DB payment_method (matches CHECK constraint)
  const mapToDbPayment = (paymentMethod) => {
    const m = (paymentMethod || '').toLowerCase();
    if (m.includes('upi')) return 'UPI';
    if (m.includes('credit') || m.includes('debit') || m.includes('card')) return 'Card';
    if (m.includes('cash')) return 'Cash';
    if (m.includes('net') || m.includes('bank') || m.includes('cheque') || m.includes('auto')) return 'Bank Transfer';
    if (m.includes('wallet')) return 'UPI';
    return 'UPI';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setMessage('Please enter a valid amount');
      return;
    }

    if (!formData.category || !formData.subcategory || !formData.paymentMethod || !formData.date) {
      setMessage('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Map values to match DB constraints in DATABASE_SETUP.sql (transactions table)
      const mappedCategory = mapToDbCategory(formData.category, formData.subcategory);
      const mappedPayment = mapToDbPayment(formData.paymentMethod);

      const expenseData = {
        user_id: user.id,
        amount: parseFloat(formData.amount),
        category: mappedCategory, // must be one of: Food, Rent, Transport, Shopping, Bills, EMI, Education, Entertainment, Investments
        subcategory: formData.subcategory || null, // store the specific bill/item like "Electricity Bill"
        payment_method: mappedPayment, // must be one of: UPI, Card, Cash, Bank Transfer
        date: formData.date,
        description: formData.description || null,
        tags: formData.tags?.length ? formData.tags : null, // text[]
        is_recurring: !!formData.isRecurring,
        recurring_frequency: formData.isRecurring ? formData.recurringFrequency : null,
        notes: formData.notes || null
      };

      const { data, error } = await supabase
  .from('expenses')
  .insert([expenseData])
  .select();


      if (error) {
        console.error('Error adding expense:', error);
        setMessage('Error adding expense. Please try again.');
      } else {
        console.log('Expense added successfully:', data);
        setMessage('Expense added successfully!');
        
        // Reset form
        setFormData({
          amount: '',
          category: 'Utilities',
          subcategory: '',
          paymentMethod: 'UPI',
          date: new Date().toISOString().split('T')[0],
          description: '',
          isRecurring: false,
          recurringFrequency: 'monthly',
          tags: [],
          notes: ''
        });

        // Notify parent component
        if (onExpenseAdded) {
          onExpenseAdded(data[0]);
        }

        // Close modal after a short delay
        setTimeout(() => {
          if (onClose) onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Exception adding expense:', error);
      setMessage('Error adding expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const commonTags = ['urgent', 'work-related', 'family', 'personal', 'business', 'tax-deductible'];

  return (
    <div className="bg-white rounded-xl shadow-lg max-w-2xl mx-auto max-h-[85vh] flex flex-col">
      <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-xl">
        <h2 className="text-2xl font-bold text-gray-900">Add Household Expense</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {message && (
        <div className={`m-6 mb-0 p-3 rounded-lg ${
          message.includes('successfully') 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Scrollable form body */}
      <form onSubmit={handleSubmit} className="space-y-6 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="0.00"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              {Object.entries(EXPENSE_CATEGORIES).map(([key, category]) => (
                <option key={key} value={category.name}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subcategory *
            </label>
            <select
              value={formData.subcategory}
              onChange={(e) => handleInputChange('subcategory', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="">Select subcategory</option>
              {availableSubcategories.map((subcategory) => (
                <option key={subcategory.name} value={subcategory.name}>
                  {subcategory.icon} {subcategory.name}
                  {subcategory.isRecurring && ' (Recurring)'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method *
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method.name} value={method.name}>
                  {method.icon} {method.name}
                </option>
              ))}
            </select>
          </div>

          {/* Recurring Frequency (if applicable) */}
          {formData.isRecurring && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recurring Frequency
              </label>
              <select
                value={formData.recurringFrequency}
                onChange={(e) => handleInputChange('recurringFrequency', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {RECURRING_FREQUENCIES.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.icon} {freq.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Brief description of the expense"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {commonTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  formData.tags.includes(tag)
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={3}
            placeholder="Additional notes or details"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Adding...' : 'Submit Expense'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HouseholdExpenseForm;