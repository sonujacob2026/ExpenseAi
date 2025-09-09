import React, { useState, useEffect } from 'react';
import { useToast } from './ToastProvider';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { supabase } from '../lib/supabase';
import ProfileService from '../services/profileService';

const Questionnaire = () => {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    householdMembers: '',
    monthlyIncome: '',
    hasDebt: '',
    debtAmount: '',
    savingsGoal: '',
    primaryExpenses: [],
    budgetingExperience: '',
    financialGoals: []
  });

  const totalSteps = 6;

  // Load existing profile data when component mounts
  useEffect(() => {
    const loadExistingProfile = async () => {
      if (user?.id) {
        try {
          console.log('🔄 Loading existing profile for user:', user.id);
          const result = await ProfileService.getFormattedProfile(user.id);
          
          if (result.success && result.data) {
            console.log('✅ Loaded existing profile:', result.data);
            setFormData(result.data);
          } else {
            console.log('ℹ️ No existing profile found, starting fresh');
          }
        } catch (error) {
          console.error('❌ Error loading profile:', error);
        }
      }
    };

    loadExistingProfile();
  }, [user?.id]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    console.log('🚀 Starting questionnaire submission...');
    console.log('📊 Current step:', currentStep, 'Total steps:', totalSteps);
    console.log('👤 User:', user);
    console.log('📝 Form data:', formData);

    if (!user?.id) {
      console.error('❌ No user ID available');
      toast.info('Please sign in to save your profile');
      return;
    }

    setLoading(true);

    try {
      // Save to database using ProfileService
      const result = await ProfileService.saveProfile(formData, user.id);
      
      if (result.success) {
        console.log('✅ Profile saved to database successfully');
        
        // Also save to localStorage for backup
        const profile = {
          ...formData,
          completedAt: new Date().toISOString()
        };
        localStorage.setItem('expenseai_financial_profile', JSON.stringify(profile));

        // Update user metadata in Supabase auth
        const { error: authError } = await supabase.auth.updateUser({
          data: {
            onboarding_completed: true,
            financial_profile: profile
          }
        });

        if (authError) {
          console.error('⚠️ Error updating user metadata:', authError);
          // Continue anyway - database save was successful
        }

        // Navigate to dashboard
        toast.success('Profile saved successfully');
        navigate('/dashboard');
      } else {
        console.error('❌ Failed to save profile:', result.error);
        toast.error('Failed to save your profile. Please try again.');
      }

    } catch (error) {
      console.error('❌ Error in questionnaire submission:', error);
      toast.error('An error occurred while saving your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">How many people live in your household?</h2>
            <p className="text-gray-600">This helps us understand your family size for better budgeting recommendations.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, '6+'].map((num) => (
                <button
                  key={num}
                  onClick={() => handleInputChange('householdMembers', num.toString())}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.householdMembers === num.toString()
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="text-2xl font-bold">{num}</div>
                  <div className="text-sm">{num === 1 ? 'person' : 'people'}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">What's your monthly household income?</h2>
            <p className="text-gray-600">This information helps us create realistic budget recommendations.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Under ₹25,000', value: '20000' },
                { label: '₹25,000 - ₹40,000', value: '32500' },
                { label: '₹40,000 - ₹65,000', value: '52500' },
                { label: '₹65,000 - ₹1,00,000', value: '82500' },
                { label: '₹1,00,000 - ₹1,65,000', value: '132500' },
                { label: 'Over ₹1,65,000', value: '200000' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleInputChange('monthlyIncome', option.value)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    formData.monthlyIncome === option.value
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Do you currently have any debt?</h2>
            <p className="text-gray-600">Including credit cards, loans, mortgages, etc.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleInputChange('hasDebt', 'yes')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  formData.hasDebt === 'yes'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="text-lg font-semibold">Yes, I have debt</div>
                <div className="text-sm text-gray-600">We'll help you create a debt payoff plan</div>
              </button>
              <button
                onClick={() => handleInputChange('hasDebt', 'no')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  formData.hasDebt === 'no'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="text-lg font-semibold">No debt</div>
                <div className="text-sm text-gray-600">Great! We'll focus on savings and investments</div>
              </button>
            </div>
            
            {formData.hasDebt === 'yes' && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approximate total debt amount
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={formData.debtAmount}
                  onChange={(e) => handleInputChange('debtAmount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                />
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">What are your main expense categories?</h2>
            <p className="text-gray-600">Select all that apply to your household spending.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                'Groceries', 'Rent/Mortgage', 'Utilities', 'Transportation',
                'Healthcare', 'Entertainment', 'Dining Out', 'Shopping',
                'Education', 'Insurance', 'Childcare', 'Other'
              ].map((expense) => (
                <label
                  key={expense}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.primaryExpenses.includes(expense)
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.primaryExpenses.includes(expense)}
                    onChange={(e) => handleArrayChange('primaryExpenses', expense, e.target.checked)}
                  />
                  <div className="text-center font-medium">{expense}</div>
                </label>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">How experienced are you with budgeting?</h2>
            <p className="text-gray-600">This helps us customize the interface and recommendations for you.</p>
            <div className="space-y-4">
              {[
                { value: 'beginner', label: 'Beginner', desc: 'New to budgeting and expense tracking' },
                { value: 'intermediate', label: 'Intermediate', desc: 'Some experience with budgeting tools' },
                { value: 'advanced', label: 'Advanced', desc: 'Experienced with financial planning and analysis' }
              ].map((level) => (
                <button
                  key={level.value}
                  onClick={() => handleInputChange('budgetingExperience', level.value)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    formData.budgetingExperience === level.value
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="font-semibold">{level.label}</div>
                  <div className="text-sm text-gray-600">{level.desc}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">What are your financial goals?</h2>
            <p className="text-gray-600">Select all that you'd like to work towards.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Build Emergency Fund', 'Pay Off Debt', 'Save for Vacation',
                'Buy a Home', 'Retirement Planning', 'Investment Growth',
                'Education Fund', 'Start a Business'
              ].map((goal) => (
                <label
                  key={goal}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.financialGoals.includes(goal)
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.financialGoals.includes(goal)}
                    onChange={(e) => handleArrayChange('financialGoals', goal, e.target.checked)}
                  />
                  <div className="font-medium">{goal}</div>
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            {currentStep === totalSteps ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : 'Complete Setup'}
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
