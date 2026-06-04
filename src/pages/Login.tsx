import React, { useState } from 'react';
import { useAppState } from '../context/AppContext';
import { Lock, Mail, Eye, EyeOff, ShieldAlert, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const { setIsLoggedIn, setIs2FAVerified, currentLanguage, showToast } = useAppState();
  const [email, setEmail] = useState('salihmusicinc@gmail.com');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast(currentLanguage === 'TR' ? 'Lütfen tüm alanları doldurunuz.' : 'Please fill in all fields.', 'error');
      return;
    }

    setLoading(true);
    // Simulate API authorization round-trip
    setTimeout(() => {
      setLoading(false);
      setIsLoggedIn(true);
      showToast(
        currentLanguage === 'TR' ? 'Giriş başarılı! İki faktörlü doğrulama (2FA) kodu gönderildi.' : 'Credentials verified! Redirecting to 2FA authentication screen.',
        'success'
      );
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-[#eeeeff] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Visual glowing canvas elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-10%] w-[60vw] h-[60vw] bg-cyan-900/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#16162d]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10 animate-scale-up">
        {/* Banner header logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00D4FF] to-[#7B2FFF] flex items-center justify-center font-bold text-white shadow-xl shadow-cyan-400/20 text-xl mx-auto mb-4 hover:rotate-12 transition duration-300">
            SMM
          </div>
          <h2 className="text-2xl font-bold font-sora text-white tracking-wide">
            {currentLanguage === 'TR' ? 'Yönetim Paneli Girişi' : 'Admin Console Login'}
          </h2>
          <p className="text-sm text-gray-500 mt-1.5 font-medium">
            {currentLanguage === 'TR' ? 'SMM Pro Panel v2.1 Güvenlik Portalı' : 'SMM Pro Portal security credentials check'}
          </p>
        </div>

        {/* Warning notification regarding security IP log */}
        <div className="mb-6 p-3 bg-indigo-950/20 border border-indigo-800/30 rounded-2xl text-[11px] text-gray-400 leading-relaxed flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-[#00D4FF] flex-shrink-0 mt-0.5" />
          <span>
            {currentLanguage === 'TR' 
              ? 'Güvenlik Protokolü: Erişim işlemleriniz IP adresinizle (2026-06-03) loglanır. Lütfen şüpheli hareketlerde bulunmayınız.' 
              : 'Security Protocol: Your admin actions are tracked along with your IP (2026-06-03). Unauthorized sessions terminate instantly.'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 font-sora block">
              {currentLanguage === 'TR' ? 'Yönetici E-Posta Adresi' : 'Admin E-Mail Address'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                id="login-email-input"
                type="email"
                required
                className="w-full bg-[#121226]/60 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:bg-[#121226]"
                placeholder="örn: salihmusicinc@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-400 font-sora">
                {currentLanguage === 'TR' ? 'Şifre' : 'Password'}
              </label>
              <a href="#forgot" className="text-[11px] font-semibold text-cyan-400 hover:underline">
                {currentLanguage === 'TR' ? 'Şifremi Unuttum' : 'Forgot Password?'}
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full bg-[#121226]/60 border border-white/10 rounded-xl py-3.5 pl-11 pr-11 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:bg-[#121226]"
                placeholder="•••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                id="toggle-login-password-vis"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:text-white text-gray-500 transition duration-150"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me trigger */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                id="remember-me-checkbox"
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

          {/* Secure login action */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#00D4FF] to-[#7B2FFF] text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-cyan-400/20 active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
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

        {/* Info panel */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-gray-600">
          <span>Yalnızca yetkilendirilmiş SMM Panel operatörleri erişebilir.</span>
        </div>
      </div>
    </div>
  );
};
