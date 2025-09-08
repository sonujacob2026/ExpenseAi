import React, { useEffect, useState } from 'react';
import { getGoals, saveGoal, deleteGoal, resetGoals } from '../services/budgetService';
import { remoteEnabled, listGoals, addGoal as addGoalRemote, removeGoal } from '../services/remoteBudgetService';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';

const GoalsModal = ({ onClose }) => {
  const { user } = useSupabaseAuth();
  const [goals, setGoals] = useState(() => getGoals());
  const [form, setForm] = useState({ title: '', target_amount: '', target_date: '' });
  const [syncing, setSyncing] = useState(false);

  const numberFormat = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(v || 0));

  const addGoal = async () => {
    if (!form.title || !form.target_amount) return;
    const local = {
      title: form.title,
      targetAmount: Number(form.target_amount) || 0,
      savedAmount: 0,
      targetDate: form.target_date || null
    };
    let created = saveGoal(local);
    if (remoteEnabled() && user?.id) {
      setSyncing(true);
      try {
        const remote = await addGoalRemote(user.id, local);
        created = { ...created, id: remote.id };
      } catch (_) {}
      setSyncing(false);
    }
    setGoals([created, ...goals]);
    setForm({ title: '', target_amount: '', target_date: '' });
  };

  const remove = async (id) => {
    deleteGoal(id);
    if (remoteEnabled() && user?.id) {
      try { await removeGoal(user.id, id); } catch (_) {}
    }
    setGoals(goals.filter((g) => g.id !== id));
  };

  const reset = () => {
    if (confirm('Remove all locally saved goals?')) {
      resetGoals();
      setGoals([]);
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!remoteEnabled() || !user?.id) return;
      setSyncing(true);
      try {
        const remote = await listGoals(user.id);
        if (Array.isArray(remote)) {
          // normalize
          const mapped = remote.map(r => ({
            id: r.id,
            title: r.title,
            targetAmount: Number(r.target_amount) || 0,
            savedAmount: Number(r.saved_amount) || 0,
            targetDate: r.target_date || null
          }));
          setGoals(mapped);
        }
      } finally {
        setSyncing(false);
      }
    };
    load();
  }, [user?.id]);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Financial Goals</h3>
        <div className="space-x-2">
          <button onClick={reset} className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm">Reset</button>
          {onClose && <button onClick={onClose} className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm">Close</button>}
        </div>
      </div>
      {syncing && (<div className="mb-3 p-2 bg-gray-50 text-gray-700 border border-gray-200 rounded text-sm">Syncing with server…</div>)}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <input
          type="text"
          placeholder="Goal title"
          className="px-3 py-2 border border-gray-300 rounded"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          type="number"
          placeholder="Target amount"
          className="px-3 py-2 border border-gray-300 rounded"
          value={form.target_amount}
          onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
        />
        <input
          type="date"
          className="px-3 py-2 border border-gray-300 rounded"
          value={form.target_date}
          onChange={(e) => setForm({ ...form, target_date: e.target.value })}
        />
      </div>
      <button onClick={addGoal} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Add Goal</button>

      <div className="mt-6 space-y-3">
        {goals.length === 0 && (
          <div className="text-sm text-gray-600">No goals yet. Add your first goal above.</div>
        )}
        {goals.map((g) => (
          <div key={g.id} className="p-4 border border-gray-200 rounded flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">{g.title}</div>
              <div className="text-xs text-gray-600">Target: {numberFormat(g.targetAmount)}{g.targetDate ? ` • By ${g.targetDate}` : ''}</div>
            </div>
            <button onClick={() => remove(g.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalsModal;


