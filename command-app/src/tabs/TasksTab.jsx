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
  const activeTasks = data.tasks.filter(t => !t.completed);
  const completedTasks = data.tasks.filter(t => t.completed);
  const todayTasks = activeTasks.filter(t => t.dueDate <= today);
  const backlogTasks = activeTasks.filter(t => t.dueDate > today);
  const visibleTasks = subTab === 'today' ? todayTasks : backlogTasks;

  const addTask = () => {
    if (!newTask.title.trim()) return;
    setData(d => ({ ...d, tasks: [...d.tasks, { id: Date.now().toString(), ...newTask, title: newTask.title.trim(), completed: false, completedAt: null }] }));
    setNewTask({ title: '', dueDate: todayStr(), priority: 'medium', client: '' });
    setShowAdd(false);
  };

  const completeTask = (id) => {
    setData(d => ({ ...d, tasks: d.tasks.map(t => t.id === id ? { ...t, completed: true, completedAt: new Date().toISOString() } : t) }));
  };

  const deleteTask = (id) => {
    setData(d => ({ ...d, tasks: d.tasks.filter(t => t.id !== id) }));
    setSwipeState({ id: null, startX: 0, offset: 0 });
  };

  const handleTouchStart = (id, e) => {
    const x = e.touches[0].clientX;
    setSwipeState({ id, startX: x, offset: 0 });
    longPressTimer.current = setTimeout(() => deleteTask(id), 600);
  };
  const handleTouchMove = (id, e) => {
    clearTimeout(longPressTimer.current);
    if (swipeState.id !== id) return;
    setSwipeState(s => ({ ...s, offset: e.touches[0].clientX - swipeState.startX }));
  };
  const handleTouchEnd = (id) => {
    clearTimeout(longPressTimer.current);
    if (swipeState.id === id && Math.abs(swipeState.offset) > 100) deleteTask(id);
    setSwipeState({ id: null, startX: 0, offset: 0 });
  };

  const prColors = { high: 'bg-danger', medium: 'bg-warning', low: 'bg-accent' };

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Tasks</h1>
        <button onClick={() => setShowAdd(true)} className="px-3 py-1.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors">
          + Add task
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-4 mb-6 border-b border-border">
        {[['today', `Today (${todayTasks.length})`], ['backlog', `Backlog (${backlogTasks.length})`]].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setSubTab(id)}
            className={`pb-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              subTab === id ? 'border-accent text-text-primary' : 'border-transparent text-text-tertiary hover:text-text-secondary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-surface border border-border rounded-lg p-4 mb-4 space-y-3">
          <input
            autoFocus
            value={newTask.title}
            onChange={(e) => setNewTask(n => ({ ...n, title: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="What needs to be done?"
            className="w-full bg-transparent text-sm font-medium text-text-primary placeholder-text-tertiary focus:outline-none"
          />
          <div className="flex flex-wrap gap-2">
            <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask(n => ({ ...n, dueDate: e.target.value }))}
              className="bg-surface-2 border border-border rounded-md px-3 py-1.5 text-xs text-text-primary" />
            <select value={newTask.priority} onChange={(e) => setNewTask(n => ({ ...n, priority: e.target.value }))}
              className="bg-surface-2 border border-border rounded-md px-3 py-1.5 text-xs text-text-primary">
              <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
            </select>
            <input value={newTask.client} onChange={(e) => setNewTask(n => ({ ...n, client: e.target.value }))} placeholder="Client"
              className="bg-surface-2 border border-border rounded-md px-3 py-1.5 text-xs text-text-primary placeholder-text-tertiary flex-1 min-w-[100px]" />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-sm text-text-tertiary hover:text-text-secondary transition-colors">Cancel</button>
            <button onClick={addTask} className="px-4 py-1.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors">Add</button>
          </div>
        </div>
      )}

      {/* Tasks */}
      <div className="space-y-1">
        {visibleTasks.length === 0 && (
          <p className="text-text-tertiary text-sm py-12 text-center">{subTab === 'today' ? 'Nothing due today. Nice.' : 'No backlog tasks.'}</p>
        )}
        {visibleTasks.map(task => (
          <div
            key={task.id}
            className="group flex items-center gap-3 py-3 px-3 -mx-3 rounded-lg hover:bg-surface transition-colors"
            style={{
              transform: swipeState.id === task.id ? `translateX(${swipeState.offset}px)` : 'none',
              opacity: swipeState.id === task.id && Math.abs(swipeState.offset) > 80 ? 0.4 : 1,
            }}
            onTouchStart={(e) => handleTouchStart(task.id, e)}
            onTouchMove={(e) => handleTouchMove(task.id, e)}
            onTouchEnd={() => handleTouchEnd(task.id)}
          >
            <button onClick={() => completeTask(task.id)}
              className="w-[18px] h-[18px] rounded-[5px] border-[1.5px] border-text-tertiary/50 flex-shrink-0 hover:border-accent hover:bg-accent/10 transition-colors" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${prColors[task.priority]}`} />
                <span className="text-sm font-medium text-text-primary truncate">{task.title}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 ml-[14px]">
                <span className="text-xs text-text-tertiary">{task.dueDate}</span>
                {task.client && <span className="text-xs px-1.5 py-0.5 bg-accent/10 text-accent rounded font-medium">{task.client}</span>}
              </div>
            </div>
            <button onClick={() => deleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-danger p-1 transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        ))}
      </div>

      {/* Completed */}
      {completedTasks.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <button onClick={() => setShowDone(!showDone)} className="flex items-center gap-2 text-xs text-text-tertiary font-medium uppercase tracking-wider mb-2">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: showDone ? 'rotate(90deg)' : '', transition: 'transform 0.15s' }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
            Completed ({completedTasks.length})
          </button>
          {showDone && completedTasks.map(task => (
            <div key={task.id} className="flex items-center gap-3 py-2 px-3 -mx-3 opacity-40">
              <div className="w-[18px] h-[18px] rounded-[5px] bg-success/20 border-[1.5px] border-success/40 flex items-center justify-center flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span className="text-sm line-through text-text-tertiary">{task.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
