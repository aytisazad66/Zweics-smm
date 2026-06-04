import React, { useState, useRef, useEffect } from 'react';
import { useAppState } from '../context/AppContext';
import { NotificationCenter } from './NotificationCenter';
import { LanguageSelector } from './LanguageSelector';
import { Search, Command, Shield, ChevronDown, User, LogOut, Check, Menu } from 'lucide-react';

export const Topbar: React.FC = () => {
  const { 
    currentTab, 
    setSearchOpen, 
    currentUserRole, 
    setCurrentUserRole, 
    setIsLoggedIn, 
    setIs2FAVerified,
    currentLanguage, 
    showToast,
    mobileMenuOpen,
    setMobileMenuOpen
  } = useAppState();
  
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const getPageTitle = () => {
    if (currentLanguage === 'TR') {
      switch (currentTab) {
        case 'dashboard': return 'Genel Kontrol Paneli';
        case 'orders': return 'Sipariş Yönetimi';
        case 'services': return 'Hizmet & Servis Yapılandırması';
        case 'users': return 'Kullanıcı Hesapları & Bakiye';
        case 'finance': return 'Finansal Raporlar & Ödemeler';
        case 'api': return 'Provider API Bağlantıları';
        case 'tickets': return 'Müşteri Destek Merkezi';
        case 'analytics': return 'Detaylı Sistem Analitiği';
        case 'settings': return 'Sistem Ayarları';
        default: return 'Yönetim Paneli';
      }
    } else {
      switch (currentTab) {
        case 'dashboard': return 'Dashboard Overview';
        case 'orders': return 'Orders Pipeline';
        case 'services': return 'Services & Pricing';
        case 'users': return 'User Accounts Ledger';
        case 'finance': return 'Finance & Gateways';
        case 'api': return 'API Integrations';
        case 'tickets': return 'Support Helpdesk';
        case 'analytics': return 'Reports & Insights';
        case 'settings': return 'System Settings';
        default: return 'Admin Console';
      }
    }
  };

  const handleRoleChange = (role: 'Süper Admin' | 'Admin' | 'Moderatör') => {
    setCurrentUserRole(role);
    setProfileOpen(false);
    showToast(
      currentLanguage === 'TR' ? `Rol yetkisi '${role}' olarak değiştirildi.` : `Role updated to '${role}'.`,
      'success'
    );
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIs2FAVerified(false);
  };

  return (
    <header className="h-16 border-b border-white/5 bg-[#0a0a14] px-4 md:px-6 flex items-center justify-between sticky top-0 z-[1000] w-full">
      {/* Dynamically adjusted page header */}
      <div className="flex items-center gap-3">
        {/* Toggle mobile menu hamburger button */}
        <button
          id="toggle-mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 rounded-xl cursor-pointer flex items-center justify-center shrink-0"
          title="Toggle Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <h1 className="text-xs sm:text-sm md:text-base font-bold text-white tracking-wide font-sora uppercase flex items-center gap-1.5 md:gap-2">
          <span className="w-1.5 h-3 bg-gradient-to-b from-[#00D4FF] to-[#7B2FFF] rounded-full hidden sm:block" />
          <span>{getPageTitle()}</span>
        </h1>
      </div>

      {/* Utilities panel */}
      <div className="flex items-center gap-3.5">
        {/* Command palette search bar trigger */}
        <button
          id="trigger-command-palette"
          onClick={() => setSearchOpen(true)}
          className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 border border-white/10 hover:border-white/20 bg-white/5 rounded-xl text-gray-400 hover:text-white text-xs transition active:scale-95 cursor-pointer max-w-sm"
        >
          <Search className="w-3.5 h-3.5 text-[#00D4FF]" />
          <span>{currentLanguage === 'TR' ? 'Komut veya veri ara...' : 'Search command or data...'}</span>
          <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </button>

        {/* Language component */}
        <LanguageSelector />

        {/* Notifications list component */}
        <NotificationCenter />

        {/* Profile drawer & role selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="toggle-profile-dropdown"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 px-2.5 border border-white/10 hover:border-indigo-400/20 bg-white/5 rounded-xl text-gray-300 hover:text-white transition cursor-pointer active:scale-95"
          >
            <img 
              id="admin-topbar-avatar"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" 
              alt="Admin" 
              className="w-7 h-7 rounded-lg object-cover"
            />
            <div className="hidden md:block text-left">
              <p className="text-[11px] font-bold text-white leading-none">Salih M.</p>
              <span className="text-[9px] text-[#00D4FF] block mt-0.5 font-medium leading-none">{currentUserRole}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>

          {/* Role switcher list dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2.5 w-56 bg-[#131326] border border-white/10 rounded-xl shadow-2xl z-[9000] overflow-hidden animate-scale-up">
              <div className="p-3 border-b border-white/5 bg-[#181832]">
                <p className="text-xs font-bold text-white leading-none">Salih Music</p>
                <p className="text-[10px] text-gray-500 mt-1">salihmusicinc@gmail.com</p>
              </div>

              {/* Roles selection block */}
              <div className="p-2 space-y-1 bg-[#0e0e1a]">
                <div className="px-2.5 py-1 text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                  {currentLanguage === 'TR' ? 'YETKİ DEĞİŞTİR' : 'SWITCH WORKSPACE ROLE'}
                </div>
                
                {(['Süper Admin', 'Admin', 'Moderatör'] as const).map(role => (
                  <button
                    id={`btn-set-role-${role.replace(' ', '-')}`}
                    key={role}
                    onClick={() => handleRoleChange(role)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold ${currentUserRole === role ? 'bg-[#1e1e42] text-white' : 'hover:bg-white/5 text-gray-400'}`}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className={`w-3.5 h-3.5 ${currentUserRole === role ? 'text-[#00D4FF]' : 'text-gray-500'}`} />
                      <span>{role}</span>
                    </div>
                    {currentUserRole === role && (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </button>
                ))}
              </div>

              {/* Logout button */}
              <div className="p-1 border-t border-white/5 bg-[#0d0d1a]">
                <button
                  id="topbar-logout-btn"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 text-xs font-semibold rounded-lg transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{currentLanguage === 'TR' ? 'Oturumu Kapat' : 'Log Out'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
