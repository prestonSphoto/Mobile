import { useState } from 'react';
import { useStore } from './hooks/useStore';
import HomeTab from './tabs/HomeTab';
import TasksTab from './tabs/TasksTab';
import HabitsTab from './tabs/HabitsTab';
import PipelineTab from './tabs/PipelineTab';
import MoneyTab from './tabs/MoneyTab';

const tabs = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'tasks', label: 'Tasks', icon: TasksIcon },
  { id: 'habits', label: 'Habits', icon: HabitsIcon },
  { id: 'pipeline', label: 'Pipeline', icon: PipelineIcon },
  { id: 'money', label: 'Money', icon: MoneyIcon },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [data, setData] = useStore();

  const renderTab = () => {
    switch (activeTab) {
      case 'home': return <HomeTab data={data} setData={setData} />;
      case 'tasks': return <TasksTab data={data} setData={setData} />;
      case 'habits': return <HabitsTab data={data} setData={setData} />;
      case 'pipeline': return <PipelineTab data={data} setData={setData} />;
      case 'money': return <MoneyTab data={data} setData={setData} />;
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-bg">
      <main className="flex-1 overflow-y-auto pb-20">
        {renderTab()}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-bg/95 backdrop-blur-md border-t border-border z-50 safe-area-bottom">
        <div className="flex justify-around items-center h-14 max-w-lg mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                  active ? 'text-accent' : 'text-text-secondary'
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function HomeIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function TasksIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function HabitsIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function PipelineIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function MoneyIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
