import React, { useState, useMemo } from 'react';
import { useAppState } from '../context/AppContext';
import { 
  Zap, 
  TrendingUp, 
  Coins, 
  Users, 
  ShieldCheck, 
  ChevronRight, 
  Lock, 
  ArrowRight, 
  CheckCircle, 
  Search, 
  HelpCircle,
  Code,
  Globe,
  Star,
  Eye,
  Menu,
  X,
  Cpu
} from 'lucide-react';

export const Landing: React.FC = () => {
  const { 
    services, 
    currentLanguage, 
    setCurrentLanguage,
    setPortalMode,
    registerClient,
    setClientLoggedIn,
    setCurrentClientUser,
    users,
    showToast
  } = useAppState();

  const [activePlatformFilter, setActivePlatformFilter] = useState<string>('Tümü');
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Authentication states (Modal)
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  const platforms = useMemo(() => {
    return ['Tümü', 'Instagram', 'TikTok', 'YouTube', 'Twitter', 'Spotify', 'Telegram'];
  }, []);

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      if (service.status !== 'active') return false;
      const matchesPlatform = activePlatformFilter === 'Tümü' || service.platform === activePlatformFilter;
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            service.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesPlatform && matchesSearch;
    });
  }, [services, activePlatformFilter, searchTerm]);

  // Handle Client Authentication
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authTab === 'register') {
      if (!authFullName || !authEmail || !authPassword) {
        showToast(currentLanguage === 'TR' ? 'Lütfen tüm alanları doldurun.' : 'Please fill all fields.', 'error');
        return;
      }
      const success = registerClient(authFullName, authEmail);
      if (success) {
        setAuthModalOpen(false);
        setPortalMode('client');
      }
    } else {
      // Login flow
      if (!authEmail || !authPassword) {
        showToast(currentLanguage === 'TR' ? 'Lütfen tüm alanları doldurun.' : 'Please fill all fields.', 'error');
        return;
      }
      
      // Look for user in registered client list
      const user = users.find(u => u.email.toLowerCase() === authEmail.toLowerCase());
      if (user) {
        if (user.status === 'suspended') {
          showToast(currentLanguage === 'TR' ? 'Hesabınız askıya alınmıştır.' : 'Your account has been suspended.', 'error');
          return;
        }
        setCurrentClientUser(user);
        setClientLoggedIn(true);
        setPortalMode('client');
        setAuthModalOpen(false);
        showToast(currentLanguage === 'TR' ? `Tekrar hoş geldiniz, Sayın ${user.fullName}!` : `Welcome back, Mr/Mrs ${user.fullName}!`, 'success');
      } else {
        // Simple fallback to create user or log in with demo
        const isDemo = authEmail === 'client@gmail.com' || authEmail === 'user@gmail.com';
        if (isDemo || authPassword === 'password123') {
          // Find first active user or mock login
          const targetUser = users[0] || { id: "1", fullName: "Demo Kullanıcı", email: authEmail, balance: 1500, totalOrders: 15, joinedDate: "01.01.2026", status: "active" };
          setCurrentClientUser(targetUser);
          setClientLoggedIn(true);
          setPortalMode('client');
          setAuthModalOpen(false);
          showToast(currentLanguage === 'TR' ? 'Demo kullanıcı olarak giriş yapıldı.' : 'Logged in as demo client.', 'success');
        } else {
          showToast(currentLanguage === 'TR' ? 'Kullanıcı bulunamadı. Lütfen yeni kayıt oluşturun.' : 'Client not found. Please register.', 'error');
        }
      }
    }
  };

  const handleQuickLogin = (email: string) => {
    setAuthEmail(email);
    setAuthPassword('password123');
    setAuthTab('login');
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#090915] text-[#eeeeff] font-sans antialiased relative overflow-x-hidden">
      
      {/* Dynamic Grid Background Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#14142b_1px,transparent_1px),linear-gradient(to_bottom,#14142b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />

      {/* Atmospheric glowing nodes */}
      <div className="absolute top-[-20%] left-[-15%] w-[80vw] h-[80vw] bg-[#7B2FFF]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[60vw] h-[60vw] bg-[#00D4FF]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[70vw] h-[70vw] bg-purple-900/10 rounded-full blur-[180px] pointer-events-none" />

      {/* Premium Navigation Header */}
      <nav className="border-b border-white/5 bg-[#090915]/80 backdrop-blur-md sticky top-0 z-[1500] w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00D4FF] to-[#7B2FFF] flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/15">
              SMM
            </div>
            <div>
              <span className="font-bold text-lg font-sora text-white tracking-wide block leading-none">
                SMM PRO
              </span>
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mt-0.5 block">
                GROUP TURKEY
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center gap-8 text-xs font-semibold text-gray-300">
            <a href="#services-sec" className="hover:text-[#00D4FF] transition-colors">
              {currentLanguage === 'TR' ? 'Hizmetler & Fiyatlar' : 'Services & Catalog'}
            </a>
            <a href="#features-sec" className="hover:text-[#00D4FF] transition-colors">
              {currentLanguage === 'TR' ? 'Neden Biz?' : 'Why SMM Pro?'}
            </a>
            <a href="#api-sec" className="hover:text-[#00D4FF] transition-colors">
              {currentLanguage === 'TR' ? 'API Dokümantasyonu' : 'Reseller API'}
            </a>
            <a href="#faq" className="hover:text-[#00D4FF] transition-colors">
              FAQ
            </a>
          </div>

          {/* Actions panel */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language switcher */}
            <button
              onClick={() => setCurrentLanguage(currentLanguage === 'TR' ? 'EN' : 'TR')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentLanguage}</span>
            </button>

            {/* Admin Console shortcut link */}
            <button
              onClick={() => {
                setPortalMode('admin');
                showToast(currentLanguage === 'TR' ? 'Yönetim portalına yönlendiriliyorsunuz.' : 'Redirecting to admin terminal.', 'info');
              }}
              className="text-xs font-bold text-gray-400 hover:text-white transition cursor-pointer"
            >
              {currentLanguage === 'TR' ? 'Yönetici Girişi' : 'Admin Console'}
            </button>

            <button
              id="landing-signin-btn"
              onClick={() => {
                setAuthTab('login');
                setAuthModalOpen(true);
              }}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold hover:text-white transition cursor-pointer"
            >
              {currentLanguage === 'TR' ? 'Müşteri Girişi' : 'Client Hub'}
            </button>

            <button
              id="landing-signup-btn"
              onClick={() => {
                setAuthTab('register');
                setAuthModalOpen(true);
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-purple-500 hover:shadow-lg hover:shadow-cyan-400/10 text-white font-bold rounded-xl text-xs transition cursor-pointer active:scale-95"
            >
              {currentLanguage === 'TR' ? 'Hemen Kayıt Ol' : 'Get Started'}
            </button>
          </div>

          {/* Hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-400 hover:text-white bg-white/5 border border-white/10 rounded-xl cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </nav>

      {/* Mobile nav drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-20 bg-[#0d0d1c] border-b border-white/10 p-5 space-y-4 z-[1400] md:hidden animate-slide-down shadow-2xl">
          <div className="flex flex-col gap-3.5 text-xs font-bold text-gray-300">
            <a href="#services-sec" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-white/5 hover:text-[#00D4FF]">
              {currentLanguage === 'TR' ? 'Hizmetler & Fiyatlar' : 'Services & Catalog'}
            </a>
            <a href="#features-sec" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-white/5 hover:text-[#00D4FF]">
              {currentLanguage === 'TR' ? 'Neden Biz?' : 'Why SMM Pro?'}
            </a>
            <a href="#api-sec" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-white/5 hover:text-[#00D4FF]">
              {currentLanguage === 'TR' ? 'API Entegrasyonu' : 'Reseller API'}
            </a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-white/5 hover:text-[#00D4FF]">
              FAQ
            </a>
          </div>

          <div className="flex items-center justify-between pt-3">
            <button
              onClick={() => {
                setCurrentLanguage(currentLanguage === 'TR' ? 'EN' : 'TR');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentLanguage}</span>
            </button>

            <button
              onClick={() => {
                setPortalMode('admin');
                setMobileMenuOpen(false);
              }}
              className="text-xs font-bold text-gray-400 hover:text-white cursor-pointer"
            >
              {currentLanguage === 'TR' ? 'Admin Paneli' : 'Admin Area'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                setAuthTab('login');
                setAuthModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 bg-white/5 border border-white/15 rounded-xl text-center font-bold text-xs hover:text-white cursor-pointer"
            >
              {currentLanguage === 'TR' ? 'Müşteri Girişi' : 'Client Login'}
            </button>
            <button
              onClick={() => {
                setAuthTab('register');
                setAuthModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl text-center font-bold text-xs text-white cursor-pointer"
            >
              {currentLanguage === 'TR' ? 'Kayıt Ol' : 'Signup'}
            </button>
          </div>
        </div>
      )}

      {/* Hero Content Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center space-y-12">
        <div className="space-y-4 max-w-4xl mx-auto">
          {/* Badge indicator */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/35 text-[10px] font-bold text-[#00D4FF] tracking-wider uppercase mx-auto animate-pulse">
            <Cpu className="w-3.5 h-3.5" />
            <span>{currentLanguage === 'TR' ? 'OTOMATIK API GÖNDERIM ALTYAPISI' : 'AUTOMATED RESELLER API'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-sora text-white tracking-tight leading-tight">
            {currentLanguage === 'TR' ? (
              <>
                Türkiye'nin En Ucuz, En Hızlı <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">API SMM Servis</span> Sağlayıcısı
              </>
            ) : (
              <>
                The Ultimate Cheap & Automated <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">SMM Panel API</span> Hub
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-2xl mx-auto">
            {currentLanguage === 'TR' 
              ? 'Instagram, TikTok, YouTube ve yüzlerce platformda anında gönderim sağlayan otomatik SMM servisleriyle sosyal medya etkileşimlerinizi uçuşa geçirin. Üye olarak ücretsiz test bakiyenizi anında kullanın!' 
              : 'Launch your social accounts to new heights using automated marketing api. Instantly get your free welcome load in your wallet upon secure signup!'}
          </p>
        </div>

        {/* Action Call for Clients */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => {
              setAuthTab('register');
              setAuthModalOpen(true);
            }}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#00D4FF] to-[#7B2FFF] text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-cyan-400/20 active:scale-95 transition cursor-pointer"
          >
            <span>{currentLanguage === 'TR' ? 'Ücretsiz Kayıt Ol & 100 TL Kap' : 'Register & Claim 100 TL Free'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => {
              setAuthTab('login');
              setAuthModalOpen(true);
            }}
            className="w-full sm:w-auto px-8 py-4 bg-[#14142d] hover:bg-[#1a1a3c] border border-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <span>{currentLanguage === 'TR' ? 'Servisleri İncele' : 'Browse Services'}</span>
          </button>
        </div>

        {/* Active Stats Panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 max-w-5xl mx-auto">
          {[
            { value: '48.9K+', labelTR: 'Aktif Bayiler', labelEN: 'Active Resellers', color: 'text-cyan-400' },
            { value: '312.4M', labelTR: 'Tamamlanan Sipariş', labelEN: 'Orders Completed', color: 'text-purple-400' },
            { value: '0.04s', labelTR: 'Ortalama Başlama', labelEN: 'Avg Start Time', color: 'text-emerald-400' },
            { value: '99.98%', labelTR: 'UPTIME APis', labelEN: 'API Stability', color: 'text-pink-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#121226]/50 border border-white/5 py-6 px-4 rounded-3xl backdrop-blur-sm relative group hover:border-[#7B2FFF]/30 transition duration-300">
              <div className="absolute top-0 left-0 w-8 h-8 bg-gradient-to-br from-white/5 to-transparent rounded-tl-full" />
              <span className={`text-2xl sm:text-3xl font-extrabold font-sora block ${stat.color}`}>{stat.value}</span>
              <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase mt-1 block tracking-wider">
                {currentLanguage === 'TR' ? stat.labelTR : stat.labelEN}
              </span>
            </div>
          ))}
        </div>

      </section>

      {/* Interactive Catalog Section */}
      <section id="services-sec" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5 relative">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-sora text-white">
            {currentLanguage === 'TR' ? 'Güncel Servis Kataloğu & Fiyat Listesi' : 'Interactive SMM Catalog & Slashed Rates'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-2xl mx-auto">
            {currentLanguage === 'TR' 
              ? 'Tüm fiyatlarımız otomatik olarak döviz kuruna ve sağlayıcı maliyetine göre güncellenir. Fiyatlar 1000 adet gönderim için geçerlidir.' 
              : 'Our system updates pricing on the fly based on network loads. Unit costs apply per 1,000 requests.'}
          </p>
        </div>

        {/* Filters and search blocks */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          {/* Horizontal scroll platform menu */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {platforms.map(p => (
              <button
                key={p}
                onClick={() => setActivePlatformFilter(p)}
                className={`px-4 py-2 text-xs font-bold rounded-xl shrink-0 transition cursor-pointer ${
                  activePlatformFilter === p 
                    ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white' 
                    : 'bg-[#121226]/60 text-gray-400 hover:text-white border border-white/5 hover:bg-[#181832]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={currentLanguage === 'TR' ? 'Kategori veya servis ara...' : 'Filter catalog by keywords...'}
              className="w-full bg-[#121226]/50 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-cyan-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Services Table Card responsive markup */}
        <div className="bg-[#121226]/35 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#191932]/35 border-b border-white/5 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-5">ID</th>
                  <th className="py-4 px-5">{currentLanguage === 'TR' ? 'Platform' : 'Platform'}</th>
                  <th className="py-4 px-5">{currentLanguage === 'TR' ? 'Servis Adı' : 'Service Description'}</th>
                  <th className="py-4 px-5 text-right">{currentLanguage === 'TR' ? 'Fiyat (1000 Adet)' : 'Cost per 1k'}</th>
                  <th className="py-4 px-5 text-center">{currentLanguage === 'TR' ? 'Min' : 'Min'}</th>
                  <th className="py-4 px-5 text-center">{currentLanguage === 'TR' ? 'Max' : 'Max'}</th>
                  <th className="py-4 px-5 text-center">{currentLanguage === 'TR' ? 'Satın Al' : 'Instant Order'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300 font-medium">
                {filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      {currentLanguage === 'TR' ? 'Aradığınız kriterlere uygun servis bulunamadı.' : 'No active services compile into your current filters.'}
                    </td>
                  </tr>
                ) : (
                  filteredServices.map(service => (
                    <tr key={service.id} className="hover:bg-white/2 transition">
                      <td className="py-3.5 px-5 font-mono text-cyan-400 font-bold">#{service.id}</td>
                      <td className="py-3.5 px-5 select-none">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-extrabold font-mono uppercase tracking-wider ${
                          service.platform === 'Instagram' ? 'bg-pink-950/20 text-pink-400 border border-pink-500/10' :
                          service.platform === 'TikTok' ? 'bg-cyan-950/20 text-cyan-400 border border-cyan-500/10' :
                          service.platform === 'YouTube' ? 'bg-rose-950/20 text-rose-400 border border-rose-500/10' :
                          'bg-indigo-950/20 text-indigo-400 border border-indigo-500/10'
                        }`}>
                          {service.platform}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-white block mb-0.5">{service.name}</span>
                        <p className="text-[10.5px] text-gray-500 line-clamp-1">{service.description}</p>
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono font-bold text-cyan-400 text-sm">
                        ₺{service.pricePer1000.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-5 text-center font-mono font-bold text-gray-500">{service.min}</td>
                      <td className="py-3.5 px-5 text-center font-mono font-bold text-gray-500">{service.max}</td>
                      <td className="py-3.5 px-5 text-center">
                        <button
                          onClick={() => {
                            setAuthTab('login');
                            setAuthModalOpen(true);
                            showToast(currentLanguage === 'TR' ? 'Sipariş vermek için lütfen giriş yapın veya kayıt olun.' : 'Please authenticate to process immediate placement.', 'info');
                          }}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-950/40 to-[#7B2FFF]/10 border border-[#7B2FFF]/30 text-[#00D4FF] text-[10px] font-bold rounded-lg hover:text-white hover:bg-white/5 cursor-pointer ml-auto"
                        >
                          {currentLanguage === 'TR' ? 'Sipariş Ver' : 'Place'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Why Choose Us features section */}
      <section id="features-sec" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5 relative">
        <div className="absolute top-1/2 left-[-10%] w-[30vw] h-[30vw] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="px-3 py-1 bg-[#1a133d] border border-purple-500/35 text-purple-400 font-extrabold text-[10px] tracking-wider rounded-full uppercase inline-block">
              {currentLanguage === 'TR' ? 'SİSTEM AVANTAJLARI' : 'CORE REASONINGS'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-sora text-white leading-tight">
              {currentLanguage === 'TR' ? 'Bayilere ve Ajanslara Özel Optimize Edilmiş API Servisleri' : 'Optimized API Infrastructure Tailored for Resellers & Agencies'}
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              {currentLanguage === 'TR' 
                ? 'SMM Pro Group Turkey markası olarak, kendi panelini veya yazılıp bayiliğini yürütmek isteyen müşterilerimize sınırsız hacimde, donmasız ve anında teslim garantili servis sağlıyoruz. Günler süren kargo veya sipariş bekleme süreçlerine son verin.'
                : 'Enjoy infinite scale capabilities, complete server protection patterns, and near zero lag. We keep standard operations working 24/7 with immediate response parameters.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs pt-4">
              {[
                { title: 'Otomatik Dağıtım', desc: 'İşlemler tamamen otonom API ile anında başlar.' },
                { title: '7/24 Teknik Destek', desc: 'Müşteri temsilcilerimiz canlı destek ile anlık cevaplar.' },
                { title: 'PayTR Güvencesi', desc: 'Kredi kartı ile %100 güvenli 3D Secure bakiye yüklemesi.' },
                { title: 'Düşmeyen Garantili', desc: 'Takipçi ve beğenilerde 30 gün boyunca telafi buton seçeneği.' },
              ].map((item, id) => (
                <div key={id} className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-xs">{item.title}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature visual mock-up block */}
          <div className="bg-[#121226]/50 border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-cyan-400/20 transition duration-300">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <span className="font-mono text-gray-500">api-endpoint-v2.json</span>
            </div>

            <pre className="font-mono text-[10.5px] leading-relaxed text-indigo-300 overflow-x-auto select-all">
{`{
  "api_action": "place_order",
  "api_key": "smm_live_v2_918231csa",
  "service_id": 101,
  "service_quantity": 2500,
  "link": "https://instagram.com/salihmusic",
  "delivery_agent": "instant_auto"
}

// HTTP POST RESPONSE:
{
  "status": "success",
  "order_id": "ORD-50124",
  "charged_balance": "106.25 TL",
  "remaining_balance": "1393.75 TL"
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* Developer API Documentation card anchor */}
      <section id="api-sec" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-gradient-to-r from-cyan-950/20 to-purple-950/20 border border-white/5 rounded-3xl p-6 sm:p-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-md">
          <div className="space-y-3.5 max-w-xl text-left">
            <Code className="w-8 h-8 text-cyan-400" />
            <h3 className="text-xl sm:text-2xl font-bold font-sora text-white">
              {currentLanguage === 'TR' ? 'Kendi Sizin Sitenizden Mi Satış Yapacaksınız?' : 'Are You Reselling from Your Personal Codebase?'}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {currentLanguage === 'TR' 
                ? 'Panelimizin kusursuz JSON API desteği sayesinde tüm API entegrasyonlarını saniyeler içinde tamamlayın. Perfect Panel, SMM Lite ve tüm diğer altyapılarla uyumludur.' 
                : 'Our comprehensive REST API supports continuous webhook triggers and full multi-currency sync operations.'}
            </p>
          </div>
          <div>
            <button
              onClick={() => {
                setAuthTab('register');
                setAuthModalOpen(true);
              }}
              className="px-6 py-3.5 bg-[#121226] hover:bg-[#1a1a36] border border-cyan-400/30 text-cyan-400 font-bold text-xs rounded-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer shrink-0"
            >
              <span>{currentLanguage === 'TR' ? 'Hemen API KEY Al' : 'Generate API KEY'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Trust & Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Kerem Yılmaz', role: 'Ajans Sahibi', comment: 'PayTR entegrasyonu sayesinde saniyeler içinde cüzdanımızı doldurup sipariş geçiyoruz. 10 saniyede takipçiler yüklenmeye başlıyor.', score: 5 },
            { name: 'Ezgi Şen', role: 'Sosyal Medya Danışmanı', comment: 'Sürekli müşterilerimin hesaplarını buradaki Türk Organik servisiyle destekledim. Düşüş yok denecek kadar az. Harika bir panel!', score: 5 },
            { name: 'Murat Aras', role: 'Yazılımcı / Reseller', comment: 'API dokümantasyonu o kadar temiz ki kendi Python scriptlerimle 5 dakikada entegrasyon sağladım. Teşekkürler SMM Pro!', score: 5 },
          ].map((testi, idx) => (
            <div key={idx} className="bg-[#121226]/50 border border-white/5 rounded-3xl p-5 space-y-3">
              <div className="flex items-center gap-1.5 text-yellow-500">
                {[...Array(testi.score)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
              </div>
              <p className="text-xs text-gray-400 leading-relaxed italic">"{testi.comment}"</p>
              <div>
                <span className="font-bold text-white text-xs block">{testi.name}</span>
                <span className="text-[10px] text-gray-500">{testi.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer footer-details links */}
      <footer className="border-t border-white/5 bg-[#05050f]/90 py-10 text-xs text-gray-500 relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00D4FF] to-[#7B2FFF] flex items-center justify-center font-bold text-white text-xs">
              S
            </div>
            <span className="font-bold text-gray-300">SMM Pro Group Turkey © 2026. Tüm hakları saklıdır.</span>
          </div>

          <div className="flex items-center gap-6">
            {/* Direct Admin Login gateway */}
            <button
              onClick={() => {
                setPortalMode('admin');
                showToast(currentLanguage === 'TR' ? 'Yönetici kimlik doğrulama konsoluna aktarıldınız.' : 'Navigating to admin portal.', 'info');
              }}
              className="hover:underline text-gray-500 hover:text-white font-semibold cursor-pointer"
            >
              🔐 {currentLanguage === 'TR' ? 'Sistem Yetkilisi (Admin)' : 'Admin Login Link'}
            </button>
            <span>-</span>
            <span>Uptime 100% Guaranteed</span>
          </div>
        </div>
      </footer>

      {/* Authentication Modal - Login & Sign up on public dashboard */}
      {authModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[5000] flex items-center justify-center p-4 animate-fade-in">
          
          <div className="w-full max-w-md bg-[#16162d] border border-white/10 rounded-3xl p-6 shadow-2xl relative animate-scale-up">
            
            {/* Close modal button */}
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Hub Header */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold font-sora text-white">
                {authTab === 'login' ? (
                  currentLanguage === 'TR' ? 'Müşteri Girişi' : 'Client Access'
                ) : (
                  currentLanguage === 'TR' ? 'Hemen Hesap Oluştur' : 'Register New Dealer'
                )}
              </h3>
              <p className="text-[11px] text-gray-500 mt-1">
                {currentLanguage === 'TR' 
                  ? 'SMM Pro Group Turkey ayrıcalıklı bayiler platformu.' 
                  : 'SMM Pro Group Turkey premium reselling program.'}
              </p>
            </div>

            {/* Quick Demo Assist Links */}
            {authTab === 'login' && (
              <div className="mb-4 p-3 bg-purple-950/20 border border-purple-800/25 rounded-2xl space-y-1.5 text-[10.5px]">
                <span className="font-bold text-purple-400 block">{currentLanguage === 'TR' ? 'HIZLI SINAMA KULLANICILARI:' : 'SIMULATE REAL OR REGISTER:'}</span>
                <p className="text-gray-400 text-[10px] leading-relaxed">
                  {currentLanguage === 'TR' ? 'Kayıt olursanız hoş geldin hediyesi ' : 'Upon signing up we load '}
                  <b className="text-cyan-400">100 TL</b> 
                  {currentLanguage === 'TR' ? ' yüklenir. Mevcut bayilerle sınamak isterseniz:' : ' to your balance. Or click demo:'}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('salihmusicinc@gmail.com')}
                    className="px-2 py-1 bg-white/5 border border-white/10 rounded text-cyan-400 hover:bg-white/10 font-mono text-[9.5px] cursor-pointer"
                  >
                    salihmusicinc@gmail.com
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('client@gmail.com')}
                    className="px-2 py-1 bg-white/5 border border-white/10 rounded text-cyan-400 hover:bg-white/10 font-mono text-[9.5px] cursor-pointer"
                  >
                    client@gmail.com
                  </button>
                </div>
              </div>
            )}

            {/* Modal tabs */}
            <div className="grid grid-cols-2 bg-[#121226] p-1 rounded-2xl mb-4 text-xs font-bold font-sora">
              <button
                type="button"
                onClick={() => setAuthTab('login')}
                className={`py-2 rounded-xl text-center cursor-pointer transition ${authTab === 'login' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {currentLanguage === 'TR' ? 'Giriş Yap' : 'Login'}
              </button>
              <button
                type="button"
                onClick={() => setAuthTab('register')}
                className={`py-2 rounded-xl text-center cursor-pointer transition ${authTab === 'register' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {currentLanguage === 'TR' ? 'Kayıt Ol (Ucretsiz)' : 'Sign Up'}
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
              {authTab === 'register' && (
                <div className="space-y-1">
                  <label className="text-gray-400 tracking-wide uppercase font-bold text-[10px]">{currentLanguage === 'TR' ? 'Adınız Soyadınız' : 'Full Name'}</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[#121226] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400"
                    placeholder="örn: Salih Music"
                    value={authFullName}
                    onChange={(e) => setAuthFullName(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-gray-400 tracking-wide uppercase font-bold text-[10px]">{currentLanguage === 'TR' ? 'E-Posta Adresiniz' : 'Email Address'}</label>
                <input
                  type="email"
                  required
                  className="w-full bg-[#121226] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400"
                  placeholder="örn: salihmusicinc@gmail.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 tracking-wide uppercase font-bold text-[10px]">{currentLanguage === 'TR' ? 'Şifre' : 'Password'}</label>
                <input
                  type="password"
                  required
                  className="w-full bg-[#121226] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 mt-2 bg-gradient-to-r from-cyan-400 to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-cyan-400/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{authTab === 'login' ? (currentLanguage === 'TR' ? 'Hesaba Giriş Yap' : 'Authorize Session') : (currentLanguage === 'TR' ? 'Hesabımı Oluştur - 100 TL Al' : 'Create & Claim 100 TL')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
