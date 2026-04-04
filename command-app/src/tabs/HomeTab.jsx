import { useState } from 'react';
import { todayStr, getWeekKey, exportData } from '../hooks/useStore';

export default function HomeTab({ data, setData }) {
  const [showSettings, setShowSettings] = useState(false);
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const currentWeek = getWeekKey();

  const td = todayStr();
  const tasksDueToday = data.tasks.filter(t => !t.completed && t.dueDate === td).length;
  const totalHabits = data.habits.length;
  const habitsCompletedToday = data.habits.filter(h => {
    const count = h.completions[td] || 0;
    return count >= (h.targetPeriod === 'day' ? h.targetCount : 1);
  }).length;
  const outstandingInvoices = data.invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0);
  const pipelineValue = data.pipeline.cards.filter(c => c.column !== 'closed' && !c.lost).reduce((s, c) => s + c.value, 0);
  const overdueCount = data.invoices.filter(i => i.status !== 'paid' && i.dueDate < td).length;

  const wins = data.wins || {};
  const currentWins = wins[currentWeek] || { business: '', personal: '' };
  const pastWeeks = Object.keys(wins).filter(k => k !== currentWeek).sort().reverse();

  const updateWin = (field, value) => {
    setData(d => ({ ...d, wins: { ...d.wins, [currentWeek]: { ...currentWins, [field]: value } } }));
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-1">Good {getGreeting()}</h1>
          <p className="text-text-secondary text-sm">{dateStr}</p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${showSettings ? 'bg-accent/15 text-accent' : 'bg-surface-2 text-text-tertiary hover:text-text-secondary hover:bg-surface-3'}`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </button>
      </div>

      {showSettings && (
        <div className="bg-surface border border-border rounded-lg p-4 mb-6 max-w-sm space-y-2">
          <button onClick={exportData} className="w-full py-2 px-3 bg-surface-2 text-sm rounded-lg hover:bg-surface-3 transition-colors text-left flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Data (JSON)
          </button>
          <button onClick={() => { if (confirm('Reset all data?')) { localStorage.removeItem('command_app_data'); window.location.reload(); }}} className="w-full py-2 px-3 bg-danger-soft text-danger text-sm rounded-lg hover:bg-danger/20 transition-colors text-left">Reset All Data</button>
        </div>
      )}

      {/* Alert banner */}
      {overdueCount > 0 && (
        <div className="flex items-center gap-3 p-3 mb-6 bg-danger-soft border border-danger/20 rounded-lg">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-danger flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p className="text-sm text-danger">{overdueCount} overdue invoice{overdueCount > 1 ? 's' : ''} need attention</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard label="Tasks due today" value={tasksDueToday} sub={`${data.tasks.filter(t => !t.completed).length} total active`} color="blue" />
        <StatCard label="Habits today" value={`${habitsCompletedToday}/${totalHabits}`} sub={habitsCompletedToday === totalHabits ? 'All done!' : `${totalHabits - habitsCompletedToday} remaining`} color="green" />
        <StatCard label="Outstanding" value={`$${outstandingInvoices.toLocaleString()}`} sub={`${data.invoices.filter(i => i.status !== 'paid').length} invoice${data.invoices.filter(i => i.status !== 'paid').length !== 1 ? 's' : ''}`} color="red" />
        <StatCard label="Pipeline value" value={`$${pipelineValue.toLocaleString()}`} sub={`${data.pipeline.cards.filter(c => !c.lost && c.column !== 'closed').length} active deals`} color="yellow" />
      </div>

      {/* Wins */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-text-secondary mb-3">This week's wins</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <WinField label="Business" value={currentWins.business} onChange={(v) => updateWin('business', v)} />
          <WinField label="Personal" value={currentWins.personal} onChange={(v) => updateWin('personal', v)} />
        </div>
      </div>

      {pastWeeks.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-text-secondary mb-3">Past weeks</h2>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {pastWeeks.map(week => (
              <div key={week} className="flex gap-4 p-3 bg-surface rounded-lg border border-border-subtle text-sm">
                <span className="text-text-tertiary font-mono text-xs pt-0.5 w-20 flex-shrink-0">{week}</span>
                <div className="flex-1 space-y-1">
                  {wins[week].business && <p className="text-text-secondary"><span className="text-text-tertiary">Biz:</span> {wins[week].business}</p>}
                  {wins[week].personal && <p className="text-text-secondary"><span className="text-text-tertiary">Self:</span> {wins[week].personal}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function StatCard({ label, value, sub, color }) {
  const colors = {
    blue: 'border-accent/20 bg-accent/[0.04]',
    green: 'border-success/20 bg-success/[0.04]',
    red: 'border-danger/20 bg-danger/[0.04]',
    yellow: 'border-warning/20 bg-warning/[0.04]',
  };
  const textColors = { blue: 'text-accent', green: 'text-success', red: 'text-danger', yellow: 'text-warning' };

  return (
    <div className={`p-4 rounded-lg border ${colors[color]}`}>
      <p className="text-xs text-text-tertiary mb-2 uppercase tracking-wider font-medium">{label}</p>
      <p className={`text-2xl font-semibold tracking-tight ${textColors[color]}`}>{value}</p>
      <p className="text-xs text-text-tertiary mt-1">{sub}</p>
    </div>
  );
}

function WinField({ label, value, onChange }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <label className="text-xs text-text-tertiary uppercase tracking-wider font-medium mb-2 block">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="What's your win this week?"
        rows={2}
        className="w-full bg-surface-2 border border-border rounded-lg p-3 text-sm text-text-primary placeholder-text-tertiary resize-none transition-all"
      />
    </div>
  );
}
