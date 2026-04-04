import { useState } from 'react';
import { todayStr, getWeekKey, exportData } from '../hooks/useStore';

export default function HomeTab({ data, setData }) {
  const [showSettings, setShowSettings] = useState(false);
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
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
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Command</h1>
          <p className="text-text-secondary text-sm mt-0.5">{dateStr}</p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      {showSettings && (
        <div className="mb-4 p-3 bg-surface rounded border border-border">
          <h3 className="text-sm font-semibold mb-2">Settings</h3>
          <button
            onClick={exportData}
            className="w-full py-2 px-3 bg-accent text-white text-sm font-medium rounded hover:bg-accent/80 transition"
          >
            Export Data to JSON
          </button>
          <button
            onClick={() => {
              if (confirm('Reset all data? This cannot be undone.')) {
                localStorage.removeItem('command_app_data');
                window.location.reload();
              }
            }}
            className="w-full mt-2 py-2 px-3 bg-danger/20 text-danger text-sm font-medium rounded hover:bg-danger/30 transition"
          >
            Reset All Data
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Tasks Due" value={tasksDueToday} accent />
        <StatCard label="Habits" value={`${habitsCompletedToday}/${totalHabits}`} />
        <StatCard label="Outstanding" value={`$${outstandingInvoices.toLocaleString()}`} warn={outstandingInvoices > 0} />
        <StatCard label="Pipeline" value={`$${pipelineValue.toLocaleString()}`} />
      </div>

      <div className="space-y-4 mb-6">
        <WinField
          label="Weekly Business Win"
          value={currentWins.business}
          onChange={(v) => updateWin('business', v)}
        />
        <WinField
          label="Weekly Personal Win"
          value={currentWins.personal}
          onChange={(v) => updateWin('personal', v)}
        />
      </div>

      {pastWeeks.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Past Wins</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {pastWeeks.map(week => (
              <div key={week} className="p-3 bg-surface rounded border border-border">
                <p className="text-xs text-text-secondary mb-1.5">{week}</p>
                {wins[week].business && (
                  <p className="text-sm"><span className="text-text-secondary">Biz:</span> {wins[week].business}</p>
                )}
                {wins[week].personal && (
                  <p className="text-sm"><span className="text-text-secondary">Personal:</span> {wins[week].personal}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent, warn }) {
  return (
    <div className={`p-3 rounded border ${warn ? 'border-danger/40 bg-danger/5' : 'border-border bg-surface'}`}>
      <p className="text-xs text-text-secondary uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-bold mt-1 ${accent ? 'text-accent' : warn ? 'text-danger' : 'text-white'}`}>{value}</p>
    </div>
  );
}

function WinField({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="What's your win this week?"
        rows={2}
        className="w-full mt-1.5 p-2.5 bg-surface border border-border rounded text-sm text-white placeholder-text-secondary/50 resize-none focus:outline-none focus:border-accent transition"
      />
    </div>
  );
}
