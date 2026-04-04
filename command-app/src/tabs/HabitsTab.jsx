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
    <div className="px-5 pt-14 pb-8 max-w-lg mx-auto">
      <h1 className="text-[28px] font-bold tracking-tight mb-6">Habits</h1>

      <div className="flex gap-1 mb-6 bg-surface rounded-xl p-1 border border-border-subtle">
        {['business', 'personal'].map(tab => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`flex-1 py-2 text-[13px] font-semibold rounded-lg capitalize transition-all duration-200 ${
              subTab === tab
                ? 'bg-surface-3 text-text-primary shadow-sm'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-3 mb-5">
        {habits.map(habit => {
          const todayCount = habit.completions[today] || 0;
          const streak = getStreak(habit);
          const isExpanded = expanded === habit.id;
          const target = habit.targetPeriod === 'day' ? habit.targetCount : Math.ceil(habit.targetCount / 7);
          const progress = Math.min(todayCount / Math.max(target, 1), 1);

          return (
            <div key={habit.id} className="card card-glow overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[14px] font-semibold">{habit.name}</span>
                      <span className="text-[11px] text-text-tertiary font-medium px-1.5 py-0.5 bg-surface-2 rounded-md">
                        {habit.targetCount}/{habit.targetPeriod}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[12px] text-text-tertiary">
                        Today <span className="text-text-secondary font-semibold">{todayCount}</span>
                      </span>
                      {streak > 0 && (
                        <span className="text-[12px] text-text-tertiary">
                          Streak <span className="text-accent font-semibold">{streak}d</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => logCompletion(habit.id)}
                    className="px-4 py-2 bg-accent text-white text-[12px] font-bold rounded-xl hover:bg-accent/85 transition-all shadow-[0_2px_8px_rgba(0,102,255,0.25)] active:scale-95"
                  >
                    +1
                  </button>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 bg-surface-3 rounded-full mb-3 overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>

                {/* Mini heatmap */}
                <div className="flex items-center justify-between">
                  <MiniHeatmap habit={habit} />
                  <button
                    onClick={() => setExpanded(isExpanded ? null : habit.id)}
                    className="text-text-tertiary hover:text-text-secondary p-1.5 rounded-lg hover:bg-surface-2 transition-all"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-border">
                  <div className="pt-3">
                    <p className="text-[11px] text-text-tertiary font-semibold uppercase tracking-[0.06em] mb-2">52 Week View</p>
                    <Heatmap habit={habit} />
                    <div className="flex justify-end mt-3">
                      <button onClick={() => deleteHabit(habit.id)} className="text-[12px] text-danger/60 hover:text-danger font-medium px-2 py-1 rounded-lg hover:bg-danger-soft transition-all">
                        Delete Habit
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showAdd ? (
        <div className="card card-glow p-4 space-y-3">
          <input
            autoFocus
            value={newHabit.name}
            onChange={(e) => setNewHabit(n => ({ ...n, name: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && addHabit()}
            placeholder="Habit name..."
            className="w-full bg-transparent text-[14px] text-text-primary placeholder-text-tertiary focus:outline-none font-medium"
          />
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              value={newHabit.targetCount}
              onChange={(e) => setNewHabit(n => ({ ...n, targetCount: e.target.value }))}
              className="w-24 bg-surface-2 border border-border rounded-lg px-3 py-2 text-[12px] text-text-primary"
            />
            <select
              value={newHabit.targetPeriod}
              onChange={(e) => setNewHabit(n => ({ ...n, targetPeriod: e.target.value }))}
              className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-2 text-[12px] text-text-primary"
            >
              <option value="day">per day</option>
              <option value="week">per week</option>
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setShowAdd(false)} className="flex-1 py-2 text-[13px] text-text-tertiary font-medium rounded-lg hover:bg-surface-2 transition">Cancel</button>
            <button onClick={addHabit} className="flex-1 py-2 bg-accent text-white text-[13px] font-semibold rounded-lg shadow-[0_2px_8px_rgba(0,102,255,0.3)]">Add Habit</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full py-3 border border-dashed border-border rounded-2xl text-[13px] text-text-tertiary font-medium hover:border-accent/50 hover:text-accent hover:bg-accent/5 transition-all duration-200"
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
  for (let i = 20; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    const count = habit.completions[ds] || 0;
    const isToday = ds === todayStr_;
    cells.push({ date: ds, count, isToday });
  }

  return (
    <div className="flex gap-[3px]">
      {cells.map(c => (
        <div
          key={c.date}
          className={`w-[10px] h-[10px] rounded-[3px] transition-colors ${c.isToday ? 'ring-1 ring-accent ring-offset-1 ring-offset-bg' : ''}`}
          style={{
            backgroundColor: c.count > 0
              ? `rgba(0, 102, 255, ${Math.min(0.25 + c.count * 0.2, 1)})`
              : 'var(--color-surface-3)'
          }}
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

  const dayLabels = ['', 'M', '', 'W', '', 'F', ''];

  return (
    <div className="flex gap-[2px] overflow-x-auto pb-1">
      <div className="flex flex-col gap-[2px] mr-1 flex-shrink-0">
        {dayLabels.map((l, i) => (
          <div key={i} className="text-[7px] text-text-tertiary h-[9px] leading-[9px] w-3">{l}</div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-[2px]">
          {week.map(cell => (
            <div
              key={cell.date}
              className={`w-[9px] h-[9px] rounded-[2px] ${cell.isToday ? 'ring-1 ring-accent' : ''} ${cell.isFuture ? 'opacity-15' : ''}`}
              style={{
                backgroundColor: cell.count > 0
                  ? `rgba(0, 102, 255, ${Math.min(0.2 + cell.count * 0.2, 1)})`
                  : 'var(--color-surface-3)'
              }}
              title={`${cell.date}: ${cell.count}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
