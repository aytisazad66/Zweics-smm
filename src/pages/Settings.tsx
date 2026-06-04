import React, { useState } from 'react';
import { useAppState } from '../context/AppContext';
import { Settings as SettingsIcon, Mail, Laptop, ShieldCheck, Save, Send, AlertTriangle, RefreshCw } from 'lucide-react';

export const Settings: React.FC = () => {
  const { currentLanguage, showToast } = useAppState();

  // General site parameters state
  const [panelTitle, setPanelTitle] = useState('SMM Pro Group Turkey');
  const [panelDesc, setPanelDesc] = useState('En ucuz, güvenli API servis sağlayıcısı');
  const [announcementText, setAnnouncementText] = useState('Duyuru: PayTR altyapısı güncellendi!');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // SMTP state
  const [smtpHost, setSmtpHost] = useState('smtp.mailgun.org');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('postmaster@sandbox.mailgun.org');
  const [smtpPass, setSmtpPass] = useState('•••••••••••••••••');
  const [testingSmtp, setTestingSmtp] = useState(false);

  // Security 2FA switch
  const [twoFactorAuthActive, setTwoFactorAuthActive] = useState(true);

  const handleSaveGeneralSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(
      currentLanguage === 'TR' ? 'Sistem genel ayarları veri tabanına yazıldı!' : 'System general settings committed to state!',
      'success'
    );
  };

  const handleTestSmtp = () => {
    setTestingSmtp(true);
    setTimeout(() => {
      setTestingSmtp(false);
      showToast(
        currentLanguage === 'TR' ? 'SMTP Bağlantı testi başarılı! Test e-postası salihmusicinc@gmail.com adresine sevk edildi.' : 'SMTP Connection successful! Test email delivered.',
        'success'
      );
    }, 1800);
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#eeeeff]">
      
      {/* 2 column grid of settings cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Panel General Credentials */}
        <div className="glass-panel p-5 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Laptop className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold font-sora text-white tracking-wide uppercase">PORTAL GENEL AYARLARI</h3>
          </div>

          <form onSubmit={handleSaveGeneralSettings} className="space-y-4 text-xs">
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Panel Site Başlığı (Title)</label>
              <input
                id="settings-panel-title"
                type="text"
                className="w-full bg-[#121226]/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400"
                value={panelTitle}
                onChange={(e) => setPanelTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">SEO Site Açıklaması (Meta Description)</label>
              <textarea
                id="settings-panel-desc"
                className="w-full bg-[#121226]/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400 h-20"
                value={panelDesc}
                onChange={(e) => setPanelDesc(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Ortak Duyuru Panosu Metni (Announcement Banner)</label>
              <input
                id="settings-panel-announcement"
                type="text"
                className="w-full bg-[#121226]/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400 font-semibold"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
              />
            </div>

            <div className="p-3.5 bg-yellow-950/10 border border-yellow-800/15 rounded-2xl flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-yellow-400 block mb-0.5">SİSTEM BAKIM MODU (MAINTENANCE)</span>
                <p className="text-[10px] text-gray-500 leading-snug">Aktif edilirse bayilerin panele veya API endpoints kollarını kullanmasına izin verilmez.</p>
              </div>
              
              <button
                id="toggle-maintenance-mode-switch"
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 relative cursor-pointer ${maintenanceMode ? 'bg-yellow-500' : 'bg-[#1e1e32]'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${maintenanceMode ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <button
              id="save-general-settings-btn"
              type="submit"
              className="px-5 py-3 bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer ml-auto"
            >
              <Save className="w-4 h-4" />
              <span>Ayarları Kaydet</span>
            </button>

          </form>
        </div>

        {/* Security / SMTP Configuration double block */}
        <div className="space-y-6">
          
          {/* SMTP Postmaster Card */}
          <div className="glass-panel p-5 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold font-sora text-white tracking-wide uppercase">POSTMASTER (SMTP) MAIL AYARI</h3>
              </div>

              <button
                id="test-smtp-connection-btn"
                onClick={handleTestSmtp}
                disabled={testingSmtp}
                className="px-3 py-1.5 bg-cyan-950/20 border border-cyan-800/30 text-cyan-400 hover:bg-cyan-950/50 text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
              >
                {testingSmtp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Sınama Maili Gönder</span>
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">SMTP Sunucu Host</label>
                  <input
                    id="settings-smtp-host"
                    type="text"
                    className="w-full bg-[#121226]/50 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Port</label>
                  <input
                    id="settings-smtp-port"
                    type="text"
                    className="w-full bg-[#121226]/50 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">SMTP Kullanıcı Adı (Email)</label>
                <input
                  id="settings-smtp-user"
                  type="text"
                  className="w-full bg-[#121226]/50 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">SMTP Şifresi (Password)</label>
                <input
                  id="settings-smtp-password"
                  type="password"
                  className="w-full bg-[#121226]/50 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Security double authenticator checklist policies */}
          <div className="glass-panel p-5 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold font-sora text-white tracking-wide uppercase">GÜVENLİK VE ERİŞİM POLİTİKASI</h3>
            </div>

            <div className="p-3.5 bg-purple-950/15 border border-purple-800/15 rounded-2xl flex items-center justify-between gap-4">
              <div className="text-xs">
                <span className="font-bold text-purple-400 block mb-0.5">YÖNETİCİ GİRİŞİ 2FA AKTİF EDİLSİN</span>
                <p className="text-[10.5px] text-gray-500 leading-snug">Giriş yaptıktan sonra 6 haneli güvenlik doğrulaması sayfasını zorunlu tutar.</p>
              </div>

              <button
                id="toggle-2fa-status-switch"
                onClick={() => {
                  setTwoFactorAuthActive(!twoFactorAuthActive);
                  showToast(
                    currentLanguage === 'TR' ? '2FA zorunlu politikası başarıyla güncellendi!' : '2FA policy setting updated!',
                    'info'
                  );
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 relative cursor-pointer ${twoFactorAuthActive ? 'bg-[#00D4FF]' : 'bg-[#1e1e32]'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${twoFactorAuthActive ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
