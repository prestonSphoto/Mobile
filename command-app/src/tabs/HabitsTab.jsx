import { useState } from 'react';
import { todayStr } from '../hooks/useStore';

export default function HabitsTab({ data, setData }) {
  const [subTab, setSubTab] = useState('business');
  const [expanded, setExpanded] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', targetCount: 1, targetPeriod: 'day' });

  const today = todayStr();
  const habits = data.habits.filter(h => h.category === subTab);

  const logCompletion = (habitId) => {
    setData(d => ({
      ...d,
      habits: d.habits.map(h => {
        if (h.id !== habitId) return h;
        return { ...h, completions: { ...h.completions, [today]: (h.completions[today] || 0) + 1 } };
      })
    }));
  };

  const addHabit = () => {
    if (!newHabit.name.trim()) return;
    setData(d => ({ ...d, habits: [...d.habits, {
      id: Date.now().toString(), name: newHabit.name.trim(), category: subTab,
      targetCount: parseInt(newHabit.targetCount) || 1, targetPeriod: newHabit.targetPeriod, completions: {},
    }] }));
    setNewHabit({ name: '', targetCount: 1, targetPeriod: 'day' });
    setShowAdd(false);
  };

  const deleteHabit = (id) => setData(d => ({ ...d, habits: d.habits.filter(h => h.id !== id) }));

  const getStreak = (habit) => {
    let streak = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      const ds = d.toISOString().split('T')[0];
      if (habit.completions[ds] > 0) streak++;
      else if (i > 0) break;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Habits</h1>
        <button onClick={() => setShowAdd(true)} className="px-3 py-1.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors">
          + Add habit
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-4 mb-6 border-b border-border">
        {['business', 'personal'].map(tab => (
          <button key={tab} onClick={() => setSubTab(tab)}
            className={`pb-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              subTab === tab ? 'border-accent text-text-primary' : 'border-transparent text-text-tertiary hover:text-text-secondary'
            }`}>{tab}</button>
        ))}
      </div>

      {showAdd && (
        <div className="bg-surface border border-border rounded-lg p-4 mb-4 space-y-3">
          <input autoFocus value={newHabit.name} onChange={(e) => setNewHabit(n => ({ ...n, name: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && addHabit()} placeholder="Habit name"
            className="w-full bg-transparent text-sm font-medium text-text-primary placeholder-text-tertiary focus:outline-none" />
          <div className="flex gap-2 items-center">
            <input type="number" min="1" value={newHabit.targetCount} onChange={(e) => setNewHabit(n => ({ ...n, targetCount: e.target.value }))}
              className="w-20 bg-surface-2 border border-border rounded-md px-3 py-1.5 text-xs text-text-primary" />
            <span className="text-xs text-text-tertiary">times per</span>
            <select value={newHabit.targetPeriod} onChange={(e) => setNewHabit(n => ({ ...n, targetPeriod: e.target.value }))}
              className="bg-surface-2 border border-border rounded-md px-3 py-1.5 text-xs text-text-primary">
              <option value="day">day</option><option value="week">week</option>
            </select>
            <div className="flex-1" />
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-sm text-text-tertiary">Cancel</button>
            <button onClick={addHabit} className="px-4 py-1.5 bg-accent text-white text-sm font-medium rounded-lg">Add</button>
          </div>
        </div>
      )}

      {/* Habits grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {habits.map(habit => {
          const todayCount = habit.completions[today] || 0;
          const streak = getStreak(habit);
          const isExpanded = expanded === habit.id;
          const target = habit.targetPeriod === 'day' ? habit.targetCount : Math.ceil(habit.targetCount / 7);
          const pct = Math.min(todayCount / Math.max(target, 1), 1);
          const done = pct >= 1;

          return (
            <div key={habit.id} className="bg-surface border border-border rounded-lg overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium">{habit.name}</p>
                    <p className="text-xs text-text-tertiary mt-0.5">
                      {habit.targetCount}/{habit.targetPeriod}
                      {streak > 0 && <span className="ml-2 text-accent">{streak}d streak</span>}
                    </p>
                  </div>
                  <button onClick={() => logCompletion(habit.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                      done ? 'bg-success/15 text-success' : 'bg-accent text-white hover:bg-accent/90'
                    }`}>
                    {done ? 'Done' : `+1`}
                  </button>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${done ? 'bg-success' : 'bg-accent'}`} style={{ width: `${pct * 100}%` }} />
                  </div>
                  <span className="text-xs text-text-tertiary font-mono w-8 text-right">{todayCount}/{target}</span>
                </div>

                {/* Mini heatmap */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-[3px]">
                    {getLast21Days().map(ds => {
                      const c = habit.completions[ds] || 0;
                      return (
                        <div key={ds}
                          className={`w-[9px] h-[9px] rounded-sm ${ds === today ? 'ring-1 ring-accent ring-offset-1 ring-offset-surface' : ''}`}
                          style={{ backgroundColor: c > 0 ? `rgba(59, 130, 246, ${Math.min(0.25 + c * 0.2, 1)})` : 'var(--color-surface-3)' }}
                          title={`${ds}: ${c}`}
                        />
                      );
                    })}
                  </div>
                  <button onClick={() => setExpanded(isExpanded ? null : habit.id)}
                    className="text-xs text-text-tertiary hover:text-text-secondary transition-colors">
                    {isExpanded ? 'Less' : 'More'}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-border pt-3">
                  <p className="text-xs text-text-tertiary font-medium mb-2">52-week view</p>
                  <Heatmap habit={habit} />
                  <button onClick={() => deleteHabit(habit.id)} className="text-xs text-danger/60 hover:text-danger mt-3 block">Delete habit</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getLast21Days() {
  const days = [];
  const d = new Date();
  for (let i = 20; i >= 0; i--) {
    const dd = new Date(d);
    dd.setDate(dd.getDate() - i);
    days.push(dd.toISOString().split('T')[0]);
  }
  return days;
}

function Heatmap({ habit }) {
  const today = new Date();
  const todayStr_ = today.toISOString().split('T')[0];
  const weeks = [];
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (52 * 7) + (7 - startDate.getDay()));

  for (let w = 0; w < 52; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + w * 7 + d);
      const ds = date.toISOString().split('T')[0];
      week.push({ date: ds, count: habit.completions[ds] || 0, isToday: ds === todayStr_, isFuture: date > today });
    }
    weeks.push(week);
  }

  return (
    <div className="flex gap-[2px] overflow-x-auto pb-1">
      <div className="flex flex-col gap-[2px] mr-1 flex-shrink-0">
        {['', 'M', '', 'W', '', 'F', ''].map((l, i) => (
          <div key={i} className="text-[7px] text-text-tertiary h-[9px] leading-[9px] w-3">{l}</div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-[2px]">
          {week.map(cell => (
            <div key={cell.date}
              className={`w-[9px] h-[9px] rounded-sm ${cell.isToday ? 'ring-1 ring-accent' : ''} ${cell.isFuture ? 'opacity-15' : ''}`}
              style={{ backgroundColor: cell.count > 0 ? `rgba(59, 130, 246, ${Math.min(0.2 + cell.count * 0.2, 1)})` : 'var(--color-surface-3)' }}
              title={`${cell.date}: ${cell.count}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
