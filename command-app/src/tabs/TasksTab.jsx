import { useState, useRef } from 'react';
import { todayStr } from '../hooks/useStore';

export default function TasksTab({ data, setData }) {
  const [subTab, setSubTab] = useState('today');
  const [showAdd, setShowAdd] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', dueDate: todayStr(), priority: 'medium', client: '' });
  const longPressTimer = useRef(null);
  const [swipeState, setSwipeState] = useState({ id: null, startX: 0, offset: 0 });

  const today = todayStr();
  const active = data.tasks.filter(t => !t.completed);
  const completed = data.tasks.filter(t => t.completed);
  const todayTasks = active.filter(t => t.dueDate <= today);
  const backlog = active.filter(t => t.dueDate > today);
  const visible = subTab === 'today' ? todayTasks : backlog;

  const addTask = () => {
    if (!newTask.title.trim()) return;
    setData(d => ({ ...d, tasks: [...d.tasks, { id: Date.now().toString(), ...newTask, title: newTask.title.trim(), completed: false, completedAt: null }] }));
    setNewTask({ title: '', dueDate: todayStr(), priority: 'medium', client: '' });
    setShowAdd(false);
  };
  const complete = (id) => setData(d => ({ ...d, tasks: d.tasks.map(t => t.id === id ? { ...t, completed: true, completedAt: new Date().toISOString() } : t) }));
  const del = (id) => { setData(d => ({ ...d, tasks: d.tasks.filter(t => t.id !== id) })); setSwipeState({ id: null, startX: 0, offset: 0 }); };

  const handleTouchStart = (id, e) => { setSwipeState({ id, startX: e.touches[0].clientX, offset: 0 }); longPressTimer.current = setTimeout(() => del(id), 600); };
  const handleTouchMove = (id, e) => { clearTimeout(longPressTimer.current); if (swipeState.id === id) setSwipeState(s => ({ ...s, offset: e.touches[0].clientX - s.startX })); };
  const handleTouchEnd = (id) => { clearTimeout(longPressTimer.current); if (swipeState.id === id && Math.abs(swipeState.offset) > 100) del(id); setSwipeState({ id: null, startX: 0, offset: 0 }); };

  const prLabel = { high: 'High', medium: 'Med', low: 'Low' };
  const prColor = { high: 'text-red-600 bg-red-50', medium: 'text-amber-600 bg-amber-50', low: 'text-blue-600 bg-blue-50' };
  const prDot = { high: 'bg-red-500', medium: 'bg-amber-500', low: 'bg-blue-500' };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <h1 className="text-[26px] font-semibold tracking-tight">Tasks</h1>
          <div className="flex bg-surface border border-border rounded-lg p-0.5">
            {[['today', `Today (${todayTasks.length})`], ['backlog', `Backlog (${backlog.length})`]].map(([id, label]) => (
              <button key={id} onClick={() => setSubTab(id)}
                className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors ${subTab === id ? 'bg-surface-2 text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-secondary'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors shadow-sm shadow-accent/20 flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add task
        </button>
      </div>

      {showAdd && (
        <div className="card p-5 mb-5">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-text-secondary font-medium block mb-1.5">Task title</label>
              <input autoFocus value={newTask.title} onChange={(e) => setNewTask(n => ({ ...n, title: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && addTask()} placeholder="What needs to be done?"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm placeholder-text-tertiary" />
            </div>
            <div>
              <label className="text-xs text-text-secondary font-medium block mb-1.5">Due date</label>
              <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask(n => ({ ...n, dueDate: e.target.value }))}
                className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-text-secondary font-medium block mb-1.5">Priority</label>
              <select value={newTask.priority} onChange={(e) => setNewTask(n => ({ ...n, priority: e.target.value }))}
                className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm">
                <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-text-secondary font-medium block mb-1.5">Client</label>
              <input value={newTask.client} onChange={(e) => setNewTask(n => ({ ...n, client: e.target.value }))} placeholder="Optional"
                className="w-32 bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm placeholder-text-tertiary" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary border border-border rounded-lg hover:bg-surface-2 transition-colors">Cancel</button>
              <button onClick={addTask} className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg shadow-sm">Add task</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-2/50 border-b border-border">
              <th className="text-left py-3 px-5 w-10"></th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Task</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider w-28">Due Date</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider w-24">Priority</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider w-28">Client</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-sm text-text-tertiary">{subTab === 'today' ? 'Nothing due today. Nice work!' : 'No backlog tasks.'}</td></tr>}
            {visible.map(task => (
              <tr key={task.id} className="group border-b border-border last:border-0 hover:bg-surface-2/30 transition-colors"
                style={{ transform: swipeState.id === task.id ? `translateX(${swipeState.offset}px)` : '', opacity: swipeState.id === task.id && Math.abs(swipeState.offset) > 80 ? 0.4 : 1 }}
                onTouchStart={(e) => handleTouchStart(task.id, e)} onTouchMove={(e) => handleTouchMove(task.id, e)} onTouchEnd={() => handleTouchEnd(task.id)}>
                <td className="py-3 px-5">
                  <button onClick={() => complete(task.id)} className="w-[18px] h-[18px] rounded-md border-2 border-gray-300 hover:border-accent hover:bg-accent-soft transition-colors" />
                </td>
                <td className="py-3 px-4 text-sm font-medium text-text-primary">{task.title}</td>
                <td className="py-3 px-4 text-sm text-text-secondary">{task.dueDate === today ? <span className="text-accent font-medium">Today</span> : task.dueDate}</td>
                <td className="py-3 px-4"><span className={`text-[11px] font-semibold px-2 py-1 rounded-md ${prColor[task.priority]}`}>{prLabel[task.priority]}</span></td>
                <td className="py-3 px-4 text-sm text-text-secondary">{task.client || <span className="text-text-tertiary">—</span>}</td>
                <td className="py-3 px-4">
                  <button onClick={() => del(task.id)} className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-danger p-1 transition-all rounded-md hover:bg-danger-soft">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {completed.length > 0 && (
        <div className="mt-6">
          <button onClick={() => setShowDone(!showDone)} className="flex items-center gap-2 text-xs text-text-tertiary font-semibold uppercase tracking-wider mb-3 hover:text-text-secondary transition-colors">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: showDone ? 'rotate(90deg)' : '', transition: 'transform 0.15s' }}>
              <polyline points="9 18 15 12 9 6" /></svg>
            Completed ({completed.length})
          </button>
          {showDone && (
            <div className="card overflow-hidden">
              <table className="w-full"><tbody>
                {completed.map(task => (
                  <tr key={task.id} className="border-b border-border last:border-0 opacity-50">
                    <td className="py-2.5 px-5 w-10">
                      <div className="w-[18px] h-[18px] rounded-md bg-success/20 border-2 border-success/40 flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-sm line-through text-text-tertiary">{task.title}</td>
                    <td className="py-2.5 px-4 text-xs text-text-tertiary">{task.dueDate}</td>
                    <td className="py-2.5 px-4 text-xs text-text-tertiary">{task.client}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
