import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '../context/AppContext';
import { Search, Command, User, Settings, Disc, Shield, CreditCard, MessageSquare, Briefcase, ChevronRight, X } from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const { searchOpen, setSearchOpen, setCurrentTab, users, services, orders, currentLanguage } = useAppState();
  const [query, setQuery] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [searchOpen]);

  if (!searchOpen) return null;

  // Filter items
  const menuCommands = [
    { name: currentLanguage === 'TR' ? 'Dashboard Kısayolu' : 'Dashboard Shortcut', tab: 'dashboard', icon: Disc, desc: 'Genel istatistikleri ve gelir özetini inceleyin' },
    { name: currentLanguage === 'TR' ? 'Siparişler Listesi' : 'Orders List', tab: 'orders', icon: Briefcase, desc: 'Tüm siparişleri yönetin, durum güncelleyin' },
    { name: currentLanguage === 'TR' ? 'Hizmetler / Servis Katoloğu' : 'Services Catalogue', tab: 'services', icon: Settings, desc: 'SMM servislerini, fiyat ve limitleri yönetin' },
    { name: currentLanguage === 'TR' ? 'Kullanıcı Hesapları' : 'User Accounts', tab: 'users', icon: User, desc: 'Bakiye yükleme, üye engelleme ve detaylar' },
    { name: currentLanguage === 'TR' ? 'Finans & Ödeme Kanalları' : 'Finance & Payment Gateways', tab: 'finance', icon: CreditCard, desc: 'Ödeme kanallarını yapılandırın ve talepleri onaylayın' },
    { name: currentLanguage === 'TR' ? 'API Entegrasyonu' : 'API Management', tab: 'api', icon: Shield, desc: 'Sağlayıcı API anahtarları ve rate limitler' },
    { name: currentLanguage === 'TR' ? 'Müşteri Destek Talepleri' : 'Customer Support Tickets', tab: 'tickets', icon: MessageSquare, desc: 'Gelen destek biletlerini cevaplayın' }
  ];

  const matchedMenus = menuCommands.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) || 
    c.tab.toLowerCase().includes(query.toLowerCase())
  );

  const matchedUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(query.toLowerCase()) || 
    u.email.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const matchedServices = services.filter(s => 
    s.name.toLowerCase().includes(query.toLowerCase()) || 
    s.platform.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const matchedOrders = orders.filter(o => 
    o.id.toLowerCase().includes(query.toLowerCase()) || 
    o.username.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const handleSelectTab = (tab: string) => {
    setCurrentTab(tab);
    setSearchOpen(false);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-start justify-center p-4 md:p-12 animate-fade-in"
      ref={overlayRef}
      id="command-palette-overlay"
      onClick={(e) => {
        if (e.target === overlayRef.current) setSearchOpen(false);
      }}
    >
      <div className="w-full max-w-2xl bg-[#121225] border border-white/10 rounded-2xl shadow-2xl shadow-purple-950/20 overflow-hidden mt-8 md:mt-16 flex flex-col">
        {/* Search header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 bg-[#171732]">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            id="command-palette-input"
            ref={inputRef}
            type="text"
            placeholder={currentLanguage === 'TR' ? 'Bir şeyler arayın veya komut verin (örn: siparişler, mehmet)...' : 'Type a command or search (e.g. orders, user)...'}
            className="flex-1 bg-transparent text-white border-none outline-none text-base placeholder-gray-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/15 text-[10px] text-gray-400">
            <kbd>ESC</kbd>
          </div>
          <button 
            id="close-command-palette-btn"
            onClick={() => setSearchOpen(false)} 
            className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-none">
          {/* Quick instructions when query is empty */}
          {query === '' && (
            <div className="px-3 py-2 text-[11px] font-bold text-cyan-400 tracking-wider uppercase">
              {currentLanguage === 'TR' ? 'Navigasyon Kısayolları' : 'Navigation Shortcuts'}
            </div>
          )}

          {matchedMenus.length > 0 && (
            <div className="mb-4">
              {query !== '' && (
                <div className="px-3 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  {currentLanguage === 'TR' ? 'Komutlar ve Sayfalar' : 'Commands & Pages'}
                </div>
              )}
              <div className="space-y-0.5">
                {matchedMenus.map(m => {
                  const IconComp = m.icon;
                  return (
                    <button
                      id={`cmd-btn-${m.tab}`}
                      key={m.tab}
                      onClick={() => handleSelectTab(m.tab)}
                      className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#1A1A3A] transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-950/40 text-purple-400 group-hover:bg-purple-900/60 group-hover:text-purple-300">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-200 group-hover:text-white">{m.name}</p>
                          <p className="text-xs text-gray-500">{m.desc}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transform group-hover:translate-x-1" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* User Results */}
          {matchedUsers.length > 0 && (
            <div className="mb-4">
              <div className="px-3 py-1 text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1">
                {currentLanguage === 'TR' ? 'Müşteriler' : 'Clients'}
              </div>
              <div className="space-y-0.5">
                {matchedUsers.map(u => (
                  <button
                    id={`cmd-user-${u.id}`}
                    key={u.id}
                    onClick={() => handleSelectTab('users')}
                    className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#1A1A3A] transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-cyan-950/55 flex items-center justify-center text-cyan-400 font-bold text-xs border border-cyan-800/30">
                        {u.fullName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-200 group-hover:text-white">{u.fullName}</p>
                        <p className="text-xs text-gray-500">{u.email} • {u.balance} ₺</p>
                      </div>
                    </div>
                    <span className="text-xs text-cyan-400 hover:underline">{currentLanguage === 'TR' ? 'Detay' : 'Details'}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Service Results */}
          {matchedServices.length > 0 && (
            <div className="mb-4">
              <div className="px-3 py-1 text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1">
                {currentLanguage === 'TR' ? 'Hizmetler' : 'Services'}
              </div>
              <div className="space-y-0.5">
                {matchedServices.map(s => (
                  <button
                    id={`cmd-service-${s.id}`}
                    key={s.id}
                    onClick={() => handleSelectTab('services')}
                    className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#1A1A3A] transition group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="px-2 py-0.5 rounded bg-purple-950/40 text-[10px] font-bold text-purple-300 border border-purple-800/30 mt-0.5">
                        {s.platform}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-200 line-clamp-1 group-hover:text-white">{s.name}</p>
                        <p className="text-xs text-gray-500">Min: {s.min} • Fiyat: {s.pricePer1000} ₺ / 1k</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Order Results */}
          {matchedOrders.length > 0 && (
            <div className="mb-2">
              <div className="px-3 py-1 text-[10px] font-bold text-yellow-400 uppercase tracking-wider mb-1">
                {currentLanguage === 'TR' ? 'Siparişler' : 'Orders'}
              </div>
              <div className="space-y-0.5">
                {matchedOrders.map(o => (
                  <button
                    id={`cmd-order-${o.id}`}
                    key={o.id}
                    onClick={() => handleSelectTab('orders')}
                    className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#1A1A3A] transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-[11px] font-mono font-bold text-yellow-500 bg-yellow-950/20 px-2 py-1 rounded">
                        {o.id}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-200 line-clamp-1">@{o.username} ({o.platform})</p>
                        <p className="text-xs text-gray-500">{o.quantity} adet • {o.charge} ₺ • {o.status}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedMenus.length === 0 && matchedUsers.length === 0 && matchedServices.length === 0 && matchedOrders.length === 0 && (
            <div className="text-center py-12">
              <Command className="w-10 h-10 text-gray-600 mx-auto mb-2 animate-pulse" />
              <p className="text-sm text-gray-400 font-medium">
                {currentLanguage === 'TR' ? 'Eşleşen sonuç bulunamadı' : 'No matching results found'}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {currentLanguage === 'TR' ? 'Farklı anahtar kelimeler ile tekrar deneyin.' : 'Try with other terms.'}
              </p>
            </div>
          )}
        </div>
        
        {/* Footer info */}
        <div className="px-4 py-2 bg-[#0d0d1c] border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center gap-3">
            <span>↑↓ {currentLanguage === 'TR' ? 'Gezin' : 'Navigate'}</span>
            <span>↵ {currentLanguage === 'TR' ? 'Seç' : 'Select'}</span>
          </div>
          <div>
            <span>SMM Panel Pro v2.1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
