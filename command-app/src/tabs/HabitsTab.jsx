import { useState } from 'react';
import { todayStr } from '../hooks/useStore';

export default function HabitsTab({ data, setData }) {
  const [subTab, setSubTab] = useState('business');
  const [showAdd, setShowAdd] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', targetCount: 1, targetPeriod: 'day' });

  const today = todayStr();
  const habits = data.habits.filter(h => h.category === subTab);

  const logCompletion = (id) => setData(d => ({ ...d, habits: d.habits.map(h => h.id !== id ? h : { ...h, completions: { ...h.completions, [today]: (h.completions[today] || 0) + 1 } }) }));
  const addHabit = () => {
    if (!newHabit.name.trim()) return;
    setData(d => ({ ...d, habits: [...d.habits, { id: Date.now().toString(), name: newHabit.name.trim(), category: subTab, targetCount: parseInt(newHabit.targetCount) || 1, targetPeriod: newHabit.targetPeriod, completions: {} }] }));
    setNewHabit({ name: '', targetCount: 1, targetPeriod: 'day' }); setShowAdd(false);
  };
  const deleteHabit = (id) => setData(d => ({ ...d, habits: d.habits.filter(h => h.id !== id) }));
  const getStreak = (h) => { let s = 0; const d = new Date(); for (let i = 0; i < 365; i++) { const ds = d.toISOString().split('T')[0]; if (h.completions[ds] > 0) s++; else if (i > 0) break; d.setDate(d.getDate() - 1); } return s; };

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-text-primary">Habits</h1>
          <div className="flex bg-surface border border-border rounded-lg p-0.5">
            {['business', 'personal'].map(tab => (
              <button key={tab} onClick={() => setSubTab(tab)}
                className={`px-3 py-1.5 text-[13px] font-medium rounded-md capitalize transition-colors ${subTab === tab ? 'bg-surface-2 text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-secondary'}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Habit
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card p-5 mb-5">
          <h3 className="text-sm font-semibold mb-3">New Habit</h3>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-text-secondary font-medium block mb-1.5">Name</label>
              <input autoFocus value={newHabit.name} onChange={(e) => setNewHabit(n => ({ ...n, name: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && addHabit()} placeholder="e.g. Cold outreach"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm placeholder-text-tertiary" />
            </div>
            <div>
              <label className="text-xs text-text-secondary font-medium block mb-1.5">Target</label>
              <div className="flex items-center gap-2">
                <input type="number" min="1" value={newHabit.targetCount} onChange={(e) => setNewHabit(n => ({ ...n, targetCount: e.target.value }))}
                  className="w-16 bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm" />
                <span className="text-sm text-text-tertiary">per</span>
                <select value={newHabit.targetPeriod} onChange={(e) => setNewHabit(n => ({ ...n, targetPeriod: e.target.value }))}
                  className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm">
                  <option value="day">day</option><option value="week">week</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowAdd(false)} className="px-3 py-2 text-sm text-text-secondary border border-border rounded-lg hover:bg-surface-2">Cancel</button>
              <button onClick={addHabit} className="px-3 py-2 bg-accent text-white text-sm font-medium rounded-lg">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Habits Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {habits.length === 0 && (
          <div className="col-span-full card p-12 text-center text-sm text-text-tertiary">
            No {subTab} habits yet. Add one to get started.
          </div>
        )}
        {habits.map(h => {
          const todayCount = h.completions[today] || 0;
          const target = h.targetPeriod === 'day' ? h.targetCount : Math.ceil(h.targetCount / 7);
          const done = todayCount >= target;
          const streak = getStreak(h);
          const pct = Math.min(todayCount / Math.max(target, 1), 1);

          return (
            <div key={h.id} className="card p-5 group">
              {/* Header row */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">{h.name}</h3>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {h.targetCount}/{h.targetPeriod}
                    {streak > 0 && <span className="text-accent ml-2">{streak}d streak</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => logCompletion(h.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${done ? 'bg-emerald-50 text-emerald-600' : 'bg-accent text-white hover:bg-accent/90'}`}>
                    {done ? '✓ Done' : '+1'}
                  </button>
                  <button onClick={() => deleteHabit(h.id)}
                    className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-danger p-1 transition-all rounded hover:bg-danger-soft">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-2 bg-surface-2 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${done ? 'bg-emerald-500' : 'bg-accent'}`} style={{ width: `${pct * 100}%` }} />
                </div>
                <span className="text-xs text-text-secondary font-medium w-10 text-right">{todayCount}/{target}</span>
              </div>

              {/* Heatmap */}
              <Heatmap habit={h} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Heatmap({ habit }) {
  const today = new Date();
  const todayStr_ = today.toISOString().split('T')[0];
  const weeks = [];
  const start = new Date(today);
  start.setDate(start.getDate() - (52 * 7) + (7 - start.getDay()));
  for (let w = 0; w < 52; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start); date.setDate(date.getDate() + w * 7 + d);
      const ds = date.toISOString().split('T')[0];
      week.push({ date: ds, count: habit.completions[ds] || 0, isToday: ds === todayStr_, isFuture: date > today });
    }
    weeks.push(week);
  }
  return (
    <div className="flex gap-[2px] overflow-hidden">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-[2px]">
          {week.map(cell => (
            <div key={cell.date}
              className={`w-[7px] h-[7px] rounded-[2px] ${cell.isToday ? 'ring-1 ring-accent ring-offset-1 ring-offset-surface' : ''} ${cell.isFuture ? 'opacity-10' : ''}`}
              style={{ backgroundColor: cell.count > 0 ? `rgba(79, 110, 247, ${Math.min(0.2 + cell.count * 0.25, 1)})` : '#E4E7EB' }}
              title={`${cell.date}: ${cell.count}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
