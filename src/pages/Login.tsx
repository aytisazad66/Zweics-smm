import React, { useState } from 'react';
import { useAppState } from '../context/AppContext';
import { Lock, Mail, Eye, EyeOff, ShieldAlert, Sparkles, KeyRound } from 'lucide-react';

export const Login: React.FC = () => {
  const { setIsLoggedIn, currentLanguage, showToast, smtpConfig } = useAppState();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Lütfen tüm alanları doldurunuz.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.ok) {
        setIsLoggedIn(true);
        showToast(
          currentLanguage === 'TR'
            ? 'Giriş başarılı! 2FA kodu e-postanıza gönderildi.'
            : 'Credentials verified! 2FA code sent to your email.',
          'success'
        );
      } else {
        showToast(data.message || 'E-posta veya şifre hatalı.', 'error');
      }
    } catch {
      showToast('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const target = smtpConfig.adminEmail || smtpConfig.user;
    if (!target) {
      showToast('Şifre hatırlatma için önce Ayarlar → SMTP kısmına Yönetici E-Posta girin.', 'error');
      return;
    }
    if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
      showToast('Şifre hatırlatma için SMTP ayarlarını yapılandırın.', 'error');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await fetch('/api/mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: target,
          subject: 'Bor Media — Yönetici Panel Erişimi',
          body: `
            <div style="font-family:sans-serif;background:#0F0F1A;color:#eeeeff;padding:32px;border-radius:16px;max-width:480px;margin:auto;">
              <div style="text-align:center;margin-bottom:24px;">
                <div style="width:56px;height:56px;background:linear-gradient(135deg,#00D4FF,#7B2FFF);border-radius:14px;display:inline-flex;align-items:center;justify-content:center;font-weight:bold;font-size:18px;color:#fff;">BM</div>
              </div>
              <h2 style="text-align:center;color:#ffffff;">Şifremi Unuttum</h2>
              <p style="color:#9999bb;font-size:13px;">Yönetici şifrenizi admin paneli içinden <strong>Ayarlar → Yönetici Şifresi</strong> bölümünden değiştirebilirsiniz.</p>
              <div style="background:#1a1a2e;border:1px solid #333366;border-radius:12px;padding:16px;margin:20px 0;text-align:center;">
                <code style="color:#00D4FF;font-size:14px;letter-spacing:1px;">Sitenin adresine #bm-yonetici ekleyin</code>
              </div>
              <p style="color:#666688;font-size:11px;text-align:center;">Örnek: https://siteadim.com/#bm-yonetici</p>
              <hr style="border-color:#ffffff11;margin:24px 0;" />
              <p style="text-align:center;color:#444466;font-size:10px;">Bor Media SMM Panel — Güvenlik Sistemi</p>
            </div>
          `,
          smtp_host: smtpConfig.host,
          smtp_port: smtpConfig.port,
          smtp_user: smtpConfig.user,
          smtp_pass: smtpConfig.pass,
          from_name: smtpConfig.fromName || 'Bor Media'
        })
      });
      const data = await res.json();
      if (data.ok) {
        showToast(`Erişim bilgileri ${target} adresine gönderildi!`, 'success');
      } else {
        showToast(`Mail gönderilemedi: ${data.message}`, 'error');
      }
    } catch {
      showToast('E-posta gönderilemedi, ağ hatası.', 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-[#eeeeff] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-10%] w-[60vw] h-[60vw] bg-cyan-900/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#16162d]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10 animate-scale-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00D4FF] to-[#7B2FFF] flex items-center justify-center font-bold text-white shadow-xl shadow-cyan-400/20 text-xl mx-auto mb-4 hover:rotate-12 transition duration-300">
            SMM
          </div>
          <h2 className="text-2xl font-bold font-sora text-white tracking-wide">
            {currentLanguage === 'TR' ? 'Yönetim Paneli Girişi' : 'Admin Console Login'}
          </h2>
          <p className="text-sm text-gray-500 mt-1.5 font-medium">
            {currentLanguage === 'TR' ? 'Bor Media Panel v2.1 Güvenlik Portalı' : 'Bor Media Panel v2.1 Security Portal'}
          </p>
        </div>

        <div className="mb-6 p-3 bg-indigo-950/20 border border-indigo-800/30 rounded-2xl text-[11px] text-gray-400 leading-relaxed flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-[#00D4FF] flex-shrink-0 mt-0.5" />
          <span>
            {currentLanguage === 'TR'
              ? 'Güvenlik Protokolü: Erişim işlemleriniz IP adresinizle loglanır. Lütfen şüpheli hareketlerde bulunmayınız.'
              : 'Security Protocol: Your admin actions are tracked along with your IP. Unauthorized sessions terminate instantly.'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 font-sora block">
              {currentLanguage === 'TR' ? 'Yönetici E-Posta Adresi' : 'Admin E-Mail Address'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                className="w-full bg-[#121226]/60 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:bg-[#121226]"
                placeholder="admin@bormedia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-400 font-sora">
                {currentLanguage === 'TR' ? 'Şifre' : 'Password'}
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={forgotLoading}
                className="text-[11px] font-semibold text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {forgotLoading ? (
                  <span className="w-3 h-3 border border-cyan-400 border-t-transparent rounded-full animate-spin inline-block" />
                ) : (
                  <KeyRound className="w-3 h-3" />
                )}
                {currentLanguage === 'TR' ? 'Şifremi Unuttum' : 'Forgot Password?'}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full bg-[#121226]/60 border border-white/10 rounded-xl py-3.5 pl-11 pr-11 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:bg-[#121226]"
                placeholder="•••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:text-white text-gray-500 transition duration-150 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 border-white/10 bg-[#121226] checked:bg-cyan-500 outline-none rounded appearance-none checked:before:content-['✓'] checked:before:text-white checked:before:flex checked:before:items-center checked:before:justify-center checked:before:text-[9px] relative cursor-pointer"
              />
              <span className="text-xs text-gray-400 group-hover:text-white transition duration-150">
                {currentLanguage === 'TR' ? 'Beni Hatırla' : 'Remember Session'}
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#00D4FF] to-[#7B2FFF] text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-cyan-400/20 active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{currentLanguage === 'TR' ? 'Sistem Yetkisiyle Bağlan' : 'Authenticate Console'}</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-gray-600">
          <span>Yalnızca yetkilendirilmiş SMM Panel operatörleri erişebilir.</span>
        </div>
      </div>
    </div>
  );
};
