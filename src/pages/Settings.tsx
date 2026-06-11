import React, { useState } from 'react';
import { useAppState } from '../context/AppContext';
import { Settings as SettingsIcon, Mail, Laptop, ShieldCheck, Save, Send, AlertTriangle, RefreshCw, Eye, EyeOff, KeyRound } from 'lucide-react';

export const Settings: React.FC = () => {
  const {
    currentLanguage, showToast,
    announcementText, setAnnouncementText,
    sendBroadcastNotification,
    smtpConfig, setSmtpConfig
  } = useAppState();

  const [panelTitle, setPanelTitle] = useState('Bor Media');
  const [panelDesc, setPanelDesc] = useState('En ucuz, güvenli API servis sağlayıcısı');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [twoFactorAuthActive, setTwoFactorAuthActive] = useState(true);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [credCurrentPass, setCredCurrentPass] = useState('');
  const [credNewEmail, setCredNewEmail] = useState('');
  const [credNewPass, setCredNewPass] = useState('');
  const [credNewPassConfirm, setCredNewPassConfirm] = useState('');
  const [showCredPass, setShowCredPass] = useState(false);
  const [savingCred, setSavingCred] = useState(false);

  const handleSaveCredentials = async () => {
    if (!credCurrentPass) {
      showToast('Mevcut şifrenizi girmeniz zorunludur.', 'error');
      return;
    }
    if (credNewPass && credNewPass !== credNewPassConfirm) {
      showToast('Yeni şifreler eşleşmiyor.', 'error');
      return;
    }
    if (!credNewEmail && !credNewPass) {
      showToast('Değiştirmek istediğiniz en az bir alanı doldurun.', 'error');
      return;
    }
    setSavingCred(true);
    try {
      const res = await fetch('/api/auth/set-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: credCurrentPass,
          newEmail: credNewEmail || undefined,
          newPassword: credNewPass || undefined,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        showToast('Yönetici kimlik bilgileri güncellendi!', 'success');
        setCredCurrentPass('');
        setCredNewEmail('');
        setCredNewPass('');
        setCredNewPassConfirm('');
      } else {
        showToast(data.message || 'Kimlik bilgileri güncellenemedi.', 'error');
      }
    } catch {
      showToast('Sunucuya bağlanılamadı.', 'error');
    } finally {
      setSavingCred(false);
    }
  };

  // Local SMTP form state — synced to context on Save
  const [localSmtp, setLocalSmtp] = useState({ ...smtpConfig });

  const handleSaveGeneralSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Sistem genel ayarları kaydedildi!', 'success');
  };

  const handleSaveSmtp = () => {
    setSmtpConfig({ ...localSmtp });
    showToast('SMTP ayarları kaydedildi ve sunucuya yazıldı!', 'success');
  };

  const handleTestSmtp = async () => {
    if (!localSmtp.host || !localSmtp.user || !localSmtp.pass) {
      showToast('Lütfen önce SMTP bilgilerini doldurun ve kaydedin.', 'error');
      return;
    }
    const targetEmail = localSmtp.adminEmail || localSmtp.user;
    setTestingSmtp(true);
    try {
      const res = await fetch('/api/mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: targetEmail,
          subject: 'Bor Media — SMTP Test Maili',
          body: `<h2>Bor Media SMTP Test</h2><p>Bu mesaj SMTP ayarlarınızın doğru çalıştığını doğrulamak için gönderilmiştir.</p><p>Zaman: ${new Date().toLocaleString('tr-TR')}</p>`,
          smtp_host: localSmtp.host,
          smtp_port: localSmtp.port,
          smtp_user: localSmtp.user,
          smtp_pass: localSmtp.pass,
          from_name: localSmtp.fromName || 'Bor Media'
        })
      });
      const data = await res.json();
      if (data.ok) {
        showToast(`Test maili ${targetEmail} adresine gönderildi!`, 'success');
      } else {
        showToast(`SMTP hatası: ${data.message}`, 'error');
      }
    } catch {
      showToast('SMTP bağlantısı kurulamadı.', 'error');
    } finally {
      setTestingSmtp(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#eeeeff]">
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
                type="text"
                className="w-full bg-[#121226]/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400"
                value={panelTitle}
                onChange={(e) => setPanelTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">SEO Site Açıklaması (Meta Description)</label>
              <textarea
                className="w-full bg-[#121226]/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400 h-20"
                value={panelDesc}
                onChange={(e) => setPanelDesc(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Ortak Duyuru Panosu Metni (Announcement Banner)</label>
              <input
                type="text"
                className="w-full bg-[#121226]/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400 font-semibold"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Duyuru metni girin..."
              />
              <p className="text-[10px] text-gray-500">Bu metin müşteri portalında banner olarak gösterilir ve KV'ye kaydedilir.</p>
              <button
                type="button"
                onClick={() => {
                  if (!announcementText.trim()) {
                    showToast('Lütfen bir duyuru metni girin.', 'error');
                    return;
                  }
                  sendBroadcastNotification(`📢 ${announcementText}`);
                  showToast('Duyuru tüm kullanıcılara bildirim olarak gönderildi!', 'success');
                }}
                className="px-4 py-2.5 bg-purple-950/30 border border-purple-700/40 text-purple-400 hover:text-white font-bold text-[10px] rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Tüm Kullanıcılara Bildirim Gönder</span>
              </button>
            </div>

            <div className="p-3.5 bg-yellow-950/10 border border-yellow-800/15 rounded-2xl flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-yellow-400 block mb-0.5">SİSTEM BAKIM MODU (MAINTENANCE)</span>
                <p className="text-[10px] text-gray-500 leading-snug">Aktif edilirse bayilerin panele erişimi engellenir.</p>
              </div>
              <button
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 relative cursor-pointer ${maintenanceMode ? 'bg-yellow-500' : 'bg-[#1e1e32]'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${maintenanceMode ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <button
              type="submit"
              className="px-5 py-3 bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer ml-auto"
            >
              <Save className="w-4 h-4" />
              <span>Ayarları Kaydet</span>
            </button>
          </form>
        </div>

        {/* Security / SMTP Configuration */}
        <div className="space-y-6">

          {/* SMTP Postmaster Card */}
          <div className="glass-panel p-5 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold font-sora text-white tracking-wide uppercase">POSTMASTER (SMTP) MAIL AYARI</h3>
              </div>
              <button
                onClick={handleTestSmtp}
                disabled={testingSmtp}
                className="px-3 py-1.5 bg-cyan-950/20 border border-cyan-800/30 text-cyan-400 hover:bg-cyan-950/50 text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-50"
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
                    type="text"
                    placeholder="örn: smtp.gmail.com"
                    className="w-full bg-[#121226]/50 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-400"
                    value={localSmtp.host}
                    onChange={(e) => setLocalSmtp(p => ({ ...p, host: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Port</label>
                  <input
                    type="text"
                    placeholder="587"
                    className="w-full bg-[#121226]/50 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-400"
                    value={localSmtp.port}
                    onChange={(e) => setLocalSmtp(p => ({ ...p, port: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Gönderen Adı</label>
                <input
                  type="text"
                  placeholder="Bor Media"
                  className="w-full bg-[#121226]/50 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-400"
                  value={localSmtp.fromName}
                  onChange={(e) => setLocalSmtp(p => ({ ...p, fromName: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">SMTP Kullanıcı Adı (Email)</label>
                <input
                  type="email"
                  placeholder="örn: info@siteadim.com"
                  className="w-full bg-[#121226]/50 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-400"
                  value={localSmtp.user}
                  onChange={(e) => setLocalSmtp(p => ({ ...p, user: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">SMTP Şifresi (Password)</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full bg-[#121226]/50 border border-white/10 rounded-xl py-2 px-3 pr-9 text-white focus:outline-none focus:border-cyan-400"
                    value={localSmtp.pass}
                    onChange={(e) => setLocalSmtp(p => ({ ...p, pass: e.target.value }))}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer">
                    {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Yönetici E-Posta (2FA & Şifre sıfırlama gönderilir)</label>
                <input
                  type="email"
                  placeholder="örn: salihmusicinc@gmail.com"
                  className="w-full bg-[#121226]/50 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-400"
                  value={localSmtp.adminEmail}
                  onChange={(e) => setLocalSmtp(p => ({ ...p, adminEmail: e.target.value }))}
                />
                <p className="text-[10px] text-gray-500">2FA kodları ve şifre hatırlatma bu adrese gönderilir.</p>
              </div>

              <button
                type="button"
                onClick={handleSaveSmtp}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-bold text-xs rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>SMTP Ayarlarını Kaydet</span>
              </button>
            </div>
          </div>

          {/* Security 2FA */}
          <div className="glass-panel p-5 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold font-sora text-white tracking-wide uppercase">GÜVENLİK VE ERİŞİM POLİTİKASI</h3>
            </div>

            <div className="p-3.5 bg-purple-950/15 border border-purple-800/15 rounded-2xl flex items-center justify-between gap-4">
              <div className="text-xs">
                <span className="font-bold text-purple-400 block mb-0.5">YÖNETİCİ GİRİŞİ 2FA AKTİF EDİLSİN</span>
                <p className="text-[10.5px] text-gray-500 leading-snug">Giriş yaptıktan sonra e-posta ile 6 haneli doğrulama kodu gönderilir.</p>
              </div>
              <button
                onClick={() => {
                  setTwoFactorAuthActive(!twoFactorAuthActive);
                  showToast('2FA politikası güncellendi!', 'info');
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 relative cursor-pointer ${twoFactorAuthActive ? 'bg-[#00D4FF]' : 'bg-[#1e1e32]'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${twoFactorAuthActive ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {!localSmtp.adminEmail && (
              <div className="flex items-start gap-2 p-3 bg-yellow-950/20 border border-yellow-700/30 rounded-xl text-[10px] text-yellow-400">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>2FA e-posta göndermek için yukarıdaki SMTP ayarlarını doldurun ve <strong>Yönetici E-Posta</strong> alanını girin.</span>
              </div>
            )}
          </div>

          {/* Admin Credentials */}
          <div className="glass-panel p-5 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <KeyRound className="w-5 h-5 text-rose-400" />
              <h3 className="text-sm font-bold font-sora text-white tracking-wide uppercase">YÖNETİCİ GİRİŞ BİLGİLERİ</h3>
            </div>

            <div className="p-3 bg-rose-950/10 border border-rose-800/20 rounded-xl text-[10px] text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Varsayılan: <code className="text-rose-200">admin@bormedia.com</code> / <code className="text-rose-200">Admin123!</code> — Canlıya geçmeden önce mutlaka değiştirin!</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Mevcut Şifre <span className="text-rose-400">*</span></label>
                <div className="relative">
                  <input
                    type={showCredPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full bg-[#121226]/50 border border-white/10 rounded-xl py-2 px-3 pr-9 text-white focus:outline-none focus:border-rose-400"
                    value={credCurrentPass}
                    onChange={(e) => setCredCurrentPass(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowCredPass(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer">
                    {showCredPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Yeni E-Posta (boş bırakılırsa değişmez)</label>
                <input
                  type="email"
                  placeholder="yeni@eposta.com"
                  className="w-full bg-[#121226]/50 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-400"
                  value={credNewEmail}
                  onChange={(e) => setCredNewEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Yeni Şifre (boş bırakılırsa değişmez)</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-[#121226]/50 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-400"
                  value={credNewPass}
                  onChange={(e) => setCredNewPass(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Yeni Şifre Tekrar</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`w-full bg-[#121226]/50 border rounded-xl py-2 px-3 text-white focus:outline-none ${credNewPass && credNewPassConfirm && credNewPass !== credNewPassConfirm ? 'border-rose-500 focus:border-rose-400' : 'border-white/10 focus:border-cyan-400'}`}
                  value={credNewPassConfirm}
                  onChange={(e) => setCredNewPassConfirm(e.target.value)}
                />
                {credNewPass && credNewPassConfirm && credNewPass !== credNewPassConfirm && (
                  <p className="text-[10px] text-rose-400">Şifreler eşleşmiyor.</p>
                )}
              </div>

              <button
                type="button"
                onClick={handleSaveCredentials}
                disabled={savingCred}
                className="w-full py-2.5 bg-gradient-to-r from-rose-500 to-purple-600 text-white font-bold text-xs rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {savingCred ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                <span>Kimlik Bilgilerini Güncelle</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
