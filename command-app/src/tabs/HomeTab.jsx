import { useState } from 'react';
import { todayStr, getWeekKey, exportData } from '../hooks/useStore';

export default function HomeTab({ data, setData }) {
  const [showSettings, setShowSettings] = useState(false);
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDay = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const currentWeek = getWeekKey();

  const tasksDueToday = data.tasks.filter(t => !t.completed && t.dueDate === todayStr()).length;

  const totalHabits = data.habits.length;
  const habitsCompletedToday = data.habits.filter(h => {
    const count = h.completions[todayStr()] || 0;
    return count >= (h.targetPeriod === 'day' ? h.targetCount : 1);
  }).length;

  const outstandingInvoices = data.invoices
    .filter(i => i.status !== 'paid')
    .reduce((sum, i) => sum + i.amount, 0);

  const pipelineValue = data.pipeline.cards
    .filter(c => c.column !== 'closed' && !c.lost)
    .reduce((sum, c) => sum + c.value, 0);

  const wins = data.wins || {};
  const currentWins = wins[currentWeek] || { business: '', personal: '' };

  const pastWeeks = Object.keys(wins)
    .filter(k => k !== currentWeek)
    .sort()
    .reverse();

  const updateWin = (field, value) => {
    setData(d => ({
      ...d,
      wins: { ...d.wins, [currentWeek]: { ...currentWins, [field]: value } }
    }));
  };

  return (
    <div className="px-5 pt-14 pb-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-text-tertiary text-[13px] font-medium tracking-wide uppercase mb-1">{dayName}</p>
          <h1 className="text-[28px] font-bold tracking-tight leading-none">{monthDay}</h1>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`mt-1 w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 ${
            showSettings ? 'bg-accent/15 text-accent' : 'bg-surface-2 text-text-tertiary hover:text-text-secondary'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="card card-glow p-4 mb-6 space-y-3 animate-[fadeIn_0.2s_ease]">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <span className="text-accent text-sm font-bold">C</span>
            </div>
            <div>
              <p className="text-sm font-semibold">Command</p>
              <p className="text-[11px] text-text-tertiary">v1.0 — Creative Studio Ops</p>
            </div>
          </div>
          <button
            onClick={exportData}
            className="w-full py-2.5 px-4 bg-surface-2 text-text-primary text-[13px] font-medium rounded-xl hover:bg-surface-3 transition-colors flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Data (JSON)
          </button>
          <button
            onClick={() => {
              if (confirm('Reset all data? This cannot be undone.')) {
                localStorage.removeItem('command_app_data');
                window.location.reload();
              }
            }}
            className="w-full py-2.5 px-4 bg-danger-soft text-danger text-[13px] font-medium rounded-xl hover:bg-danger/20 transition-colors"
          >
            Reset All Data
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <StatCard label="Tasks Due" value={tasksDueToday} color="accent" icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        } />
        <StatCard label="Habits" value={`${habitsCompletedToday}/${totalHabits}`} color="success" icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        } />
        <StatCard label="Outstanding" value={`$${outstandingInvoices.toLocaleString()}`} color="danger" icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        } />
        <StatCard label="Pipeline" value={`$${pipelineValue.toLocaleString()}`} color="warning" icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
        } />
      </div>

      {/* Weekly Wins */}
      <div className="space-y-4 mb-8">
        <WinField
          label="Business Win"
          emoji="/"
          value={currentWins.business}
          onChange={(v) => updateWin('business', v)}
        />
        <WinField
          label="Personal Win"
          emoji="/"
          value={currentWins.personal}
          onChange={(v) => updateWin('personal', v)}
        />
      </div>

      {/* Past Wins */}
      {pastWeeks.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.08em] mb-3">Previous Weeks</p>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {pastWeeks.map(week => (
              <div key={week} className="p-3.5 bg-surface rounded-xl border border-border-subtle">
                <p className="text-[11px] text-text-tertiary font-medium mb-2">{week}</p>
                {wins[week].business && (
                  <p className="text-[13px] text-text-secondary leading-snug">
                    <span className="text-text-tertiary mr-1.5">Biz</span>{wins[week].business}
                  </p>
                )}
                {wins[week].personal && (
                  <p className="text-[13px] text-text-secondary leading-snug mt-1">
                    <span className="text-text-tertiary mr-1.5">Self</span>{wins[week].personal}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon }) {
  const colorMap = {
    accent: { bg: 'bg-accent/8', text: 'text-accent', iconBg: 'bg-accent/12', border: 'border-accent/10' },
    success: { bg: 'bg-success/8', text: 'text-success', iconBg: 'bg-success/12', border: 'border-success/10' },
    danger: { bg: 'bg-danger/8', text: 'text-danger', iconBg: 'bg-danger/12', border: 'border-danger/10' },
    warning: { bg: 'bg-warning/8', text: 'text-warning', iconBg: 'bg-warning/12', border: 'border-warning/10' },
  };
  const c = colorMap[color];

  return (
    <div className={`p-4 rounded-2xl border ${c.border} ${c.bg} transition-all duration-200`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.06em]">{label}</p>
        <div className={`w-6 h-6 rounded-lg ${c.iconBg} flex items-center justify-center ${c.text}`}>
          {icon}
        </div>
      </div>
      <p className={`text-2xl font-bold tracking-tight ${c.text}`}>{value}</p>
    </div>
  );
}

function WinField({ label, value, onChange }) {
  return (
    <div className="card p-4">
      <label className="text-[11px] font-semibold text-text-tertiary uppercase tracking-[0.08em] mb-2 block">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="What's your win this week?"
        rows={2}
        className="w-full bg-surface-2 border border-border rounded-xl p-3 text-[13px] text-text-primary placeholder-text-tertiary resize-none focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,102,255,0.1)] transition-all"
      />
    </div>
  );
}
