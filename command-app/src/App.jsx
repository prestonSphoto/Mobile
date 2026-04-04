import { useState } from 'react';
import { useStore } from './hooks/useStore';
import HomeTab from './tabs/HomeTab';
import TasksTab from './tabs/TasksTab';
import HabitsTab from './tabs/HabitsTab';
import PipelineTab from './tabs/PipelineTab';
import MoneyTab from './tabs/MoneyTab';

const tabs = [
  { id: 'home', label: 'Dashboard', icon: HomeIcon },
  { id: 'tasks', label: 'Tasks', icon: TasksIcon },
  { id: 'habits', label: 'Habits', icon: HabitsIcon },
  { id: 'pipeline', label: 'Pipeline', icon: PipelineIcon },
  { id: 'money', label: 'Finances', icon: MoneyIcon },
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
    <div className="h-full bg-bg flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-[250px] h-full bg-sidebar border-r border-border flex-shrink-0">
        <div className="px-6 pt-7 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-sm">
              <span className="text-white text-lg font-bold">C</span>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-text-primary leading-tight">Command</p>
              <p className="text-[12px] text-text-tertiary">Studio Dashboard</p>
            </div>
          </div>
        </div>

        <p className="px-6 text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">General</p>
        <nav className="flex-1 px-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all mb-0.5 ${
                  active
                    ? 'bg-accent text-white shadow-sm shadow-accent/25'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                }`}
              >
                <Icon size={18} active={active} />
                <span className="text-[13px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 m-3 mb-4 bg-accent-soft rounded-xl">
          <p className="text-[13px] font-semibold text-text-primary mb-1">Command v1.0</p>
          <p className="text-[11px] text-text-secondary mb-0">Creative Studio Ops</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {renderTab()}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border safe-bottom">
        <div className="flex justify-around items-center h-14">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 ${active ? 'text-accent' : 'text-text-tertiary'}`}>
                <Icon size={18} active={active} mobile />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function HomeIcon({ size, active, mobile }) {
  const color = mobile ? (active ? 'text-accent' : 'text-text-tertiary') : '';
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={color}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
}
function TasksIcon({ size, active, mobile }) {
  const color = mobile ? (active ? 'text-accent' : 'text-text-tertiary') : '';
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={color}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
}
function HabitsIcon({ size, active, mobile }) {
  const color = mobile ? (active ? 'text-accent' : 'text-text-tertiary') : '';
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={color}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
}
function PipelineIcon({ size, active, mobile }) {
  const color = mobile ? (active ? 'text-accent' : 'text-text-tertiary') : '';
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={color}><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>;
}
function MoneyIcon({ size, active, mobile }) {
  const color = mobile ? (active ? 'text-accent' : 'text-text-tertiary') : '';
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={color}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
}
