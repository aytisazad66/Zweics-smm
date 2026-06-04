import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '../context/AppContext';
import { ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';

export const TwoFactor: React.FC = () => {
  const { setIs2FAVerified, setIsLoggedIn, currentLanguage, showToast, addNotification } = useAppState();
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(59);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Basic countdown setup
    const cl = setInterval(() => {
      setTimer(t => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(cl);
  }, []);

  const handleChange = (index: number, val: string) => {
    if (isNaN(Number(val))) return;
    const nextCode = [...code];
    nextCode[index] = val.substring(val.length - 1);
    setCode(nextCode);

    // Auto-focus next input
    if (val && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const verifyCode = (fullCode: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (fullCode === '123456') {
        setIs2FAVerified(true);
        addNotification("Admin (Salih) oturumu 2FA doğrulamasıyla başarıyla açıldı.", "security");
        showToast(currentLanguage === 'TR' ? '2FA Doğrulaması Başarılı! Kontrol Paneline hoş geldiniz.' : '2FA Authentication Passed! Opening Dashboard Console.', 'success');
      } else {
        showToast(currentLanguage === 'TR' ? 'Hatalı kod girdiniz! Lütfen test için 123456 kodunu deneyin.' : 'Invalid validation token! Please enter 123456 to test.', 'error');
        setCode(Array(6).fill(''));
        inputsRef.current[0]?.focus();
      }
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      showToast(currentLanguage === 'TR' ? 'Lütfen 6 haneli kodun tamamını doldurunuz.' : 'Please enter full 6-digit token.', 'error');
      return;
    }
    verifyCode(fullCode);
  };

  // Immediate check if user filled last box
  useEffect(() => {
    const fullCode = code.join('');
    if (fullCode.length === 6) {
      verifyCode(fullCode);
    }
  }, [code]);

  const handleResend = () => {
    if (timer > 0) return;
    setTimer(59);
    showToast(currentLanguage === 'TR' ? 'Yeni doğrulama kodu e-postanıza gönderildi!' : 'New confirmation code dispatched!', 'info');
  };

  const handleBack = () => {
    setIsLoggedIn(false);
    showToast(currentLanguage === 'TR' ? 'Giriş ekranına geri yönlendiriliyorsunuz.' : 'Returning to credentials login.', 'info');
  };

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-[#eeeeff] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-900/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-30%] right-[-10%] w-[60vw] h-[60vw] bg-cyan-900/10 rounded-full blur-[150px]" />

      <div className="w-full max-w-md bg-[#16162d]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10 animate-scale-up text-center">
        {/* Back navigation button */}
        <button
          id="back-to-login-btn"
          onClick={handleBack}
          className="absolute top-6 left-6 text-gray-500 hover:text-white flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{currentLanguage === 'TR' ? 'Geri' : 'Back'}</span>
        </button>

        <div className="p-4 rounded-2xl bg-cyan-950/20 text-[#00D4FF] border border-cyan-800/30 w-16 h-16 flex items-center justify-center mx-auto mb-6 mt-4">
          <ShieldCheck className="w-9 h-9" />
        </div>

        <h3 className="text-xl font-bold font-sora text-white tracking-wide">
          {currentLanguage === 'TR' ? 'İki Faktörlü Doğrulama' : '2-Factor Verification'}
        </h3>
        
        <p className="text-xs text-gray-400 mt-2 mx-auto max-w-sm leading-relaxed">
          {currentLanguage === 'TR' 
            ? 'Hesap güvenliğiniz için salihmusicinc@gmail.com adresine gönderilen 6 haneli 2FA doğrulama şifresini giriniz.' 
            : 'To guarantee portal hygiene, input the 6-digit dynamic authentication token dispatched to salihmusicinc@gmail.com.'}
        </p>

        {/* Test code advice block */}
        <div className="my-4 px-3 py-1.5 rounded-xl bg-purple-950/20 border border-purple-800/20 inline-block text-[10px] font-mono font-bold text-purple-400">
          PRO EXPLOIT KEY: <span className="text-white font-black underline tracking-wide">123456</span>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Numeric SMS inputs */}
          <div className="flex items-center justify-center gap-2">
            {code.map((symbol, idx) => (
              <input
                id={`2fa-token-box-${idx}`}
                key={idx}
                ref={(el) => { inputsRef.current[idx] = el; }}
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength={1}
                className="w-11 h-12 md:w-12 md:h-14 font-sora bg-[#121226]/50 border border-white/10 rounded-xl text-center text-lg md:text-xl font-bold text-white outline-none focus:border-[#00D4FF] focus:bg-[#121226]"
                value={symbol}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={loading}
              />
            ))}
          </div>

          <button
            id="verify-2fa-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#00D4FF] to-[#7B2FFF] text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-cyan-400/20 transition active:scale-95 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              <span>{currentLanguage === 'TR' ? 'Girişi Doğrula & Başlat' : 'Authorize Workspace Entry'}</span>
            )}
          </button>
        </form>

        {/* Timer notification */}
        <div className="mt-8 flex items-center justify-between text-xs text-gray-500">
          <span>{currentLanguage === 'TR' ? 'Kod alamadınız mı?' : 'Need another code?'}</span>
          <button
            id="resend-2fa-code"
            onClick={handleResend}
            disabled={timer > 0}
            className={`flex items-center gap-1 font-semibold ${timer > 0 ? 'text-gray-600 cursor-not-allowed' : 'text-cyan-400 hover:underline'}`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{timer > 0 ? `${timer}s` : (currentLanguage === 'TR' ? 'Yeniden Gönder' : 'Resend Code')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
