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

  const priorityConfig = {
    high: { color: 'bg-danger', ring: 'ring-danger/20', label: 'High' },
    medium: { color: 'bg-warning', ring: 'ring-warning/20', label: 'Med' },
    low: { color: 'bg-accent', ring: 'ring-accent/20', label: 'Low' },
  };

  return (
    <div className="px-5 pt-14 pb-8 max-w-lg mx-auto">
      <h1 className="text-[28px] font-bold tracking-tight mb-6">Tasks</h1>

      {/* Sub-tab switcher */}
      <div className="flex gap-1 mb-6 bg-surface rounded-xl p-1 border border-border-subtle">
        {['today', 'backlog'].map(tab => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all duration-200 ${
              subTab === tab
                ? 'bg-surface-3 text-text-primary shadow-sm'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            {tab === 'today' ? `Today` : `Backlog`}
            <span className={`ml-1.5 text-[11px] ${subTab === tab ? 'text-accent' : 'text-text-tertiary'}`}>
              {tab === 'today' ? todayTasks.length : backlogTasks.length}
            </span>
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-2 mb-5">
        {visibleTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-tertiary">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <p className="text-text-tertiary text-[13px]">
              {subTab === 'today' ? 'Nothing due today' : 'No backlog tasks'}
            </p>
          </div>
        )}
        {visibleTasks.map(task => {
          const pc = priorityConfig[task.priority] || priorityConfig.medium;
          return (
            <div
              key={task.id}
              className="card card-glow flex items-center gap-3.5 p-4 transition-all"
              style={{
                transform: swipeState.id === task.id ? `translateX(${swipeState.offset}px)` : 'none',
                opacity: swipeState.id === task.id && Math.abs(swipeState.offset) > 80 ? 0.4 : 1,
              }}
              onTouchStart={(e) => handleTouchStart(task.id, e)}
              onTouchMove={(e) => handleTouchMove(task.id, e)}
              onTouchEnd={() => handleTouchEnd(task.id)}
            >
              <button
                onClick={() => completeTask(task.id)}
                className="w-[22px] h-[22px] rounded-lg border-2 border-border flex-shrink-0 hover:border-accent hover:bg-accent/10 transition-all duration-200 flex items-center justify-center"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`w-[7px] h-[7px] rounded-full flex-shrink-0 ${pc.color} ring-2 ${pc.ring}`} />
                  <span className="text-[14px] font-medium text-text-primary truncate">{task.title}</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5 ml-[15px]">
                  <span className="text-[11px] text-text-tertiary font-medium">{task.dueDate}</span>
                  {task.client && (
                    <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent font-medium rounded-md">{task.client}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-text-tertiary hover:text-danger p-1.5 rounded-lg hover:bg-danger-soft transition-all flex-shrink-0"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>

      {/* Completed */}
      {completedTasks.length > 0 && (
        <div className="mb-5">
          <button
            onClick={() => setShowDone(!showDone)}
            className="flex items-center gap-2 text-[12px] font-semibold text-text-tertiary mb-2.5 uppercase tracking-[0.06em]"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{ transform: showDone ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            Done ({completedTasks.length})
          </button>
          {showDone && (
            <div className="space-y-1.5">
              {completedTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl opacity-40">
                  <div className="w-[22px] h-[22px] rounded-lg bg-success/20 border-2 border-success/30 flex items-center justify-center flex-shrink-0">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#30D158" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="text-[13px] line-through text-text-tertiary">{task.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Task */}
      {showAdd ? (
        <div className="card card-glow p-4 space-y-3">
          <input
            autoFocus
            value={newTask.title}
            onChange={(e) => setNewTask(n => ({ ...n, title: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="What needs to be done?"
            className="w-full bg-transparent text-[14px] text-text-primary placeholder-text-tertiary focus:outline-none font-medium"
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask(n => ({ ...n, dueDate: e.target.value }))}
              className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-2 text-[12px] text-text-primary"
            />
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask(n => ({ ...n, priority: e.target.value }))}
              className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-[12px] text-text-primary"
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
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-[12px] text-text-primary placeholder-text-tertiary focus:outline-none"
          />
          <div className="flex gap-2 pt-1">
            <button onClick={() => setShowAdd(false)} className="flex-1 py-2 text-[13px] text-text-tertiary font-medium rounded-lg hover:bg-surface-2 transition">Cancel</button>
            <button onClick={addTask} className="flex-1 py-2 bg-accent text-white text-[13px] font-semibold rounded-lg hover:bg-accent/90 transition shadow-[0_2px_8px_rgba(0,102,255,0.3)]">Add Task</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full py-3 border border-dashed border-border rounded-2xl text-[13px] text-text-tertiary font-medium hover:border-accent/50 hover:text-accent hover:bg-accent/5 transition-all duration-200"
        >
          + Add Task
        </button>
      )}
    </div>
  );
}
