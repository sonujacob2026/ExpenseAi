// Profile service aligned with Supabase 'user_profiles' schema
// Maps questionnaire form data to normalized DB columns and vice versa.

import { supabase } from '../lib/supabase';

const table = 'user_profiles';

// Helper: convert questionnaire form data -> DB row
function mapFormToRow(formData, userId, { setOnboarding = false } = {}) {
  const toNumber = (v) => {
    if (v === undefined || v === null || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  return {
    user_id: userId,
    household_members: formData.householdMembers ? parseInt(formData.householdMembers, 10) : null,
    monthly_income: toNumber(formData.monthlyIncome),
    has_debt: formData.hasDebt === 'yes' ? true : formData.hasDebt === 'no' ? false : null,
    debt_amount: toNumber(formData.debtAmount),
    savings_goal: formData.savingsGoal ?? null,
    primary_expenses: Array.isArray(formData.primaryExpenses) ? formData.primaryExpenses : [],
    budgeting_experience: formData.budgetingExperience ?? null,
    financial_goals: Array.isArray(formData.financialGoals) ? formData.financialGoals : [],
    ...(setOnboarding ? { onboarding_completed: true } : {}),
  };
}

// Helper: DB row -> questionnaire-friendly object
function mapRowToForm(row) {
  if (!row) return null;
  return {
    householdMembers: row.household_members != null ? String(row.household_members) : '',
    monthlyIncome: row.monthly_income != null ? String(row.monthly_income) : '',
    hasDebt: row.has_debt === true ? 'yes' : row.has_debt === false ? 'no' : '',
    debtAmount: row.debt_amount != null ? String(row.debt_amount) : '',
    savingsGoal: row.savings_goal ?? '',
    primaryExpenses: row.primary_expenses ?? [],
    budgetingExperience: row.budgeting_experience ?? '',
    financialGoals: row.financial_goals ?? [],
  };
}

const ProfileService = {
  // Get raw profile row for a user
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) return { success: false, error: error.message };
      return { success: true, data: data || null };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Save entire profile (used by questionnaire completion)
  async saveProfile(formData, userId) {
    try {
      const row = mapFormToRow(formData, userId, { setOnboarding: true });
      const now = new Date().toISOString();

      // Ensure we include email if the table enforces NOT NULL on email
      let userEmail = null;
      try {
        const { data: userData } = await supabase.auth.getUser();
        userEmail = userData?.user?.email || null;
      } catch (_) {}

      // Try update first
      const { data: updated, error: updateErr } = await supabase
        .from(table)
        .update({ ...row, ...(userEmail ? { email: userEmail } : {}), updated_at: now })
        .eq('user_id', userId)
        .select()
        .maybeSingle();

      if (!updateErr && updated) {
        return { success: true, data: updated };
      }

      // If no row existed, insert
      const { data: inserted, error: insertErr } = await supabase
        .from(table)
        .insert({ ...row, ...(userEmail ? { email: userEmail } : {}), created_at: now, updated_at: now })
        .select()
        .single();

      if (insertErr) return { success: false, error: insertErr.message };
      return { success: true, data: inserted };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Update specific fields on the profile row
  async updateProfile(userId, updates) {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from(table)
        .update({ ...updates, updated_at: now })
        .eq('user_id', userId)
        .select()
        .maybeSingle();

      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Return questionnaire-friendly data assembled from columns
  async getFormattedProfile(userId) {
    const res = await this.getProfile(userId);
    if (!res.success) return res;
    if (!res.data) return { success: true, data: null };
    return { success: true, data: mapRowToForm(res.data) };
  },

  // Return onboarding completion status
  async getOnboardingStatus(userId) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('onboarding_completed')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) return { success: false, error: error.message };
      return { success: true, completed: !!data?.onboarding_completed };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
};

export default ProfileService;