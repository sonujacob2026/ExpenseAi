import React, { useState } from 'react';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { supabase } from '../lib/supabase';

const QuickExpenseButtons = ({ onExpenseAdded }) => {
  const { user } = useSupabaseAuth();
  const [loading, setLoading] = useState(null);

  // Common household expenses with predefined amounts
  const quickExpenses = [
    {
      name: 'Mobile Recharge',
      icon: '📱',
      amount: 500,
      category: 'Mobile Recharge',
      subcategory: 'Utilities',
      paymentMethod: 'UPI',
      isRecurring: true,
      frequency: 'monthly'
    },
    {
      name: 'Electricity Bill',
      icon: '💡',
      amount: 2000,
      category: 'Electricity Bill',
      subcategory: 'Utilities',
      paymentMethod: 'Auto Debit',
      isRecurring: true,
      frequency: 'monthly'
    },
    {
      name: 'Internet Bill',
      icon: '🌐',
      amount: 800,
      category: 'Internet/Broadband',
      subcategory: 'Utilities',
      paymentMethod: 'Auto Debit',
      isRecurring: true,
      frequency: 'monthly'
    },
    {
      name: 'EMI Payment',
      icon: '🏦',
      amount: 15000,
      category: 'EMI/Loan Payment',
      subcategory: 'Financial',
      paymentMethod: 'Auto Debit',
      isRecurring: true,
      frequency: 'monthly'
    },
    {
      name: 'Grocery Shopping',
      icon: '🛒',
      amount: 3000,
      category: 'Groceries',
      subcategory: 'Food & Groceries',
      paymentMethod: 'UPI',
      isRecurring: false
    },
    {
      name: 'Fuel',
      icon: '⛽',
      amount: 2000,
      category: 'Fuel/Petrol',
      subcategory: 'Transportation',
      paymentMethod: 'Credit Card',
      isRecurring: false
    },
    {
      name: 'Water Bill',
      icon: '💧',
      amount: 500,
      category: 'Water Bill',
      subcategory: 'Utilities',
      paymentMethod: 'Auto Debit',
      isRecurring: true,
      frequency: 'monthly'
    },
    {
      name: 'Gas Bill',
      icon: '🔥',
      amount: 800,
      category: 'Gas Bill',
      subcategory: 'Utilities',
      paymentMethod: 'Auto Debit',
      isRecurring: true,
      frequency: 'monthly'
    }
  ];

  const handleQuickExpense = async (expense) => {
    if (!user?.id) {
      alert('Please sign in to add expenses');
      return;
    }

    setLoading(expense.name);

    try {
      const expenseData = {
        user_id: user.id,
        amount: expense.amount,
        description: `Quick expense: ${expense.name}`,
        category: expense.category,
        subcategory: expense.subcategory,
        date: new Date().toISOString().split('T')[0],
        payment_method: expense.paymentMethod,
        is_recurring: expense.isRecurring,
        recurring_frequency: expense.isRecurring ? expense.frequency : null,
        tags: ['quick-expense'],
        notes: 'Added via quick expense button'
      };

      const { data, error } = await supabase
        .from('expenses')
        .insert([expenseData])
        .select();

      if (error) {
        console.error('Error adding quick expense:', error);
        alert('Error adding expense. Please try again.');
      } else {
        console.log('Quick expense added successfully:', data);
        
        // Notify parent component
        if (onExpenseAdded) {
          onExpenseAdded(data[0]);
        }

        // Show success message
        alert(`${expense.name} added successfully!`);
      }
    } catch (error) {
      console.error('Exception adding quick expense:', error);
      alert('Error adding expense. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Add Expenses</h3>
      <p className="text-gray-600 mb-6">Click to quickly add common household expenses</p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickExpenses.map((expense) => (
          <button
            key={expense.name}
            onClick={() => handleQuickExpense(expense)}
            disabled={loading === expense.name}
            className="p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">{expense.icon}</div>
              <div className="font-medium text-gray-900 text-sm mb-1">{expense.name}</div>
              <div className="text-green-600 font-semibold">₹{expense.amount.toLocaleString()}</div>
              {expense.isRecurring && (
                <div className="text-xs text-gray-500 mt-1">Monthly</div>
              )}
              {loading === expense.name && (
                <div className="text-xs text-blue-600 mt-1">Adding...</div>
              )}
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        💡 Tip: You can edit the amount after adding by going to the expense list
      </div>
    </div>
  );
};

export default QuickExpenseButtons;