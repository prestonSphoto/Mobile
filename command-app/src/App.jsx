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
    <div className="noise h-full bg-bg flex items-center justify-center">
      {/* Desktop: device frame / Mobile: full screen */}
      <div className="relative w-full h-full md:w-[430px] md:h-[932px] md:max-h-[calc(100vh-40px)] md:rounded-[44px] md:border-[3px] md:border-[#2A2A2A] md:shadow-[0_0_0_1px_#1A1A1A,0_25px_80px_rgba(0,0,0,0.6),0_0_120px_rgba(0,102,255,0.04)] md:overflow-hidden flex flex-col bg-bg">

        {/* Status bar - desktop frame only */}
        <div className="hidden md:flex items-center justify-between px-8 pt-3 pb-1">
          <span className="text-[12px] font-semibold text-text-secondary">
            {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </span>
          <div className="w-[100px] h-[28px] bg-black rounded-full" />
          <div className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-text-secondary"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
            <svg width="16" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-text-secondary"><rect x="1" y="6" width="18" height="12" rx="2"/><rect x="20" y="9" width="3" height="6" rx="1"/><rect x="3" y="8" width="10" height="8" rx="1" className="text-success"/></svg>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto pb-24 md:pb-20">
          {renderTab()}
        </main>

        {/* Bottom nav */}
        <nav className="absolute bottom-0 left-0 right-0 z-50 safe-bottom">
          <div className="mx-3 mb-3 md:mx-4 md:mb-5">
            <div className="flex justify-around items-center h-16 bg-surface/80 backdrop-blur-2xl rounded-2xl border border-border shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.03)_inset]">
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

      {/* Desktop branding */}
      <div className="hidden md:block fixed bottom-6 left-8">
        <p className="text-text-tertiary text-[13px] font-semibold tracking-tight">Command</p>
        <p className="text-text-tertiary/40 text-[11px]">Creative Studio Ops</p>
      </div>
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
