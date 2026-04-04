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
    <div className="noise h-full flex flex-col bg-bg">
      <main className="flex-1 overflow-y-auto pb-24">
        {renderTab()}
      </main>

      {/* Premium bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
        <div className="mx-3 mb-3">
          <div className="flex justify-around items-center h-16 max-w-md mx-auto bg-surface/80 backdrop-blur-2xl rounded-2xl border border-border shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.03)_inset]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex flex-col items-center gap-1 px-4 py-2 transition-all duration-300"
                >
                  {active && (
                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-accent rounded-full shadow-[0_0_8px_rgba(0,102,255,0.6)]" />
                  )}
                  <Icon size={20} active={active} />
                  <span className={`text-[10px] font-semibold tracking-wide transition-colors duration-300 ${
                    active ? 'text-accent' : 'text-text-tertiary'
                  }`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

function HomeIcon({ size, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.5} strokeLinecap="round" strokeLinejoin="round" className={`transition-colors duration-300 ${active ? 'text-accent' : 'text-text-tertiary'}`}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      {!active && <polyline points="9 22 9 12 15 12 15 22" />}
    </svg>
  );
}

function TasksIcon({ size, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round" className={`transition-colors duration-300 ${active ? 'text-accent' : 'text-text-tertiary'}`}>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function HabitsIcon({ size, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round" className={`transition-colors duration-300 ${active ? 'text-accent' : 'text-text-tertiary'}`}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function PipelineIcon({ size, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round" className={`transition-colors duration-300 ${active ? 'text-accent' : 'text-text-tertiary'}`}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}

function MoneyIcon({ size, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round" className={`transition-colors duration-300 ${active ? 'text-accent' : 'text-text-tertiary'}`}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
