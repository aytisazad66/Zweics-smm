import React, { useEffect, useRef } from 'react';
import { AppProvider, useAppState } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { OnboardingWizard } from './components/OnboardingWizard';
import { CommandPalette } from './components/CommandPalette';

// Pages
import { Landing } from './pages/Landing';
import { ClientDashboard } from './pages/ClientDashboard';
import { Login } from './pages/Login';
import { TwoFactor } from './pages/TwoFactor';
import { Dashboard } from './pages/Dashboard';
import { Orders } from './pages/Orders';
import { Services } from './pages/Services';
import { Users } from './pages/Users';
import { Finance } from './pages/Finance';
import { ApiConfig } from './pages/ApiConfig';
import { Tickets } from './pages/Tickets';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';

const AppContent: React.FC = () => {
  const { 
    isLoggedIn, 
    is2FAVerified, 
    currentTab,
    setCurrentTab,
    toastMsg,
    portalMode,
    setPortalMode,
    clientLoggedIn,
    currentLanguage,
    isServerSynced
  } = useAppState();

  // ── Browser history sync ──────────────────────────────────────────────────
  // The app uses React state navigation (no URL changes), so the browser's
  // back button has nothing to go back to inside the app. We fix this by
  // pushing a history entry on every navigation change and restoring state
  // on popstate (back/forward button press).

  const historyReady = useRef(false);
  const suppressNextPush = useRef(false);

  // Sync state → browser history
  useEffect(() => {
    if (!historyReady.current) {
      // First run: replace the initial browser entry so we always have state
      historyReady.current = true;
      window.history.replaceState({ portalMode, currentTab }, '');
      return;
    }
    if (suppressNextPush.current) {
      suppressNextPush.current = false;
      return;
    }
    window.history.pushState({ portalMode, currentTab }, '');
  }, [portalMode, currentTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Browser history → state (back / forward buttons)
  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      const s = e.state as { portalMode?: string; currentTab?: string } | null;
      if (!s?.portalMode) return;
      suppressNextPush.current = true;
      setPortalMode(s.portalMode as 'landing' | 'client' | 'admin');
      if (s.currentTab) setCurrentTab(s.currentTab);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [setPortalMode, setCurrentTab]);
  // ─────────────────────────────────────────────────────────────────────────

  // ── Gizli Admin Erişimi ───────────────────────────────────────────────────
  // YOL 1 — URL hash: tarayıcıya "#bm-yonetici" yazılınca admin login açılır.
  // YOL 2 — Gizli klavye dizisi: herhangi bir sayfada "boradmin" yazılınca
  //          aynı etkiyi yapar (mobil için hash yeterli).
  // Yönetici butonları müşteri panelinden tamamen kaldırıldı.
  const SECRET_HASH     = 'bm-yonetici';
  const SECRET_SEQUENCE = 'boradmin';
  const keyBuffer       = useRef('');

  // URL hash kontrolü — sayfa açılışında ve hash değiştiğinde
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === `#${SECRET_HASH}`) {
        // Hash'i temizle (URL'de görünmesin)
        window.history.replaceState(null, '', window.location.pathname);
        setPortalMode('admin');
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, [setPortalMode]);

  // Klavye dizisi dinleyicisi
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Input/textarea içindeyken tetiklemesin
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      keyBuffer.current = (keyBuffer.current + e.key).slice(-SECRET_SEQUENCE.length);
      if (keyBuffer.current === SECRET_SEQUENCE) {
        keyBuffer.current = '';
        setPortalMode('admin');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setPortalMode]);
  // ─────────────────────────────────────────────────────────────────────────

  if (!isServerSynced) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00D4FF] to-[#7B2FFF] flex items-center justify-center font-bold text-white text-lg shadow-xl shadow-cyan-400/20 animate-pulse">
          SMM
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-500 font-medium">Sistem yükleniyor...</span>
        </div>
      </div>
    );
  }

  // Active page router matrix for admin area
  const renderActiveAdminPage = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'orders':
        return <Orders />;
      case 'services':
        return <Services />;
      case 'users':
        return <Users />;
      case 'finance':
        return <Finance />;
      case 'api':
        return <ApiConfig />;
      case 'tickets':
        return <Tickets />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const renderPortal = () => {
    if (portalMode === 'landing') {
      return <Landing />;
    }

    if (portalMode === 'client') {
      if (!clientLoggedIn) {
        return <Landing />;
      }
      return <ClientDashboard />;
    }

    // Admin flow
    if (!isLoggedIn) {
      return (
        <div className="relative w-full h-full min-h-screen">
          <Login />
          <button 
            onClick={() => setPortalMode('landing')}
            className="fixed top-4 left-4 z-50 px-4 py-2.5 text-xs font-bold rounded-xl bg-white/5 border border-white/10 hover:bg-[#15152c] text-gray-300 hover:text-white transition duration-200 cursor-pointer shadow-lg"
          >
            ← {currentLanguage === 'TR' ? 'Anasayfaya Dön' : 'Back to Home'}
          </button>
        </div>
      );
    }

    if (!is2FAVerified) {
      return (
        <div className="relative w-full h-full min-h-screen">
          <TwoFactor />
          <button 
            onClick={() => setPortalMode('landing')}
            className="fixed top-4 left-4 z-50 px-4 py-2.5 text-xs font-bold rounded-xl bg-white/5 border border-white/10 hover:bg-[#15152c] text-gray-300 hover:text-white transition duration-200 cursor-pointer shadow-lg"
          >
            ← {currentLanguage === 'TR' ? 'Anasayfaya Dön' : 'Back to Home'}
          </button>
        </div>
      );
    }

    return (
      <div className="flex h-screen bg-[#0F0F1A] overflow-hidden text-gray-300">
        {/* Primary Left Navigation Panel */}
        <Sidebar />

        {/* Main Workspace Stream Area */}
        <div className="flex-1 flex flex-col min-w-0 relative h-full">
          <Topbar />

          {/* Dynamic content rendering frame */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 relative">
            <div className="max-w-6xl mx-auto w-full">
              {renderActiveAdminPage()}
            </div>
          </main>

          {/* Tutorial onboarding wizard */}
          <OnboardingWizard />

          {/* Interactive workspace command palette search portal */}
          <CommandPalette />
        </div>
      </div>
    );
  };

  return (
    <>
      {renderPortal()}

      {/* Global Toast Alert banner messages */}
      {toastMsg && (
        <div 
          id="global-toast-notification"
          className={`fixed bottom-6 right-6 z-[99999] px-5 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-slide-left ${
            toastMsg.type === 'success' 
              ? 'bg-emerald-950/90 text-emerald-400 border-emerald-500/30' 
              : toastMsg.type === 'error' 
              ? 'bg-rose-950/90 text-rose-400 border-rose-500/30' 
              : 'bg-indigo-950/90 text-[#00D4FF] border-indigo-500/30'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current animate-ping" />
          <p className="text-xs font-bold font-sora leading-tight">{toastMsg.text}</p>
        </div>
      )}
    </>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
