import React, { useState } from 'react';
import { useAppState } from '../context/AppContext';
import { ApiProvider } from '../data/mockData';
import { Shield, Key, Copy, Check, Trash2, Globe, Sparkles, RefreshCw, Sliders, Play, Edit2, Save, X, Download, Flag, AlertTriangle } from 'lucide-react';

export const ApiConfig: React.FC = () => {
  const { 
    apiProviders, 
    setApiProviders, 
    currentLanguage, 
    updateApiProviderStatus, 
    updateApiProvider,
    testApiProvider,
    importServicesFromApi,
    showToast 
  } = useAppState();

  const [adminApiKey, setAdminApiKey] = useState('smm_sk_admin_827361283h12a8319fbc7c');
  const [copiedKey, setCopiedKey] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [importingId, setImportingId] = useState<string | null>(null);

  const [editingProviderId, setEditingProviderId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editKey, setEditKey] = useState('');

  const [rateLimit, setRateLimit] = useState(120);

  const startEditing = (p: ApiProvider) => {
    setEditingProviderId(p.id);
    setEditName(p.name);
    setEditUrl(p.url);
    setEditKey(p.key);
  };

  const cancelEditing = () => setEditingProviderId(null);

  const handleSaveProvider = (id: string) => {
    if (!editName.trim() || !editUrl.trim() || !editKey.trim()) {
      showToast(currentLanguage === 'TR' ? 'Lütfen tüm alanları doldurunuz.' : 'Please fill all fields.', 'error');
      return;
    }
    updateApiProvider(id, editName, editUrl, editKey);
    setEditingProviderId(null);
  };

  const handleCreateNewAdminApiKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let keyString = 'smm_sk_admin_';
    for (let i = 0; i < 22; i++) {
      keyString += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setAdminApiKey(keyString);
    showToast(currentLanguage === 'TR' ? 'Yeni yönetici API Anahtarı üretildi!' : 'New administrator API key generated!', 'success');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    showToast(currentLanguage === 'TR' ? 'Panoya kopyalandı!' : 'Copied to clipboard!', 'info');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRunDiagnosticTest = async (id: string) => {
    setTestingId(id);
    await testApiProvider(id);
    setTestingId(null);
  };

  const handleImportServices = async (id: string) => {
    setImportingId(id);
    await importServicesFromApi(id);
    setImportingId(null);
  };

  const getRegionBadge = (region: 'TR' | 'GLOBAL') => {
    if (region === 'TR') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-black bg-red-950/50 text-red-400 border border-red-800/30 px-2 py-0.5 rounded-lg">
          <Flag className="w-2.5 h-2.5" />
          Türk Kullanıcılar
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[10px] font-black bg-blue-950/50 text-blue-400 border border-blue-800/30 px-2 py-0.5 rounded-lg">
        <Globe className="w-2.5 h-2.5" />
        Global Users
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#eeeeff]">

      {/* Info banner: routing logic */}
      <div className="glass-panel p-4 rounded-2xl border border-cyan-800/20 bg-cyan-950/10 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-cyan-300">
            {currentLanguage === 'TR' ? 'Çift Sağlayıcı Yönlendirme Sistemi' : 'Dual Provider Routing System'}
          </p>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            {currentLanguage === 'TR'
              ? '🇹🇷 Türk kullanıcılar → TurkPaneli.com API (turkpaneli.com/api/v2)  |  🌍 Yabancı kullanıcılar → ResellerProvider.com API (resellerprovider.com/api/v2)'
              : '🇹🇷 Turkish users → TurkPaneli.com API (turkpaneli.com/api/v2)  |  🌍 International users → ResellerProvider.com API (resellerprovider.com/api/v2)'}
          </p>
          <p className="text-[10px] text-gray-500">
            {currentLanguage === 'TR'
              ? 'cPanel\'de api-proxy.php otomatik olarak doğru sağlayıcıya yönlendirir. Her sağlayıcıya kendi API Key\'ini girin.'
              : 'api-proxy.php on cPanel automatically routes to the correct provider. Enter each provider\'s own API Key.'}
          </p>
        </div>
      </div>

      {/* Admin API Key card */}
      <div className="glass-panel p-5 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2 space-y-1.5">
          <h4 className="text-sm font-bold font-sora text-white flex items-center gap-2">
            <Key className="w-4.5 h-4.5 text-cyan-400" />
            <span>Yönetici API Çözümü</span>
          </h4>
          <p className="text-[11px] text-gray-500 font-medium">
            Diğer üçüncü parti panellere servis satmak amacıyla kendi admin endpoints anahtarınızı üretin.
          </p>
          <div className="pt-3.5 flex items-center gap-2">
            <input
              type="text"
              readOnly
              className="bg-[#121226] border border-white/10 rounded-xl px-4 py-3 text-xs font-mono font-bold text-gray-300 w-full focus:outline-none"
              value={adminApiKey}
            />
            <button
              onClick={() => handleCopy(adminApiKey)}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-[#00D4FF] hover:text-cyan-200 rounded-xl transition active:scale-95"
              title="Kopyala"
            >
              {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2 flex flex-col justify-center">
          <button
            onClick={handleCreateNewAdminApiKey}
            className="w-full py-3 bg-gradient-to-r from-cyan-400 to-indigo-500 text-white text-xs font-bold rounded-xl transition active:scale-95 shadow-lg shadow-cyan-950/20"
          >
            Yeni API Anahtarı Üret
          </button>
          <button
            onClick={() => setAdminApiKey('')}
            className="w-full py-3 border border-rose-900/30 text-rose-500 text-xs font-bold rounded-xl hover:bg-rose-950/15"
          >
            Anahtarı İptal Et (Sil)
          </button>
        </div>
      </div>

      {/* Provider API Connections */}
      <div className="glass-panel p-5 rounded-3xl">
        <h3 className="text-sm font-bold font-sora text-white tracking-wide uppercase mb-1">
          SMM SAĞLAYICI API BAĞLANTILARI
        </h3>
        <p className="text-[11px] text-gray-500 mb-4">
          {currentLanguage === 'TR'
            ? 'Her sağlayıcı için API Key\'inizi girin, bağlantıyı test edin ve servisleri içe aktarın.'
            : 'Enter your API Key for each provider, test the connection, then import services.'}
        </p>

        <div className="space-y-4">
          {apiProviders.map(provider => {
            const isEditing = editingProviderId === provider.id;
            return isEditing ? (
              <div key={provider.id} className="p-5 bg-[#0f0f20]/90 border border-cyan-400/30 rounded-2xl space-y-4 animate-fade-in">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-[10px] font-bold text-cyan-400 font-mono tracking-wider flex items-center gap-1.5 uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    {currentLanguage === 'TR' ? 'API BAĞLANTISINI DÜZENLE' : 'EDIT API CONNECTION'}
                  </span>
                  <div className="flex items-center gap-2">
                    {getRegionBadge(provider.region)}
                    <span className="text-[9px] font-mono font-bold text-gray-500 bg-gray-950/40 px-2 py-0.5 rounded border border-white/5">{provider.id}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-400">{currentLanguage === 'TR' ? 'Sağlayıcı Adı' : 'Provider Name'}</label>
                    <input
                      type="text"
                      className="w-full bg-[#121226] border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-cyan-500 transition"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-400">API Endpoint URL</label>
                    <input
                      type="text"
                      className="w-full bg-[#121226] border border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-gray-300 focus:outline-none focus:border-cyan-500 transition"
                      value={editUrl}
                      onChange={e => setEditUrl(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-400">
                      API Key {provider.region === 'TR' ? '(turkpaneli.com)' : '(resellerprovider.com)'}
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#121226] border border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-yellow-400 focus:outline-none focus:border-yellow-400 transition"
                      placeholder={provider.region === 'TR' ? 'turkpaneli.com API Key...' : 'resellerprovider.com API Key...'}
                      value={editKey}
                      onChange={e => setEditKey(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2 border-t border-white/5">
                  <button
                    onClick={cancelEditing}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-[11px] font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition active:scale-95"
                  >
                    <X className="w-3.5 h-3.5" />
                    {currentLanguage === 'TR' ? 'İptal' : 'Cancel'}
                  </button>
                  <button
                    onClick={() => handleSaveProvider(provider.id)}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[11px] font-bold rounded-xl shadow cursor-pointer flex items-center gap-1.5 transition active:scale-95"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {currentLanguage === 'TR' ? 'Kaydet' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <div key={provider.id} className="p-4 bg-[#121226]/60 border border-white/5 rounded-2xl transition hover:border-cyan-400/20">
                {/* Provider header row */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`w-2.5 h-2.5 rounded-full shadow-md shrink-0 ${provider.status ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <h4 className="text-xs font-black text-white">{provider.name}</h4>
                      {getRegionBadge(provider.region)}
                    </div>

                    <p className="text-[11px] text-gray-500 font-medium truncate">
                      API URL: <span className="font-semibold text-gray-300 font-mono select-all">{provider.url}</span>
                    </p>

                    <div className="flex items-center gap-4 flex-wrap">
                      <p className="text-[10px] text-gray-400">
                        {currentLanguage === 'TR' ? 'Bakiye:' : 'Balance:'}
                        <strong className={`ml-1 font-mono ${provider.balance !== undefined ? 'text-[#00D4FF]' : 'text-gray-600'}`}>
                          {provider.balance !== undefined
                            ? `${provider.region === 'TR' ? '₺' : '$'}${provider.balance.toFixed(2)}`
                            : (currentLanguage === 'TR' ? 'Test edilmedi' : 'Not tested')}
                        </strong>
                      </p>
                      <p className="text-[10px] text-gray-400">
                        API Key:
                        <strong className={`ml-1 font-mono ${provider.key ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {provider.key
                            ? `${provider.key.substring(0, 8)}••••••`
                            : (currentLanguage === 'TR' ? '⚠ Girilmedi' : '⚠ Not set')}
                        </strong>
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto border-t lg:border-none border-white/5 pt-3 lg:pt-0">
                    <button
                      onClick={() => startEditing(provider)}
                      className="flex-1 lg:flex-none px-3 py-2 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/30 text-cyan-400 rounded-xl transition active:scale-95 cursor-pointer flex items-center justify-center gap-1 text-[10px] font-bold"
                      title={currentLanguage === 'TR' ? 'API Key Gir' : 'Set API Key'}
                    >
                      <Edit2 className="w-3 h-3" />
                      {currentLanguage === 'TR' ? 'API Key Gir' : 'Set API Key'}
                    </button>

                    <button
                      onClick={() => updateApiProviderStatus(provider.id, !provider.status)}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors relative cursor-pointer shrink-0 ${provider.status ? 'bg-[#00D4FF]' : 'bg-[#1e1e32]'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${provider.status ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>

                    <button
                      onClick={() => handleRunDiagnosticTest(provider.id)}
                      disabled={testingId === provider.id}
                      className="flex-1 lg:flex-none px-3 py-2 bg-indigo-950/20 border border-indigo-800/30 text-indigo-400 hover:bg-indigo-950 hover:text-indigo-300 text-[10px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {testingId === provider.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      {currentLanguage === 'TR' ? 'Test Et' : 'Test API'}
                    </button>

                    <button
                      onClick={() => handleImportServices(provider.id)}
                      disabled={importingId === provider.id}
                      className="flex-1 lg:flex-none px-3 py-2 bg-emerald-950/30 border border-emerald-800/30 text-emerald-400 hover:bg-emerald-950/60 hover:text-emerald-300 text-[10px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {importingId === provider.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                      {currentLanguage === 'TR' ? 'Servisleri Çek' : 'Import Services'}
                    </button>
                  </div>
                </div>

                {/* Step guide if no API key */}
                {!provider.key && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <p className="text-[10px] text-amber-400/80 flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3" />
                      {currentLanguage === 'TR'
                        ? `"API Key Gir" butonuna tıklayıp ${provider.region === 'TR' ? 'turkpaneli.com' : 'resellerprovider.com'} hesabınızdaki API Key'i yapıştırın → Test Et → Servisleri Çek`
                        : `Click "Set API Key", paste your ${provider.region === 'TR' ? 'turkpaneli.com' : 'resellerprovider.com'} API key → Test API → Import Services`}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* cPanel Deployment Info */}
      <div className="glass-panel p-5 rounded-3xl space-y-3">
        <h3 className="text-sm font-bold font-sora text-white tracking-wide uppercase flex items-center gap-1.5">
          <Shield className="w-4.5 h-4.5 text-emerald-400" />
          cPanel Kurulum Bilgisi
        </h3>
        <div className="p-4 bg-[#0d0d1e] rounded-2xl border border-white/5 font-mono text-[11px] leading-relaxed text-gray-300 space-y-2">
          <p className="text-emerald-400 font-bold">// 1. Build alın:</p>
          <p className="text-gray-300">npm run build</p>
          <p className="text-emerald-400 font-bold mt-2">// 2. cPanel'e yüklenecek dosyalar:</p>
          <p className="text-gray-300">dist/ klasörü içindeki tüm dosyalar + <span className="text-yellow-400">api-proxy.php</span></p>
          <p className="text-gray-300"><span className="text-yellow-400">.htaccess</span> dosyası public/ klasöründen dist/ root'una kopyalanacak</p>
          <p className="text-emerald-400 font-bold mt-2">// 3. PHP proxy otomatik yönlendirme:</p>
          <p className="text-gray-300">🇹🇷 TR Kullanıcı → <span className="text-cyan-400">turkpaneli.com/api/v2</span></p>
          <p className="text-gray-300">🌍 Global Kullanıcı → <span className="text-blue-400">resellerprovider.com/api/v2</span></p>
        </div>
      </div>

      {/* API v2 Reference */}
      <div className="glass-panel p-5 rounded-3xl space-y-4">
        <h3 className="text-sm font-bold font-sora text-white tracking-wide uppercase flex items-center gap-1.5">
          <Globe className="w-4.5 h-4.5 text-[#00D4FF]" />
          SMM PANEL ENTEGRASYON REHBERİ (V2 ENDPOINT)
        </h3>

        <div className="p-4 bg-[#0d0d1e] rounded-2xl border border-white/5 font-mono text-[11px] leading-relaxed text-gray-300 space-y-2">
          <p className="text-purple-400 font-bold">// Bakiye Sorgulama (Balance)</p>
          <p>POST {`{API_URL}?action=balance&key={API_KEY}`}</p>

          <p className="text-purple-400 font-bold mt-3">// Servis Listesi (Services)</p>
          <p>POST {`{API_URL}?action=services&key={API_KEY}`}</p>

          <p className="text-purple-400 font-bold mt-3">// Sipariş Oluşturma (Add Order)</p>
          <p>POST {`{API_URL}?action=add&key={KEY}&service={ID}&link={LINK}&quantity={ADET}`}</p>

          <p className="text-purple-400 font-bold mt-3">// Sipariş Durum Sorgulama (Order Status)</p>
          <p>POST {`{API_URL}?action=status&key={KEY}&order={SIPARIS_ID}`}</p>
        </div>

        <div className="pt-2">
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mb-2">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Sistem Koruma Hız Kontrolü (Rate Limit API)
          </h4>
          <p className="text-[10px] text-gray-500 mb-3.5">Dakika başı maksimum istek sayısını sınırlandırın.</p>
          <div className="flex items-center gap-3.5">
            <input
              type="range"
              min="10"
              max="500"
              className="w-full h-1.5 bg-[#121226] rounded-full appearance-none accent-cyan-400"
              value={rateLimit}
              onChange={e => setRateLimit(Number(e.target.value))}
            />
            <span className="font-mono font-bold text-[#00D4FF] bg-cyan-950/20 px-3 py-1 rounded-lg shrink-0">
              {rateLimit} İstek/Dk
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
