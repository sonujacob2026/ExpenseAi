import React, { useMemo, useState } from 'react';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from './ToastProvider';

const QuickExpenseButtons = ({ onExpenseAdded }) => {
  const { user } = useSupabaseAuth();
  const toast = useToast();
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

  // Keep a local adjustable amount for each quick item
  const initialAmounts = useMemo(() => {
    const map = {};
    for (const q of quickExpenses) map[q.name] = q.amount;
    return map;
  }, []);
  const [amounts, setAmounts] = useState(initialAmounts);

  const stepFor = (name) => {
    // Small items adjust by 50, larger by 100/500
    const value = amounts[name] ?? 0;
    if (value < 1000) return 50;
    if (value < 5000) return 100;
    return 500;
  };

  const inc = (name) => {
    setAmounts((prev) => ({ ...prev, [name]: Math.min((prev[name] ?? 0) + stepFor(name), 1_00_00_000) }));
  };
  const dec = (name) => {
    setAmounts((prev) => ({ ...prev, [name]: Math.max((prev[name] ?? 0) - stepFor(name), 1) }));
  };

  // Map UI categories/methods to DB CHECK-constraint allowed values
  const normalizeCategory = (raw) => {
    const map = new Map([
      ['Mobile Recharge', 'Bills'],
      ['Electricity Bill', 'Bills'],
      ['Internet/Broadband', 'Bills'],
      ['EMI/Loan Payment', 'EMI'],
      ['Groceries', 'Food'],
      ['Fuel/Petrol', 'Transport'],
      ['Water Bill', 'Bills'],
      ['Gas Bill', 'Bills']
    ]);
    return map.get(raw) || 'Bills';
  };

  const normalizePaymentMethod = (raw) => {
    const map = new Map([
      ['UPI', 'UPI'],
      ['Auto Debit', 'Bank Transfer'],
      ['Credit Card', 'Card']
    ]);
    return map.get(raw) || 'UPI';
  };

  const explainDbError = (error) => {
    const msg = error?.message || '';
    if (/check constraint/i.test(msg) && /category/i.test(msg)) {
      return 'Category not allowed by database. Fixed mapping failed.';
    }
    if (/check constraint/i.test(msg) && /payment_method/i.test(msg)) {
      return 'Payment method not allowed by database. Fixed mapping failed.';
    }
    if (/rls/i.test(msg) || /row level security/i.test(msg)) {
      return 'Permission issue (RLS). Please sign in and try again.';
    }
    return msg || 'Unknown error';
  };

  const handleQuickExpense = async (expense) => {
    if (!user?.id) {
      toast.info('Please sign in to add expenses');
      return;
    }

    setLoading(expense.name);

    try {
      const currentAmount = Number(amounts[expense.name] ?? expense.amount);

      const expenseData = {
        user_id: user.id,
        amount: currentAmount,
        description: `Quick expense: ${expense.name}`,
        category: normalizeCategory(expense.category), // mapped to DB allowed values
        subcategory: expense.subcategory,
        date: new Date().toISOString().split('T')[0],
        payment_method: normalizePaymentMethod(expense.paymentMethod), // mapped to DB allowed values
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
        const reason = explainDbError(error);
        toast.error(`Error adding expense: ${reason}`);
      } else {
        // Notify parent
        if (onExpenseAdded) onExpenseAdded(data[0]);
        // Success toast
        toast.success(`${expense.name} added successfully!`);
      }
    } catch (err) {
      console.error('Exception adding quick expense:', err);
      toast.error('Error adding expense. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Quick Add Expenses</h3>
      <p className="text-gray-600 mb-6">Click to quickly add common household expenses</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickExpenses.map((expense) => (
          <div key={expense.name} className="p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200">
            <div className="text-center">
              <div className="text-2xl mb-2">{expense.icon}</div>
              <div className="font-medium text-gray-900 text-sm mb-1">{expense.name}</div>

              {/* Amount row with +/- controls */}
              <div className="flex items-center justify-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => dec(expense.name)}
                  disabled={loading === expense.name}
                  className="w-8 h-8 rounded-lg border text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  aria-label={`Decrease ${expense.name} amount`}
                >
                  −
                </button>
                <div className="text-green-600 font-semibold min-w-[80px] text-center">
                  ₹{(amounts[expense.name] ?? expense.amount).toLocaleString()}
                </div>
                <button
                  type="button"
                  onClick={() => inc(expense.name)}
                  disabled={loading === expense.name}
                  className="w-8 h-8 rounded-lg border text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  aria-label={`Increase ${expense.name} amount`}
                >
                  +
                </button>
              </div>

              {expense.isRecurring && (
                <div className="text-xs text-gray-500 mt-1">Monthly</div>
              )}

              <button
                onClick={() => handleQuickExpense(expense)}
                disabled={loading === expense.name}
                className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {loading === expense.name ? 'Adding…' : 'Add'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        💡 Tip: Adjust amount with +/− before adding. You can edit later in the expense list too.
      </div>
    </div>
  );
};

export default QuickExpenseButtons;