// Comprehensive expense categories for household management
export const EXPENSE_CATEGORIES = {
  // Essential Household Bills
  UTILITIES: {
    name: 'Utilities',
    icon: '⚡',
    subcategories: [
      { name: 'Electricity Bill', icon: '💡', isRecurring: true, frequency: 'monthly' },
      { name: 'Water Bill', icon: '💧', isRecurring: true, frequency: 'monthly' },
      { name: 'Gas Bill', icon: '🔥', isRecurring: true, frequency: 'monthly' },
      { name: 'Internet/Broadband', icon: '🌐', isRecurring: true, frequency: 'monthly' },
      { name: 'Landline Phone', icon: '📞', isRecurring: true, frequency: 'monthly' },
      { name: 'Mobile Recharge', icon: '📱', isRecurring: true, frequency: 'monthly' },
      { name: 'Cable TV', icon: '📺', isRecurring: true, frequency: 'monthly' },
      { name: 'Other Utilities', icon: '⚙️', isRecurring: false }
    ]
  },

  // Housing & Maintenance
  HOUSING: {
    name: 'Housing',
    icon: '🏠',
    subcategories: [
      { name: 'Rent/Mortgage', icon: '🏡', isRecurring: true, frequency: 'monthly' },
      { name: 'Home Insurance', icon: '🛡️', isRecurring: true, frequency: 'yearly' },
      { name: 'Property Tax', icon: '📋', isRecurring: true, frequency: 'yearly' },
      { name: 'Maintenance', icon: '🔧', isRecurring: false },
      { name: 'Repairs', icon: '🛠️', isRecurring: false },
      { name: 'Cleaning Services', icon: '🧹', isRecurring: false },
      { name: 'Security Services', icon: '🔒', isRecurring: true, frequency: 'monthly' }
    ]
  },

  // Financial Obligations
  FINANCIAL: {
    name: 'Financial',
    icon: '💰',
    subcategories: [
      { name: 'EMI/Loan Payment', icon: '🏦', isRecurring: true, frequency: 'monthly' },
      { name: 'Credit Card Payment', icon: '💳', isRecurring: true, frequency: 'monthly' },
      { name: 'Insurance Premium', icon: '🛡️', isRecurring: true, frequency: 'monthly' },
      { name: 'Investment/SIP', icon: '📈', isRecurring: true, frequency: 'monthly' },
      { name: 'Tax Payment', icon: '📊', isRecurring: false },
      { name: 'Bank Charges', icon: '🏧', isRecurring: false }
    ]
  },

  // Transportation
  TRANSPORT: {
    name: 'Transportation',
    icon: '🚗',
    subcategories: [
      { name: 'Fuel/Petrol', icon: '⛽', isRecurring: false },
      { name: 'Public Transport', icon: '🚌', isRecurring: false },
      { name: 'Taxi/Ride Share', icon: '🚕', isRecurring: false },
      { name: 'Vehicle Maintenance', icon: '🔧', isRecurring: false },
      { name: 'Vehicle Insurance', icon: '🛡️', isRecurring: true, frequency: 'yearly' },
      { name: 'Parking Fees', icon: '🅿️', isRecurring: false },
      { name: 'Toll Charges', icon: '🛣️', isRecurring: false }
    ]
  },

  // Food & Groceries
  FOOD: {
    name: 'Food & Groceries',
    icon: '🍽️',
    subcategories: [
      { name: 'Groceries', icon: '🛒', isRecurring: false },
      { name: 'Dining Out', icon: '🍕', isRecurring: false },
      { name: 'Food Delivery', icon: '🚚', isRecurring: false },
      { name: 'Kitchen Supplies', icon: '🍳', isRecurring: false },
      { name: 'Beverages', icon: '🥤', isRecurring: false }
    ]
  },

  // Healthcare
  HEALTHCARE: {
    name: 'Healthcare',
    icon: '🏥',
    subcategories: [
      { name: 'Doctor Visits', icon: '👨‍⚕️', isRecurring: false },
      { name: 'Medicines', icon: '💊', isRecurring: false },
      { name: 'Health Insurance', icon: '🏥', isRecurring: true, frequency: 'yearly' },
      { name: 'Dental Care', icon: '🦷', isRecurring: false },
      { name: 'Optical Care', icon: '👓', isRecurring: false },
      { name: 'Gym/Fitness', icon: '💪', isRecurring: true, frequency: 'monthly' }
    ]
  },

  // Education & Learning
  EDUCATION: {
    name: 'Education',
    icon: '📚',
    subcategories: [
      { name: 'School Fees', icon: '🎒', isRecurring: true, frequency: 'monthly' },
      { name: 'Tuition/Coaching', icon: '👨‍🏫', isRecurring: true, frequency: 'monthly' },
      { name: 'Books & Supplies', icon: '📖', isRecurring: false },
      { name: 'Online Courses', icon: '💻', isRecurring: false },
      { name: 'Educational Apps', icon: '📱', isRecurring: true, frequency: 'monthly' }
    ]
  },

  // Entertainment & Recreation
  ENTERTAINMENT: {
    name: 'Entertainment',
    icon: '🎬',
    subcategories: [
      { name: 'Movies/Theater', icon: '🎭', isRecurring: false },
      { name: 'Streaming Services', icon: '📺', isRecurring: true, frequency: 'monthly' },
      { name: 'Gaming', icon: '🎮', isRecurring: false },
      { name: 'Sports/Recreation', icon: '⚽', isRecurring: false },
      { name: 'Hobbies', icon: '🎨', isRecurring: false },
      { name: 'Vacation/Travel', icon: '✈️', isRecurring: false }
    ]
  },

  // Shopping & Personal
  SHOPPING: {
    name: 'Shopping',
    icon: '🛍️',
    subcategories: [
      { name: 'Clothing', icon: '👕', isRecurring: false },
      { name: 'Electronics', icon: '📱', isRecurring: false },
      { name: 'Home Decor', icon: '🏠', isRecurring: false },
      { name: 'Personal Care', icon: '🧴', isRecurring: false },
      { name: 'Gifts', icon: '🎁', isRecurring: false },
      { name: 'Online Shopping', icon: '📦', isRecurring: false }
    ]
  },

  // Miscellaneous
  MISCELLANEOUS: {
    name: 'Miscellaneous',
    icon: '📋',
    subcategories: [
      { name: 'Donations', icon: '❤️', isRecurring: false },
      { name: 'Pet Expenses', icon: '🐕', isRecurring: false },
      { name: 'Emergency Fund', icon: '🚨', isRecurring: false },
      { name: 'Other', icon: '📝', isRecurring: false }
    ]
  }
};

// Payment methods
export const PAYMENT_METHODS = [
  { name: 'Cash', icon: '💵', type: 'cash' },
  { name: 'UPI', icon: '📱', type: 'digital' },
  { name: 'Credit Card', icon: '💳', type: 'card' },
  { name: 'Debit Card', icon: '💳', type: 'card' },
  { name: 'Net Banking', icon: '🏦', type: 'digital' },
  { name: 'Wallet', icon: '👛', type: 'digital' },
  { name: 'Cheque', icon: '📄', type: 'traditional' },
  { name: 'Auto Debit', icon: '🔄', type: 'automatic' }
];

// Recurring frequencies
export const RECURRING_FREQUENCIES = [
  { value: 'daily', label: 'Daily', icon: '📅' },
  { value: 'weekly', label: 'Weekly', icon: '📅' },
  { value: 'monthly', label: 'Monthly', icon: '📅' },
  { value: 'quarterly', label: 'Quarterly', icon: '📅' },
  { value: 'yearly', label: 'Yearly', icon: '📅' }
];

// Helper functions
export const getCategoryIcon = (categoryName) => {
  for (const category of Object.values(EXPENSE_CATEGORIES)) {
    if (category.name === categoryName) {
      return category.icon;
    }
    for (const subcategory of category.subcategories) {
      if (subcategory.name === categoryName) {
        return subcategory.icon;
      }
    }
  }
  return '📝';
};

export const getSubcategories = (categoryName) => {
  for (const category of Object.values(EXPENSE_CATEGORIES)) {
    if (category.name === categoryName) {
      return category.subcategories;
    }
  }
  return [];
};

export const isRecurringCategory = (categoryName, subcategoryName = null) => {
  if (subcategoryName) {
    const subcategories = getSubcategories(categoryName);
    const subcategory = subcategories.find(sub => sub.name === subcategoryName);
    return subcategory ? subcategory.isRecurring : false;
  }
  return false;
};

export const getRecurringFrequency = (categoryName, subcategoryName = null) => {
  if (subcategoryName) {
    const subcategories = getSubcategories(categoryName);
    const subcategory = subcategories.find(sub => sub.name === subcategoryName);
    return subcategory ? subcategory.frequency : null;
  }
  return null;
};

export default {
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  RECURRING_FREQUENCIES,
  getCategoryIcon,
  getSubcategories,
  isRecurringCategory,
  getRecurringFrequency
};