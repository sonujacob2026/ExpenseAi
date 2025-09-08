# Backup and Rollback Guide

## Current State Backup

This document provides a complete backup and rollback plan for the ExpenseAI budget management project.

### Files to Backup (Current Working State)

**Core Application Files:**
- `src/App.jsx` - Main application routing
- `src/components/Dashboard.jsx` - Main dashboard component
- `src/components/ExpenseList.jsx` - Expense listing and management
- `src/components/ExpenseStats.jsx` - Expense statistics
- `src/components/BudgetRecommendations.jsx` - Budget recommendations
- `src/components/HouseholdExpenseForm.jsx` - Expense form
- `src/components/HouseholdExpenseDashboard.jsx` - Household expense management
- `src/components/RecurringExpensesManager.jsx` - Recurring expenses (with working Pay button)
- `src/services/paymentService.js` - Payment service (with demo mode)
- `src/context/ProfileContext.jsx` - Profile management
- `src/context/SupabaseAuthContext.jsx` - Authentication context

**Configuration Files:**
- `package.json` - Dependencies
- `vite.config.js` - Build configuration
- `tailwind.config.js` - Styling configuration
- `DATABASE_SETUP.sql` - Database schema
- `SUPABASE_SETUP.md` - Supabase configuration guide
- `ENVIRONMENT_SETUP.md` - Environment setup guide

**Key Features Currently Working:**
✅ User authentication (Supabase)
✅ Expense tracking and management
✅ Recurring expenses with working Pay button (demo mode)
✅ Budget recommendations based on questionnaire
✅ Financial insights and goals
✅ Household expense management
✅ Expense statistics and analytics
✅ Responsive design with Tailwind CSS

## Rollback Instructions

### Option 1: Git Rollback (Recommended)
```bash
# If using git, create a backup branch
git checkout -b backup-before-enhancements
git add .
git commit -m "Backup: Working state before enhancements"

# To rollback later:
git checkout main
git reset --hard backup-before-enhancements
```

### Option 2: Manual File Restoration
If you need to manually restore files, use the backup copies created in the `backup/` directory.

### Option 3: Complete Project Reset
```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear browser localStorage
# Open browser dev tools -> Application -> Storage -> Clear All
```

## What's Safe to Modify

**Safe to Enhance:**
- Add new components in `src/components/`
- Add new database tables (with proper SQL files)
- Enhance existing functionality without breaking current features
- Add new routes in `App.jsx`
- Extend existing services

**Do NOT Modify:**
- Core authentication flow
- Existing database schema (without migration)
- Payment service demo mode functionality
- Main dashboard layout and navigation
- Existing expense management features

## Testing Checklist

Before deploying changes:
- [ ] User authentication still works
- [ ] Expense adding/editing/deleting works
- [ ] Recurring expenses Pay button works (demo mode)
- [ ] Dashboard loads without errors
- [ ] All existing features function normally
- [ ] No console errors
- [ ] Responsive design maintained

## Emergency Rollback

If something breaks:
1. Stop the development server
2. Restore files from backup
3. Clear browser cache and localStorage
4. Restart development server
5. Test core functionality

## Contact

If you need help with rollback or encounter issues, refer to this guide or restore from the backup branch.
