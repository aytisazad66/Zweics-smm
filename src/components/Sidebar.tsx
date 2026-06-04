import React, { useState } from 'react';
import { useAppState } from '../context/AppContext';
import { 
  Disc, 
  Briefcase, 
  Settings, 
  User, 
  CreditCard, 
  Shield, 
  MessageSquare, 
  BarChart2, 
  Sliders, 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  ShieldCheck,
  Play,
  X
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    currentTab, 
    setCurrentTab, 
    currentLanguage, 
    currentUserRole, 
    setIsLoggedIn, 
    setIs2FAVerified,
    setIsOnboardingActive,
    setOnboardingStep,
    showToast,
    mobileMenuOpen,
    setMobileMenuOpen
  } = useAppState();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', labelTR: 'Dashboard', labelEN: 'Dashboard', icon: Disc },
    { id: 'orders', labelTR: 'Siparişler', labelEN: 'Orders', icon: Briefcase },
    { id: 'services', labelTR: 'Hizmetler', labelEN: 'Services', icon: Sliders },
    { id: 'users', labelTR: 'Kullanıcılar', labelEN: 'Users', icon: User },
    { id: 'finance', labelTR: 'Ödeme / Finans', labelEN: 'Finance & Ledger', icon: CreditCard },
    { id: 'api', labelTR: 'API Yönetimi', labelEN: 'API Integration', icon: Shield },
    { id: 'tickets', labelTR: 'Destek Talepleri', labelEN: 'Support Tickets', icon: MessageSquare },
    { id: 'analytics', labelTR: 'Raporlar & Analitik', labelEN: 'Reports & Stats', icon: BarChart2 },
    { id: 'settings', labelTR: 'Ayarlar', labelEN: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIs2FAVerified(false);
    setMobileMenuOpen(false);
    showToast(currentLanguage === 'TR' ? 'Oturum güvenli bir şekilde kapatıldı.' : 'Logged out securely.', 'info');
  };

  const handleStartOnboarding = () => {
    setOnboardingStep(0);
    setIsOnboardingActive(true);
    setCurrentTab('dashboard');
    setMobileMenuOpen(false);
    showToast(currentLanguage === 'TR' ? 'Eğitim sihirbazı başlatıldı' : 'Onboarding wizard started', 'info');
  };

  return (
    <>
      {/* Mobile background overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] md:hidden transition-opacity duration-300 animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div 
        className={`bg-[#0d0d1c] border-r border-white/5 flex flex-col h-screen text-gray-400 transition-all duration-300 fixed md:relative inset-y-0 left-0 z-[2100] md:z-10 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${collapsed ? 'w-64 md:w-20' : 'w-64'}`}
      >
        {/* Brand logo header */}
        <div className="p-4 flex items-center justify-between border-b border-white/5 bg-[#0a0a14]">
          {(!collapsed || mobileMenuOpen) ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00D4FF] to-[#7B2FFF] flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 text-sm">
                SMM
              </div>
              <span className="font-bold text-base font-sora text-white flex items-center gap-1">
                <span>PRO PANEL</span>
                <span className="text-[9px] font-mono bg-indigo-900/40 text-cyan-400 px-1 py-0.5 rounded border border-indigo-700/30">v2</span>
              </span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00D4FF] to-[#7B2FFF] flex items-center justify-center font-bold text-white text-xs mx-auto">
              S
            </div>
          )}

          {/* Close menu button (mobile only) */}
          <button
            id="close-mobile-menu"
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 hover:bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Collapse arrow toggle button (desktop only) */}
          <button
            id="toggle-sidebar-collapse"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:block p-1.5 hover:bg-white/5 border border-white/10 rounded-lg text-gray-500 hover:text-white transition absolute -right-3.5 top-5 bg-[#0d0d1c] z-50 cursor-pointer shadow-md"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Interactive Tutor Tutorial Banner */}
        {(!collapsed || mobileMenuOpen) && (
          <div className="p-3.5 m-3.5 bg-[#151532] border border-[#2b2b5c] rounded-xl text-xs space-y-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full pointer-events-none" />
            <p className="font-bold text-gray-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#00D4FF]" />
              <span>{currentLanguage === 'TR' ? 'Panel Turu' : 'Interactive Tour'}</span>
            </p>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              {currentLanguage === 'TR' ? 'Panelin tüm modüllerini interaktif tur ile keşfedin.' : 'Discover all panel sections with our step-by-step assistant.'}
            </p>
            <button
              id="start-onboarding-btn"
              onClick={handleStartOnboarding}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-[#20204d] hover:bg-[#2b2b6b] text-[10px] font-bold text-[#00D4FF] rounded-lg active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{currentLanguage === 'TR' ? 'Sihirbazı Başlat' : 'Start Tutorial'}</span>
            </button>
          </div>
        )}

        {/* Navigation Links list */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {menuItems.map(item => {
            const IconComp = item.icon;
            const isActive = currentTab === item.id;
            const label = currentLanguage === 'TR' ? item.labelTR : item.labelEN;

            return (
              <button
                id={`nav-link-${item.id}`}
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-xs font-semibold relative transition group cursor-pointer ${
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-950/40 to-transparent text-white border-l-2 border-[#00D4FF]' 
                    : 'hover:bg-white/5 text-gray-400 hover:text-white border-l-2 border-transparent'
                }`}
                title={collapsed ? label : undefined}
              >
                {/* Soldan gelen ışık çizgisi & glow */}
                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-[1px] bg-cyan-400 blur-sm pointer-events-none" />
                )}
                
                <IconComp className={`w-4 h-4 ${isActive ? 'text-[#00D4FF]' : 'text-gray-500 group-hover:text-gray-300'}`} />
                
                {(!collapsed || mobileMenuOpen) && (
                  <span className="flex-1 text-left tracking-wide">{label}</span>
                )}
                
                {(!collapsed || mobileMenuOpen) && isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User profile bottom badge */}
        <div className="p-3.5 border-t border-white/5 bg-[#0a0a14] space-y-3">
          <div className={`flex items-center gap-3 ${collapsed && !mobileMenuOpen ? 'justify-center' : ''}`}>
            <div className="relative">
              <img 
                id="admin-sidebar-avatar"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" 
                alt="Admin" 
                className="w-10 h-10 rounded-xl object-cover border border-[#7B2FFF]/30 shadow-md shadow-purple-950/10"
              />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-[#0d0d1c] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0d0d1c] animate-ping" />
              </div>
            </div>
            
            {(!collapsed || mobileMenuOpen) && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white leading-none">Salih Music</p>
                <span className="text-[9px] font-semibold text-cyan-400 mt-1 block uppercase tracking-wider">{currentUserRole}</span>
              </div>
            )}
          </div>

          {(!collapsed || mobileMenuOpen) && (
            <button
              id="sidebar-logout-btn"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 border border-rose-900/30 hover:border-rose-700/50 hover:bg-rose-950/20 text-rose-400 hover:text-rose-300 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{currentLanguage === 'TR' ? 'Güvenli Çıkış' : 'Disconnect'}</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};
