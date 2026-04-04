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
        const count = (h.completions[today] || 0) + 1;
        return { ...h, completions: { ...h.completions, [today]: count } };
      })
    }));
  };

  const addHabit = () => {
    if (!newHabit.name.trim()) return;
    const habit = {
      id: Date.now().toString(),
      name: newHabit.name.trim(),
      category: subTab,
      targetCount: parseInt(newHabit.targetCount) || 1,
      targetPeriod: newHabit.targetPeriod,
      completions: {},
    };
    setData(d => ({ ...d, habits: [...d.habits, habit] }));
    setNewHabit({ name: '', targetCount: 1, targetPeriod: 'day' });
    setShowAdd(false);
  };

  const deleteHabit = (id) => {
    setData(d => ({ ...d, habits: d.habits.filter(h => h.id !== id) }));
  };

  const getStreak = (habit) => {
    let streak = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      const dateStr = d.toISOString().split('T')[0];
      if (habit.completions[dateStr] && habit.completions[dateStr] > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
      d.setDate(d.getDate() - 1);
    }
    return streak;
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold tracking-tight mb-4">Habits</h1>

      <div className="flex gap-1 mb-4 bg-surface rounded p-0.5">
        {['business', 'personal'].map(tab => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`flex-1 py-1.5 text-sm font-medium rounded capitalize transition ${
              subTab === tab ? 'bg-surface-2 text-white' : 'text-text-secondary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-3 mb-4">
        {habits.map(habit => {
          const todayCount = habit.completions[today] || 0;
          const streak = getStreak(habit);
          const isExpanded = expanded === habit.id;
          return (
            <div key={habit.id} className="bg-surface border border-border rounded overflow-hidden">
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{habit.name}</span>
                      <span className="text-xs text-text-secondary">{habit.targetCount}/{habit.targetPeriod}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-text-secondary">Today: <span className="text-white">{todayCount}</span></span>
                      <span className="text-xs text-text-secondary">Streak: <span className="text-accent">{streak}d</span></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => logCompletion(habit.id)}
                      className="px-3 py-1.5 bg-accent text-white text-xs font-medium rounded hover:bg-accent/80 transition"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : habit.id)}
                      className="text-text-secondary hover:text-white p-1"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                </div>
                <MiniHeatmap habit={habit} compact />
              </div>
              {isExpanded && (
                <div className="p-3 pt-0 border-t border-border mt-0">
                  <div className="pt-3">
                    <Heatmap habit={habit} />
                    <div className="flex justify-end mt-2">
                      <button onClick={() => deleteHabit(habit.id)} className="text-xs text-danger hover:text-danger/80">Delete</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showAdd ? (
        <div className="p-3 bg-surface border border-border rounded space-y-3">
          <input
            autoFocus
            value={newHabit.name}
            onChange={(e) => setNewHabit(n => ({ ...n, name: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && addHabit()}
            placeholder="Habit name..."
            className="w-full bg-transparent text-sm text-white placeholder-text-secondary/50 focus:outline-none"
          />
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              value={newHabit.targetCount}
              onChange={(e) => setNewHabit(n => ({ ...n, targetCount: e.target.value }))}
              className="w-20 bg-surface-2 border border-border rounded px-2 py-1 text-xs text-white"
            />
            <select
              value={newHabit.targetPeriod}
              onChange={(e) => setNewHabit(n => ({ ...n, targetPeriod: e.target.value }))}
              className="bg-surface-2 border border-border rounded px-2 py-1 text-xs text-white"
            >
              <option value="day">per day</option>
              <option value="week">per week</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(false)} className="flex-1 py-1.5 text-sm text-text-secondary">Cancel</button>
            <button onClick={addHabit} className="flex-1 py-1.5 bg-accent text-white text-sm font-medium rounded">Add</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full py-2.5 border border-dashed border-border rounded text-sm text-text-secondary hover:border-accent hover:text-accent transition"
        >
          + Add Habit
        </button>
      )}
    </div>
  );
}

function MiniHeatmap({ habit }) {
  const today = new Date();
  const todayStr_ = today.toISOString().split('T')[0];
  const cells = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    const count = habit.completions[ds] || 0;
    const isToday = ds === todayStr_;
    cells.push({ date: ds, count, isToday });
  }

  return (
    <div className="flex gap-0.5">
      {cells.map(c => (
        <div
          key={c.date}
          className={`w-3 h-3 rounded-[1px] ${c.isToday ? 'ring-1 ring-accent' : ''}`}
          style={{ backgroundColor: c.count > 0 ? `rgba(0, 87, 255, ${Math.min(0.3 + c.count * 0.2, 1)})` : '#1E1E1E' }}
          title={`${c.date}: ${c.count}`}
        />
      ))}
    </div>
  );
}

function Heatmap({ habit }) {
  const today = new Date();
  const todayStr_ = today.toISOString().split('T')[0];
  const weeks = [];

  // Build 52 weeks x 7 days grid
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (52 * 7) + (7 - startDate.getDay()));

  for (let w = 0; w < 52; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + w * 7 + d);
      const ds = date.toISOString().split('T')[0];
      const count = habit.completions[ds] || 0;
      const isToday = ds === todayStr_;
      const isFuture = date > today;
      week.push({ date: ds, count, isToday, isFuture });
    }
    weeks.push(week);
  }

  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  return (
    <div className="flex gap-0.5 overflow-x-auto">
      <div className="flex flex-col gap-0.5 mr-1">
        {dayLabels.map((l, i) => (
          <div key={i} className="text-[8px] text-text-secondary h-[10px] leading-[10px]">{l}</div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-0.5">
          {week.map(cell => (
            <div
              key={cell.date}
              className={`w-[10px] h-[10px] rounded-[1px] ${cell.isToday ? 'ring-1 ring-accent' : ''} ${cell.isFuture ? 'opacity-20' : ''}`}
              style={{
                backgroundColor: cell.count > 0
                  ? `rgba(0, 87, 255, ${Math.min(0.25 + cell.count * 0.2, 1)})`
                  : '#1E1E1E'
              }}
              title={`${cell.date}: ${cell.count}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
