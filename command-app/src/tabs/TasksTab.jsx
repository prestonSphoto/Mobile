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
    const task = {
      id: Date.now().toString(),
      ...newTask,
      title: newTask.title.trim(),
      completed: false,
      completedAt: null,
    };
    setData(d => ({ ...d, tasks: [...d.tasks, task] }));
    setNewTask({ title: '', dueDate: todayStr(), priority: 'medium', client: '' });
    setShowAdd(false);
  };

  const completeTask = (id) => {
    setData(d => ({
      ...d,
      tasks: d.tasks.map(t => t.id === id ? { ...t, completed: true, completedAt: new Date().toISOString() } : t)
    }));
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
    const diff = e.touches[0].clientX - swipeState.startX;
    setSwipeState(s => ({ ...s, offset: diff }));
  };

  const handleTouchEnd = (id) => {
    clearTimeout(longPressTimer.current);
    if (swipeState.id === id && Math.abs(swipeState.offset) > 100) {
      deleteTask(id);
    }
    setSwipeState({ id: null, startX: 0, offset: 0 });
  };

  const priorityColor = (p) => {
    switch (p) {
      case 'high': return 'bg-danger';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-accent';
      default: return 'bg-text-secondary';
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold tracking-tight mb-4">Tasks</h1>

      <div className="flex gap-1 mb-4 bg-surface rounded p-0.5">
        {['today', 'backlog'].map(tab => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`flex-1 py-1.5 text-sm font-medium rounded transition ${
              subTab === tab ? 'bg-surface-2 text-white' : 'text-text-secondary'
            }`}
          >
            {tab === 'today' ? `Today (${todayTasks.length})` : `Backlog (${backlogTasks.length})`}
          </button>
        ))}
      </div>

      <div className="space-y-2 mb-4">
        {visibleTasks.length === 0 && (
          <p className="text-text-secondary text-sm py-8 text-center">
            {subTab === 'today' ? 'Nothing due today' : 'No backlog tasks'}
          </p>
        )}
        {visibleTasks.map(task => (
          <div
            key={task.id}
            className="flex items-center gap-3 p-3 bg-surface border border-border rounded transition-transform"
            style={{
              transform: swipeState.id === task.id ? `translateX(${swipeState.offset}px)` : 'none',
              opacity: swipeState.id === task.id && Math.abs(swipeState.offset) > 80 ? 0.5 : 1,
            }}
            onTouchStart={(e) => handleTouchStart(task.id, e)}
            onTouchMove={(e) => handleTouchMove(task.id, e)}
            onTouchEnd={() => handleTouchEnd(task.id)}
          >
            <button
              onClick={() => completeTask(task.id)}
              className="w-5 h-5 rounded border-2 border-border flex-shrink-0 hover:border-accent transition flex items-center justify-center"
            >
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityColor(task.priority)}`} />
                <span className="text-sm font-medium truncate">{task.title}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-text-secondary">{task.dueDate}</span>
                {task.client && <span className="text-xs px-1.5 py-0.5 bg-accent-dim text-accent rounded">{task.client}</span>}
              </div>
            </div>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-text-secondary hover:text-danger p-1 flex-shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {completedTasks.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowDone(!showDone)}
            className="flex items-center gap-2 text-sm text-text-secondary mb-2"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ transform: showDone ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            Done ({completedTasks.length})
          </button>
          {showDone && (
            <div className="space-y-1">
              {completedTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-2.5 opacity-50">
                  <div className="w-5 h-5 rounded border-2 border-success bg-success/20 flex items-center justify-center flex-shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#30D158" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="text-sm line-through text-text-secondary">{task.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showAdd ? (
        <div className="p-3 bg-surface border border-border rounded space-y-3">
          <input
            autoFocus
            value={newTask.title}
            onChange={(e) => setNewTask(n => ({ ...n, title: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="Task title..."
            className="w-full bg-transparent text-sm text-white placeholder-text-secondary/50 focus:outline-none"
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask(n => ({ ...n, dueDate: e.target.value }))}
              className="flex-1 bg-surface-2 border border-border rounded px-2 py-1 text-xs text-white"
            />
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask(n => ({ ...n, priority: e.target.value }))}
              className="bg-surface-2 border border-border rounded px-2 py-1 text-xs text-white"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <input
            value={newTask.client}
            onChange={(e) => setNewTask(n => ({ ...n, client: e.target.value }))}
            placeholder="Client (optional)"
            className="w-full bg-surface-2 border border-border rounded px-2 py-1.5 text-xs text-white placeholder-text-secondary/50 focus:outline-none"
          />
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(false)} className="flex-1 py-1.5 text-sm text-text-secondary">Cancel</button>
            <button onClick={addTask} className="flex-1 py-1.5 bg-accent text-white text-sm font-medium rounded">Add</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full py-2.5 border border-dashed border-border rounded text-sm text-text-secondary hover:border-accent hover:text-accent transition"
        >
          + Add Task
        </button>
      )}
    </div>
  );
}
