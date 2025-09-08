import React, { useMemo, useState } from 'react';
import { getBudgets, saveBudgets, getMonthlySpendingSummary, getRemainingByCategory, resetBudgets, exportAllData, importAllData } from '../services/budgetService';
import { remoteEnabled, getBudget as getBudgetRemote, upsertBudget } from '../services/remoteBudgetService';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';

const DEFAULT_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Groceries',
  'Gas',
  'Other'
];

const BudgetOverview = ({ onClose }) => {
  const { user } = useSupabaseAuth();
  const [budgets, setBudgets] = useState(() => getBudgets());
  const [loadingRemote, setLoadingRemote] = useState(false);
  const [importError, setImportError] = useState('');

  const summary = useMemo(() => getMonthlySpendingSummary(new Date()), [budgets]);
  const remaining = useMemo(() => getRemainingByCategory(budgets, summary), [budgets, summary]);

  const numberFormat = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(v || 0));

  const persist = async (next) => {
    setBudgets(next);
    saveBudgets(next);
    try {
      if (remoteEnabled() && user?.id) {
        const now = new Date();
        await upsertBudget(user.id, now.getMonth() + 1, now.getFullYear(), {
          overallMonthly: next.overallMonthly,
          categories: next.categories || {}
        });
      }
    } catch (_) {}
  };

  const handleChangeOverall = (value) => {
    const updated = { ...budgets, overallMonthly: Math.max(Number(value) || 0, 0) };
    persist(updated);
  };

  const handleChangeCategory = (cat, value) => {
    const categories = { ...(budgets.categories || {}) };
    categories[cat] = Math.max(Number(value) || 0, 0);
    const updated = { ...budgets, categories };
    persist(updated);
  };

  const totalCategoryBudget = Object.values(budgets.categories || {}).reduce((s, v) => s + (Number(v) || 0), 0);

  const onExport = () => exportAllData();
  const onImport = (file) => {
    setImportError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        importAllData(json);
        setBudgets(getBudgets());
      } catch (err) {
        setImportError('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const onReset = () => {
    if (confirm('Reset budgets to default?')) {
      resetBudgets();
      setBudgets(getBudgets());
    }
  };

  // Initial remote load
  React.useEffect(() => {
    const load = async () => {
      if (!remoteEnabled() || !user?.id) return;
      setLoadingRemote(true);
      try {
        const now = new Date();
        const remote = await getBudgetRemote(user.id, now.getMonth() + 1, now.getFullYear());
        if (remote) {
          const next = {
            overallMonthly: Number(remote.overall_monthly) || 0,
            categories: remote.categories || {}
          };
          setBudgets(next);
          saveBudgets(next);
        }
      } finally {
        setLoadingRemote(false);
      }
    };
    load();
  }, [user?.id]);

  const isOverBudget = (cat) => {
    const cap = budgets.categories?.[cat] || 0;
    const spent = summary.byCategory?.[cat] || 0;
    return cap > 0 && spent > cap;
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Budget Overview</h3>
        <div className="space-x-2">
          <button onClick={onExport} className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm">Export</button>
          <label className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-sm cursor-pointer">
            Import
            <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} />
          </label>
          <button onClick={onReset} className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm">Reset</button>
          {onClose && (
            <button onClick={onClose} className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm">Close</button>
          )}
        </div>
      </div>

      {loadingRemote && (
        <div className="mb-3 p-2 bg-gray-50 text-gray-700 border border-gray-200 rounded text-sm">Syncing with server…</div>
      )}

      {importError && (
        <div className="mb-3 p-2 bg-red-50 text-red-700 border border-red-200 rounded text-sm">{importError}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Overall Monthly Budget</div>
          <div className="flex items-center space-x-3">
            <input type="number" value={budgets.overallMonthly || 0} onChange={(e) => handleChangeOverall(e.target.value)} className="w-44 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500" />
            <div className="text-gray-700">{numberFormat(budgets.overallMonthly || 0)}</div>
          </div>
          <div className="mt-2 text-xs text-gray-500">Sum of category budgets: {numberFormat(totalCategoryBudget)}</div>
        </div>

        <div className="bg-gray-50 rounded p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">This Month's Spending</div>
          <div className="text-2xl font-bold text-gray-900">{numberFormat(summary.total)}</div>
          <div className="text-xs text-gray-500">{summary.count} transactions</div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="font-semibold text-gray-900 mb-3">Category Budgets</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEFAULT_CATEGORIES.map((cat) => (
            <div key={cat} className={`p-4 bg-white border rounded ${isOverBudget(cat) ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
              <div className="text-sm text-gray-700 mb-1">{cat}</div>
              <div className="flex items-center justify-between space-x-3">
                <input type="number" className="w-28 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500" value={budgets.categories?.[cat] || 0} onChange={(e) => handleChangeCategory(cat, e.target.value)} />
                <div className="text-sm text-gray-600">Budget: {numberFormat(budgets.categories?.[cat] || 0)}</div>
              </div>
              <div className={`mt-2 text-xs ${isOverBudget(cat) ? 'text-red-700' : 'text-gray-500'}`}>Spent: {numberFormat((summary.byCategory?.[cat]) || 0)} • Remaining: {numberFormat(remaining[cat] || 0)}{isOverBudget(cat) ? ' • Over budget!' : ''}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BudgetOverview;


