import { useState, useCallback } from 'react';

const STORAGE_KEY = 'command_app_data';

function getWeekKey(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dayNum = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - dayNum);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

const defaultData = () => ({
  tasks: [
    { id: '1', title: 'Review client proposals', dueDate: todayStr(), priority: 'high', client: 'Rocket', completed: false, completedAt: null },
    { id: '2', title: 'Send content calendar', dueDate: todayStr(), priority: 'medium', client: 'Hugga Retreats', completed: false, completedAt: null },
    { id: '3', title: 'Storyboard video shoot', dueDate: '2026-04-10', priority: 'low', client: '', completed: false, completedAt: null },
  ],
  habits: [
    { id: 'h1', name: 'Cold Emails Sent', category: 'business', targetCount: 10, targetPeriod: 'day', completions: {} },
    { id: 'h2', name: 'Content Posted', category: 'business', targetCount: 1, targetPeriod: 'day', completions: {} },
    { id: 'h3', name: 'Client Touchpoints', category: 'business', targetCount: 3, targetPeriod: 'week', completions: {} },
    { id: 'h4', name: 'Gym', category: 'personal', targetCount: 5, targetPeriod: 'week', completions: {} },
    { id: 'h5', name: 'Reading', category: 'personal', targetCount: 1, targetPeriod: 'day', completions: {} },
  ],
  pipeline: {
    columns: ['prospecting', 'proposal', 'active', 'closed'],
    cards: [
      { id: 'p1', name: 'Rocket', projectType: 'Video Retainer', value: 5000, followUp: '2026-04-10', health: 'green', notes: '', column: 'active', lost: false, lossReason: '' },
      { id: 'p2', name: 'Hugga Retreats', projectType: 'Content Retainer', value: 3500, followUp: '2026-04-08', health: 'yellow', notes: 'May calendar due April 25 — not started', column: 'active', lost: false, lossReason: '' },
      { id: 'p3', name: 'Comprehensive Dentistry of Troy', projectType: 'Video Production', value: 4500, followUp: '2026-04-15', health: 'green', notes: '', column: 'active', lost: false, lossReason: '' },
    ],
  },
  invoices: [
    { id: 'inv1', client: 'Hugga Retreats', amount: 3500, dueDate: '2026-04-15', status: 'sent' },
  ],
  payments: [],
  monthlyGoal: 10000,
  wins: {},
  settings: {},
});

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const defaults = defaultData();
      return { ...defaults, ...parsed, pipeline: { ...defaults.pipeline, ...parsed.pipeline } };
    }
  } catch (e) {
    console.error('Failed to load data:', e);
  }
  return defaultData();
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

export function useStore() {
  const [data, setDataRaw] = useState(loadData);

  const setData = useCallback((updater) => {
    setDataRaw((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveData(next);
      return next;
    });
  }, []);

  return [data, setData];
}

export function exportData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const blob = new Blob([raw || '{}'], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `command-backup-${todayStr()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export { getWeekKey, todayStr };
