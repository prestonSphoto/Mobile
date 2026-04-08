import { useState } from 'react';
import { todayStr, getWeekKey, exportData } from '../hooks/useStore';

export default function HomeTab({ data, setData }) {
  const [showSettings, setShowSettings] = useState(false);
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const currentWeek = getWeekKey();
  const td = todayStr();

  const tasksDueToday = data.tasks.filter(t => !t.completed && t.dueDate === td).length;
  const totalActive = data.tasks.filter(t => !t.completed).length;
  const totalHabits = data.habits.length;
  const habitsToday = data.habits.filter(h => (h.completions[td] || 0) >= (h.targetPeriod === 'day' ? h.targetCount : 1)).length;
  const outstanding = data.invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0);
  const invoiceCount = data.invoices.filter(i => i.status !== 'paid').length;
  const pipelineVal = data.pipeline.cards.filter(c => c.column !== 'closed' && !c.lost).reduce((s, c) => s + c.value, 0);
  const dealCount = data.pipeline.cards.filter(c => !c.lost && c.column !== 'closed').length;
  const overdueCount = data.invoices.filter(i => i.status !== 'paid' && i.dueDate < td).length;
  const currentMonthKey = td.slice(0, 7);
  const monthlyRev = (data.payments || []).filter(p => p.date.startsWith(currentMonthKey)).reduce((s, p) => s + p.amount, 0);

  const wins = data.wins || {};
  const currentWins = wins[currentWeek] || { business: '', personal: '' };
  const pastWeeks = Object.keys(wins).filter(k => k !== currentWeek).sort().reverse();
  const updateWin = (field, value) => setData(d => ({ ...d, wins: { ...d.wins, [currentWeek]: { ...currentWins, [field]: value } } }));

  const upcomingTasks = data.tasks.filter(t => !t.completed).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 5);
  const atRisk = data.pipeline.cards.filter(c => !c.lost && c.health !== 'green');

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-tertiary mt-1">{dateStr}</p>
        </div>
        <button onClick={() => setShowSettings(!showSettings)}
          className="px-3 py-2 text-sm text-text-secondary bg-surface border border-border rounded-lg hover:bg-surface-2 transition-colors flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Settings
        </button>
      </div>

      {showSettings && (
        <div className="card p-4 mb-6 max-w-xs flex gap-3">
          <button onClick={exportData} className="flex-1 py-2 px-3 bg-surface-2 text-sm rounded-lg hover:bg-surface-3 transition-colors flex items-center justify-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export JSON
          </button>
          <button onClick={() => { if (confirm('Reset all data?')) { localStorage.removeItem('command_app_data'); window.location.reload(); }}}
            className="flex-1 py-2 px-3 bg-danger-soft text-danger text-sm rounded-lg hover:bg-danger/15 transition-colors">Reset Data</button>
        </div>
      )}

      {overdueCount > 0 && (
        <div className="flex items-center gap-3 p-4 mb-6 bg-danger-soft border border-danger/15 rounded-xl text-sm text-danger">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span className="font-medium">{overdueCount} overdue invoice{overdueCount > 1 ? 's' : ''} need attention</span>
        </div>
      )}

      {/* Stat Cards - 2 cols mobile, 3 cols medium, 5 cols wide */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <StatCard label="Tasks Due" value={tasksDueToday} sub={`${totalActive} active total`} color="blue" />
        <StatCard label="Habits" value={`${habitsToday}/${totalHabits}`} sub={habitsToday === totalHabits ? 'All complete' : `${totalHabits - habitsToday} remaining`} color="emerald" />
        <StatCard label="Outstanding" value={`$${outstanding.toLocaleString()}`} sub={`${invoiceCount} invoices`} color="red" />
        <StatCard label="Pipeline" value={`$${pipelineVal.toLocaleString()}`} sub={`${dealCount} active deals`} color="amber" />
        <StatCard label="Revenue" value={`$${monthlyRev.toLocaleString()}`} sub={`of $${data.monthlyGoal.toLocaleString()} goal`} color="violet" />
      </div>

      {/* 3-column content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* Upcoming Tasks */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Upcoming Tasks</h3>
          {upcomingTasks.length === 0 ? (
            <p className="text-sm text-text-tertiary py-6 text-center">No active tasks</p>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map(t => (
                <div key={t.id} className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${t.priority === 'high' ? 'bg-red-500' : t.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                  <span className="text-sm text-text-primary flex-1 truncate">{t.title}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-text-tertiary">{t.dueDate === td ? 'Today' : t.dueDate}</span>
                    {t.client && <span className="text-[11px] text-accent bg-accent-soft px-1.5 py-0.5 rounded font-medium">{t.client}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Needs Attention */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Needs Attention</h3>
          {atRisk.length === 0 ? (
            <p className="text-sm text-text-tertiary py-6 text-center">All deals healthy</p>
          ) : (
            <div className="space-y-3">
              {atRisk.map(c => (
                <div key={c.id} className="flex items-start gap-3">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${c.health === 'yellow' ? 'bg-amber-500' : 'bg-red-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-text-primary truncate">{c.name}</p>
                      <span className="text-xs text-text-tertiary flex-shrink-0">${c.value.toLocaleString()}</span>
                    </div>
                    {c.notes && <p className="text-xs text-text-tertiary mt-0.5 truncate">{c.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weekly Wins */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Weekly Wins</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-text-tertiary font-medium block mb-1.5">Business</label>
              <textarea value={currentWins.business} onChange={(e) => updateWin('business', e.target.value)}
                placeholder="What's your win?" rows={2}
                className="w-full bg-surface-2 border border-border rounded-lg p-3 text-sm placeholder-text-tertiary resize-none" />
            </div>
            <div>
              <label className="text-xs text-text-tertiary font-medium block mb-1.5">Personal</label>
              <textarea value={currentWins.personal} onChange={(e) => updateWin('personal', e.target.value)}
                placeholder="What's your win?" rows={2}
                className="w-full bg-surface-2 border border-border rounded-lg p-3 text-sm placeholder-text-tertiary resize-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Past Wins */}
      {pastWeeks.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Past Wins</h3>
          <div className="divide-y divide-border">
            {pastWeeks.slice(0, 6).map(w => (
              <div key={w} className="flex gap-6 py-3 first:pt-0 last:pb-0 text-sm">
                <span className="text-text-tertiary font-mono text-xs w-20 pt-0.5 flex-shrink-0">{w}</span>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-1">
                  {wins[w].business && <p><span className="text-text-tertiary">Biz:</span> {wins[w].business}</p>}
                  {wins[w].personal && <p><span className="text-text-tertiary">Personal:</span> {wins[w].personal}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const colorMap = {
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
  emerald: { bg: 'bg-emerald-50',  text: 'text-emerald-600',  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  red:     { bg: 'bg-red-50',     text: 'text-red-600',     icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg> },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> },
  violet:  { bg: 'bg-violet-50',  text: 'text-violet-600',  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
};

function StatCard({ label, value, sub, color }) {
  const c = colorMap[color];
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-text-secondary">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.bg} ${c.text}`}>{c.icon}</div>
      </div>
      <p className="text-xl font-bold text-text-primary">{value}</p>
      <p className="text-xs text-text-tertiary mt-1">{sub}</p>
    </div>
  );
}
