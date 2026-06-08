import React from 'react';
import { AppProvider, useAppState } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { LiveSupport } from './components/LiveSupport';
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
    toastMsg,
    portalMode,
    setPortalMode,
    clientLoggedIn,
    currentLanguage
  } = useAppState();

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

          {/* Floating live AI assistant chat bubble widget */}
          <LiveSupport />

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
