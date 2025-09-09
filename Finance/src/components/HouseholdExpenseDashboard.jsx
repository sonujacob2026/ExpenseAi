import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { supabase } from '../lib/supabase';
import HouseholdExpenseForm from './HouseholdExpenseForm';
import QuickExpenseButtons from './QuickExpenseButtons';
import RecurringExpensesManager from './RecurringExpensesManager';

const HouseholdExpenseDashboard = () => {
  const { user } = useSupabaseAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [monthlyStats, setMonthlyStats] = useState({
    total: 0,
    utilities: 0,
    food: 0,
    transport: 0,
    other: 0
  });
  const [recurringRefreshKey, setRecurringRefreshKey] = useState(0);

  // Load expenses
  useEffect(() => {
    if (user?.id) {
      loadExpenses();
    }
  }, [user?.id]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      // Compute first and last day of current month accurately
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error loading expenses:', error);
      } else {
        setExpenses(data || []);
        calculateMonthlyStats(data || []);
      }
    } catch (error) {
      console.error('Exception loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyStats = (expenseData) => {
    const stats = {
      total: 0,
      utilities: 0,
      food: 0,
      transport: 0,
      other: 0
    };

    expenseData.forEach(expense => {
      stats.total += expense.amount;
      
      if (expense.subcategory === 'Utilities') {
        stats.utilities += expense.amount;
      } else if (expense.subcategory === 'Food & Groceries') {
        stats.food += expense.amount;
      } else if (expense.subcategory === 'Transportation') {
        stats.transport += expense.amount;
      } else {
        stats.other += expense.amount;
      }
    });

    setMonthlyStats(stats);
  };

  const handleExpenseAdded = (newExpense) => {
    setExpenses(prev => [newExpense, ...prev]);
    calculateMonthlyStats([newExpense, ...expenses]);
    // If the newly added expense is recurring, bump refresh key to reload recurring list
    if (newExpense?.is_recurring) {
      setRecurringRefreshKey((k) => k + 1);
    }
    setShowAddForm(false);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Mobile Recharge': '📱',
      'Electricity Bill': '💡',
      'Internet/Broadband': '🌐',
      'EMI/Loan Payment': '🏦',
      'Groceries': '🛒',
      'Fuel/Petrol': '⛽',
      'Water Bill': '💧',
      'Gas Bill': '🔥',
      'Rent/Mortgage': '🏠',
      'Credit Card Payment': '💳'
    };
    return icons[category] || '📝';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Household Expenses</h2>
        </div>

        {/* Monthly Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
            <div className="text-sm opacity-90">Total This Month</div>
            <div className="text-2xl font-bold">₹{monthlyStats.total.toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
            <div className="text-sm opacity-90">Utilities</div>
            <div className="text-2xl font-bold">₹{monthlyStats.utilities.toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
            <div className="text-sm opacity-90">Food & Groceries</div>
            <div className="text-2xl font-bold">₹{monthlyStats.food.toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
            <div className="text-sm opacity-90">Transportation</div>
            <div className="text-2xl font-bold">₹{monthlyStats.transport.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'quick', label: 'Quick Add', icon: '⚡' },
              { id: 'recurring', label: 'Recurring', icon: '🔄' },
              { id: 'recent', label: 'Recent', icon: '📝' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <QuickExpenseButtons onExpenseAdded={handleExpenseAdded} />
              <RecurringExpensesManager refreshKey={recurringRefreshKey} />
            </div>
          )}

          {activeTab === 'quick' && (
            <QuickExpenseButtons onExpenseAdded={handleExpenseAdded} />
          )}

          {activeTab === 'recurring' && (
            <RecurringExpensesManager refreshKey={recurringRefreshKey} />
          )}

          {activeTab === 'recent' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Expenses</h3>
              {expenses.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">📝</div>
                  <p className="text-gray-600">No expenses found for this month</p>
                  <p className="text-sm text-gray-500">Add your first expense to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expenses.slice(0, 10).map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{getCategoryIcon(expense.category)}</div>
                        <div>
                          <div className="font-medium text-gray-900">{expense.category}</div>
                          <div className="text-sm text-gray-600">
                            {formatDate(expense.date)} • {expense.payment_method}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">₹{expense.amount.toLocaleString()}</div>
                        {expense.is_recurring && (
                          <div className="text-xs text-blue-600">Recurring</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <HouseholdExpenseForm
              onExpenseAdded={handleExpenseAdded}
              onClose={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HouseholdExpenseDashboard;