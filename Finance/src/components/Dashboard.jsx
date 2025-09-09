import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { useProfile } from '../context/ProfileContext';
import { useNavigate } from 'react-router-dom';
import ExpenseList from './ExpenseList';
import ExpenseStats from './ExpenseStats';
import FinancialInsights from './FinancialInsights';
import BudgetRecommendations from './BudgetRecommendations';
import FinancialGoalsDisplay from './FinancialGoalsDisplay';
import HouseholdExpenseForm from './HouseholdExpenseForm';

import HouseholdExpenseDashboard from './HouseholdExpenseDashboard';
import BudgetOverview from './BudgetOverview';
import GoalsModal from './GoalsModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useSupabaseAuth();
  const { profile, loading: profileLoading, refreshProfile } = useProfile();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState('expenses');
  const [showBudget, setShowBudget] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const onboardingIncomplete = !(profile?.onboarding_completed || user?.user_metadata?.onboarding_completed);

  useEffect(() => {
    loadExpenses();
    // Profile is automatically loaded by ProfileContext
  }, []);

  // Refresh profile only if not already loaded to avoid flicker
  useEffect(() => {
    if (user?.id && !profile && !profileLoading) {
      refreshProfile();
    }
  }, [user?.id, profile, profileLoading, refreshProfile]);

  // Redirect brand-new users to questionnaire without showing dashboard to avoid flicker
  useEffect(() => {
    if (user?.id && !profileLoading && onboardingIncomplete) {
      navigate('/questionnaire', { replace: true });
    }
  }, [user?.id, profileLoading, onboardingIncomplete, navigate]);

  const loadExpenses = () => {
    try {
      const savedExpenses = localStorage.getItem('expenseai_expenses');
      if (savedExpenses) {
        setExpenses(JSON.parse(savedExpenses));
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  // Save expenses to localStorage whenever expenses change
  useEffect(() => {
    localStorage.setItem('expenseai_expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Disable background scroll (html + body) when the add-expense modal is open
  useEffect(() => {
    const { body, documentElement } = document;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = documentElement.style.overflow;
    const prevBodyPaddingRight = body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    if (showAddExpense) {
      // Prevent background scroll
      body.style.overflow = 'hidden';
      documentElement.style.overflow = 'hidden';
      // Avoid layout shift when removing scrollbar
      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      body.style.overflow = prevBodyOverflow || '';
      documentElement.style.overflow = prevHtmlOverflow || '';
      body.style.paddingRight = prevBodyPaddingRight || '';
    }

    return () => {
      body.style.overflow = prevBodyOverflow || '';
      documentElement.style.overflow = prevHtmlOverflow || '';
      body.style.paddingRight = prevBodyPaddingRight || '';
    };
  }, [showAddExpense]);

  const addExpense = (newExpense) => {
    const expense = {
      id: Date.now().toString(),
      ...newExpense,
      createdAt: new Date().toISOString()
    };
    setExpenses(prev => [expense, ...prev]);
    setShowAddExpense(false);
  };

  const deleteExpense = (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
    }
  };

  const editExpense = (expenseId, updatedExpense) => {
    setExpenses(prev =>
      prev.map(expense =>
        expense.id === expenseId
          ? { ...expense, ...updatedExpense, updatedAt: new Date().toISOString() }
          : expense
      )
    );
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Show loader only on initial load when profile is null and loading
  if ((profileLoading && !profile) || (user && onboardingIncomplete)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="ml-3 text-2xl font-bold text-gray-900">ExpenseAI</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}</span>
              <button
                onClick={handleSignOut}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to your Financial Dashboard!</h1>
          <p className="text-green-100">
            {profile ? 
              `Great! We've set up your profile with ${profile.household_members} household members and your financial goals.` :
              "Let's get started with tracking your expenses and managing your budget."
            }
          </p>
          {onboardingIncomplete && (
            <div className="mt-4">
              <button
                onClick={() => navigate('/questionnaire')}
                className="px-4 py-2 bg-white text-green-700 font-medium rounded-lg hover:bg-green-50"
              >
                Complete Questionnaire
              </button>
            </div>
          )}
        </div>

        {onboardingIncomplete && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-yellow-800 text-sm">
                <strong>Finish your setup:</strong> Complete a short questionnaire to personalize recommendations and budgets.
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => navigate('/questionnaire')}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
                >
                  Continue Questionnaire
                </button>
                <button
                  onClick={() => refreshProfile()}
                  className="px-4 py-2 bg-white border border-yellow-300 text-yellow-800 rounded-lg hover:bg-yellow-100"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Summary */}
        {profile && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Household Members</p>
                  <p className="text-2xl font-bold text-gray-900">{profile.householdMembers || profile.household_members || 'Not set'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Monthly Income</p>
                  <p className="text-2xl font-bold text-gray-900">₹{(parseInt(profile.monthlyIncome) || profile.monthly_income || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Debt Status</p>
                  <p className="text-2xl font-bold text-gray-900">{(profile.hasDebt === 'yes' || profile.has_debt) ? 'Yes' : 'None'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Experience Level</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">{profile.budgeting_experience}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {onboardingIncomplete && (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Questionnaire</h3>
              <p className="text-gray-600 mb-4">Finish onboarding to personalize insights and budgets</p>
              <button
                onClick={() => navigate('/questionnaire')}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Continue
              </button>
            </div>
          )}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Expense</h3>
            <p className="text-gray-600 mb-4">Record a new expense transaction</p>
            <button
              onClick={() => setShowAddExpense(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Add Expense
            </button>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">View Budget</h3>
            <p className="text-gray-600 mb-4">Check your monthly budget status</p>
            <button onClick={() => setShowBudget(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">View Budget</button>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Goals</h3>
            <p className="text-gray-600 mb-4">Track your savings and goals</p>
            <button onClick={() => setShowGoals(true)} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors">View Goals</button>
          </div>
        </div>

        



        {/* Household Expense Management */}
        <div className="mb-8">
          <HouseholdExpenseDashboard />
        </div>

        {/* Financial Insights and Budget Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <FinancialInsights profile={profile} />
          <BudgetRecommendations profile={profile} />
        </div>

        {/* Financial Goals */}
        <div className="mb-8">
          <FinancialGoalsDisplay profile={profile} />
        </div>

        {/* Expense Statistics */}
        <ExpenseStats expenses={expenses} />

        {/* Expense List */}
        <ExpenseList
          expenses={expenses}
          onDelete={deleteExpense}
          onEdit={editExpense}
        />

      </main>

      {/* Add Expense Modal (uses HouseholdExpenseForm) */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-auto">
            <HouseholdExpenseForm
              onExpenseAdded={(exp) => {
                // Mirror local dashboard list for consistency with existing behavior
                addExpense({
                  amount: exp.amount,
                  description: exp.description,
                  category: exp.category,
                  date: exp.date,
                  paymentMethod: exp.payment_method,
                  notes: exp.notes || ''
                });
              }}
              onClose={() => setShowAddExpense(false)}
            />
          </div>
        </div>
      )}

      {/* Budget Overview Modal */}
      {showBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-5xl w-full max-h-[90vh] overflow-auto">
            <BudgetOverview onClose={() => setShowBudget(false)} />
          </div>
        </div>
      )}

      {showGoals && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <GoalsModal onClose={() => setShowGoals(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
