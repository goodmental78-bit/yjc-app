
import React from 'react';
import { ViewState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewState;
  onNavigate: (view: ViewState) => void;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate, title = "목자훈련" }) => {
  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-white/50 relative shadow-2xl overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-[-10%] right-[-20%] w-80 h-80 bg-blue-100 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] left-[-20%] w-60 h-60 bg-indigo-50 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-[100] bg-white/60 backdrop-blur-xl border-b border-white/20 px-6 py-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
           <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">✝</div>
           <h1 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h1>
        </div>
        {activeView !== 'HOME' && (
          <button 
            onClick={() => onNavigate('HOME')}
            className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
          >
            HOME
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Navigation Bar (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-2xl border-t border-gray-100 px-3 py-4 flex justify-around safe-area-bottom z-[100] shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.05)]">
        <NavButton 
          active={activeView === 'HOME'} 
          onClick={() => onNavigate('HOME')} 
          icon="🏠" 
          label="홈" 
        />
        <NavButton 
          active={activeView === 'VIDEO'} 
          onClick={() => onNavigate('VIDEO')} 
          icon="🎥" 
          label="강의" 
        />
        <NavButton 
          active={activeView === 'PODCAST'} 
          onClick={() => onNavigate('PODCAST')} 
          icon="🎙️" 
          label="대담" 
        />
        <NavButton 
          active={activeView === 'TEXTBOOK'} 
          onClick={() => onNavigate('TEXTBOOK')} 
          icon="📖" 
          label="교재" 
        />
        <NavButton 
          active={activeView === 'QUIZ'} 
          onClick={() => onNavigate('QUIZ')} 
          icon="📝" 
          label="평가" 
        />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative ${active ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
  >
    {active && <span className="absolute -top-1 w-1 h-1 bg-indigo-600 rounded-full"></span>}
    <span className="text-xl">{icon}</span>
    <span className={`text-[9px] font-bold tracking-tighter ${active ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
  </button>
);

export default Layout;