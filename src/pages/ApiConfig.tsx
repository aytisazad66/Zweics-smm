import React, { useState } from 'react';
import { useAppState } from '../context/AppContext';
import { ApiProvider } from '../data/mockData';
import { Shield, Key, Copy, Check, Trash2, Globe, Sparkles, RefreshCw, Sliders, Play, Edit2, Save, X } from 'lucide-react';

export const ApiConfig: React.FC = () => {
  const { 
    apiProviders, 
    setApiProviders, 
    currentLanguage, 
    updateApiProviderStatus, 
    updateApiProvider,
    testApiProvider, 
    showToast 
  } = useAppState();

  const [adminApiKey, setAdminApiKey] = useState('smm_sk_admin_827361283h12a8319fbc7c');
  const [copiedKey, setCopiedKey] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  // API Provider Inline Editing states
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editKey, setEditKey] = useState('');

  // Rate limits setting
  const [rateLimit, setRateLimit] = useState(120);

  const startEditing = (p: ApiProvider) => {
    setEditingProviderId(p.id);
    setEditName(p.name);
    setEditUrl(p.url);
    setEditKey(p.key);
  };

  const cancelEditing = () => {
    setEditingProviderId(null);
  };

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
    showToast(currentLanguage === 'TR' ? 'Yeni yönetici API Anahtarı başarıyla üretildi!' : 'New administrator API security key generated!', 'success');
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

  return (
    <div className="space-y-6 animate-fade-in text-[#eeeeff]">
      
      {/* Admin API access token card */}
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
              id="admin-api-key-display-input"
              type="text"
              readOnly
              className="bg-[#121226] border border-white/10 rounded-xl px-4 py-3 text-xs font-mono font-bold text-gray-300 w-full focus:outline-none"
              value={adminApiKey}
            />
            
            <button
              id="copy-admin-api-key-btn"
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
            id="generate-new-admin-api-key"
            onClick={handleCreateNewAdminApiKey}
            className="w-full py-3 bg-gradient-to-r from-cyan-400 to-indigo-500 text-white text-xs font-bold rounded-xl transition active:scale-95 shadow-lg shadow-cyan-950/20"
          >
            Yeni API Anahtarı Üret
          </button>
          <button
            id="revoke-admin-api-key-btn"
            onClick={() => setAdminApiKey('')}
            className="w-full py-3 border border-rose-900/30 text-rose-500 text-xs font-bold rounded-xl hover:bg-rose-950/15"
          >
            Anahtarı İptal Et (Sil)
          </button>
        </div>
      </div>

      {/* Senders Provider Interconnections list */}
      <div className="glass-panel p-5 rounded-3xl">
        <h3 className="text-sm font-bold font-sora text-white tracking-wide uppercase mb-4">
          SAĞLAYICI (EXTERNAL PROVIDER) API BAĞLANTILARI
        </h3>

        <div className="space-y-4">
          {apiProviders.map(provider => {
            const isEditing = editingProviderId === provider.id;
            return isEditing ? (
              <div 
                id={`provider-card-edit-${provider.id}`}
                key={provider.id} 
                className="p-5 bg-[#0f0f20]/90 border border-cyan-400/30 rounded-2xl space-y-4 animate-fade-in"
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-[10px] font-bold text-cyan-400 font-mono tracking-wider flex items-center gap-1.5 uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span>{currentLanguage === 'TR' ? 'API BAĞLANTISINI DÜZENLE' : 'EDIT API CONNECTION'}</span>
                  </span>
                  <span className="text-[9px] font-mono font-bold text-gray-500 bg-gray-950/40 px-2 py-0.5 rounded border border-white/5">{provider.id}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-400">{currentLanguage === 'TR' ? 'Sağlayıcı Adı (İsim)' : 'Provider Name'}</label>
                    <input
                      type="text"
                      className="w-full bg-[#121226] border border-white/10 rounded-xl px-3-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-cyan-500 transition"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-400">{currentLanguage === 'TR' ? 'API Endpoint URL' : 'API Endpoint URL'}</label>
                    <input
                      type="text"
                      className="w-full bg-[#121226] border border-white/10 rounded-xl px-3-4 py-2.5 text-xs font-mono font-bold text-gray-300 focus:outline-none focus:border-cyan-500 transition"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-400">{currentLanguage === 'TR' ? 'API Key (Token)' : 'API Key'}</label>
                    <input
                      type="text"
                      className="w-full bg-[#121226] border border-white/10 rounded-xl px-3-4 py-2.5 text-xs font-mono font-bold text-yellow-400 focus:outline-none focus:border-yellow-400 transition"
                      placeholder="Pasted SMM Key"
                      value={editKey}
                      onChange={(e) => setEditKey(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2 border-t border-white/5">
                  <button
                    onClick={cancelEditing}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-[11px] font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition active:scale-95"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>{currentLanguage === 'TR' ? 'İptal' : 'Cancel'}</span>
                  </button>
                  <button
                    onClick={() => handleSaveProvider(provider.id)}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[11px] font-bold rounded-xl shadow cursor-pointer flex items-center gap-1.5 transition active:scale-95"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{currentLanguage === 'TR' ? 'Kaydet' : 'Save'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div 
                id={`provider-card-item-${provider.id}`}
                key={provider.id} 
                className="p-4 bg-[#121226]/60 border border-white/5 rounded-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 transition hover:border-cyan-400/20"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full shadow-md ${provider.status ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <h4 className="text-xs font-black text-white">{provider.name}</h4>
                    <span className="text-[10px] bg-purple-950/40 text-purple-400 border border-purple-800/20 px-2 py-0.5 rounded-lg font-mono font-bold">
                      {provider.id === 'API_TURKPANELI' ? '⚡ TURK_PANELI_SYSTEM' : 'API_KEY SAVED'}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-500 font-medium truncate">API URL: <span className="font-semibold text-gray-300 font-mono select-all">{provider.url}</span></p>
                  <p className="text-[10px] text-gray-400">
                    {currentLanguage === 'TR' ? 'Mevcut Sağlayıcı Bakiyesi:' : 'Current Provider Balance:'} <strong className="text-[#00D4FF] font-mono">{provider.balance !== undefined ? `${provider.balance.toFixed(2)} ₺` : 'N/A'}</strong>
                  </p>
                </div>

                {/* Status toggle & Test triggers */}
                <div className="flex items-center gap-3 justify-between w-full lg:w-auto border-t lg:border-none border-white/5 pt-3 lg:pt-0">
                  
                  {/* Edit credentials button */}
                  <button
                    onClick={() => startEditing(provider)}
                    className="p-2 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/30 text-cyan-400 rounded-xl transition active:scale-95 cursor-pointer flex items-center gap-1 text-[10px] font-bold px-3 py-1.5"
                    title={currentLanguage === 'TR' ? 'Sağlayıcıyı Düzenle' : 'Edit Provider'}
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>{currentLanguage === 'TR' ? 'Düzenle' : 'Edit'}</span>
                  </button>

                  {/* Status selector toggle switch */}
                  <button
                    id={`toggle-provider-status-switch-${provider.id}`}
                    onClick={() => updateApiProviderStatus(provider.id, !provider.status)}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors relative cursor-pointer ${provider.status ? 'bg-[#00D4FF]' : 'bg-[#1e1e32]'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${provider.status ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>

                  <button
                    id={`test-provider-connection-btn-${provider.id}`}
                    onClick={() => handleRunDiagnosticTest(provider.id)}
                    disabled={testingId === provider.id}
                    className="px-4 py-2 bg-indigo-950/20 border border-indigo-800/30 text-indigo-400 hover:bg-indigo-950 hover:text-indigo-300 text-[10px] font-bold rounded-xl flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {testingId === provider.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{currentLanguage === 'TR' ? 'Test Et' : 'Test API'}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* API v2 Reference Document card */}
      <div className="glass-panel p-5 rounded-3xl space-y-4">
        <h3 className="text-sm font-bold font-sora text-white tracking-wide uppercase flex items-center gap-1.5">
          <Globe className="w-4.5 h-4.5 text-[#00D4FF]" />
          <span>SMM PANEL ENTEGRASYON REHBERI (V2 ENDPOINT)</span>
        </h3>

        <p className="text-[11.5px] text-gray-400 leading-relaxed">
          Kendi panelinize harici bayiler çekmek için aşağıda belirtilen standard SMM v2 JSON endpoints yollarını sisteme entegre edebilirsiniz. Entegrasyon dokümanlarımızın detaylarına <a href="#docs" className="text-cyan-400 hover:underline inline-block font-semibold">https://api.docs.smmpro.net</a> adresinden de erişebilirsiniz.
        </p>

        {/* Code mockup endpoints layout */}
        <div className="p-4 bg-[#0d0d1e] rounded-2xl border border-white/5 font-mono text-[11px] leading-relaxed text-gray-300">
          <p className="text-purple-400 font-bold">// 1. Bakiye sorgulama (Balance Query)</p>
          <p><span className="text-emerald-400 font-bold">GET</span> {`{APP_URL}/api/v2?action=balance&key={API_KEY}`}</p>
          
          <p className="text-purple-400 font-bold mt-3.5">// 2. Sipariş oluşturma (Create Order)</p>
          <p><span className="text-emerald-400 font-bold">POST</span> {`{APP_URL}/api/v2?action=add&key={API_KEY}&service={SERVIS_ID}&link={LINK}&quantity={ADET}`}</p>
          
          <p className="text-purple-400 font-bold mt-3.5">// 3. Sipariş durum sorgulama (Query Order Status)</p>
          <p><span className="text-emerald-400 font-bold">GET</span> {`{APP_URL}/api/v2?action=status&key={API_KEY}&order={SİPARİŞ_ID}`}</p>
        </div>

        {/* Rate limited sliders */}
        <div className="pt-2">
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mb-2">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sistem Koruma Hız Kontrolü (Rate Limit API)</span>
          </h4>
          <p className="text-[10px] text-gray-500 mb-3.5">Operatör spam isteklerini engellemek için dakika başı maks yükü sınırlandırın.</p>
          
          <div className="flex items-center gap-3.5">
            <input
              id="set-rate-limit-slider"
              type="range"
              min="10"
              max="500"
              className="w-full h-1.5 bg-[#121226] rounded-full appearance-none accent-cyan-400"
              value={rateLimit}
              onChange={(e) => setRateLimit(Number(e.target.value))}
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
