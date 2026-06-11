import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '../context/AppContext';
import { ShieldCheck, ArrowLeft, RefreshCw, Mail } from 'lucide-react';

export const TwoFactor: React.FC = () => {
  const { setIs2FAVerified, setIsLoggedIn, currentLanguage, showToast, addNotification, smtpConfig } = useAppState();
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [timer, setTimer] = useState(120);
  const [codeSent, setCodeSent] = useState(false);
  const [sendError, setSendError] = useState('');
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const generatedCodeRef = useRef<string>('');

  const adminEmail = smtpConfig.adminEmail || smtpConfig.user;
  const smtpReady = !!(smtpConfig.host && smtpConfig.user && smtpConfig.pass);

  const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  const sendCodeByEmail = async (codeToSend: string) => {
    if (!smtpReady || !adminEmail) return false;
    try {
      const res = await fetch('/api/mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: adminEmail,
          subject: 'Bor Media — 2FA Doğrulama Kodunuz',
          body: `
            <div style="font-family:sans-serif;background:#0F0F1A;color:#eeeeff;padding:32px;border-radius:16px;max-width:480px;margin:auto;">
              <div style="text-align:center;margin-bottom:24px;">
                <div style="width:56px;height:56px;background:linear-gradient(135deg,#00D4FF,#7B2FFF);border-radius:14px;display:inline-flex;align-items:center;justify-content:center;font-weight:bold;font-size:18px;color:#fff;">BM</div>
              </div>
              <h2 style="text-align:center;color:#ffffff;margin-bottom:8px;">İki Faktörlü Doğrulama</h2>
              <p style="text-align:center;color:#9999bb;font-size:13px;">Yönetici paneline giriş için doğrulama kodunuz:</p>
              <div style="text-align:center;margin:28px 0;">
                <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#00D4FF;">${codeToSend}</span>
              </div>
              <p style="text-align:center;color:#666688;font-size:11px;">Bu kod 2 dakika içinde geçerliliğini yitirir.<br>Siz talep etmediyseniz bu maili görmezden gelin.</p>
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
      return data.ok === true;
    } catch {
      return false;
    }
  };

  const initCode = async () => {
    const newCode = generateCode();
    generatedCodeRef.current = newCode;
    sessionStorage.setItem('bm_2fa_code', newCode);
    sessionStorage.setItem('bm_2fa_expiry', (Date.now() + 120_000).toString());

    if (smtpReady && adminEmail) {
      setSending(true);
      setSendError('');
      const ok = await sendCodeByEmail(newCode);
      setSending(false);
      if (ok) {
        setCodeSent(true);
        setTimer(120);
        showToast(`Doğrulama kodu ${adminEmail} adresine gönderildi!`, 'success');
      } else {
        setSendError('E-posta gönderilemedi. Ayarlar → SMTP yapılandırmasını kontrol edin.');
        setCodeSent(false);
      }
    } else {
      setCodeSent(false);
    }
  };

  useEffect(() => {
    initCode();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const cl = setInterval(() => setTimer(t => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(cl);
  }, []);

  const handleChange = (index: number, val: string) => {
    if (isNaN(Number(val))) return;
    const next = [...code];
    next[index] = val.substring(val.length - 1);
    setCode(next);
    if (val && index < 5) inputsRef.current[index + 1]?.focus();
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
      const stored = sessionStorage.getItem('bm_2fa_code');
      const expiry = parseInt(sessionStorage.getItem('bm_2fa_expiry') || '0');
      const isExpired = Date.now() > expiry;

      if (isExpired) {
        showToast('Kodun süresi doldu! Lütfen yeni kod isteyin.', 'error');
        setCode(Array(6).fill(''));
        inputsRef.current[0]?.focus();
        return;
      }

      if (stored && fullCode === stored) {
        sessionStorage.removeItem('bm_2fa_code');
        sessionStorage.removeItem('bm_2fa_expiry');
        setIs2FAVerified(true);
        addNotification('Admin oturumu 2FA ile doğrulandı.', 'security');
        showToast('2FA Doğrulaması Başarılı! Kontrol Paneline hoş geldiniz.', 'success');
      } else {
        showToast('Hatalı kod! Lütfen e-postanızı kontrol edin.', 'error');
        setCode(Array(6).fill(''));
        inputsRef.current[0]?.focus();
      }
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      showToast('Lütfen 6 haneli kodun tamamını doldurunuz.', 'error');
      return;
    }
    verifyCode(fullCode);
  };

  useEffect(() => {
    const fullCode = code.join('');
    if (fullCode.length === 6) verifyCode(fullCode);
  }, [code]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleResend = async () => {
    if (timer > 0) return;
    setTimer(120);
    setCode(Array(6).fill(''));
    await initCode();
  };

  const maskEmail = (email: string) => {
    if (!email) return '';
    const [user, domain] = email.split('@');
    return user.slice(0, 2) + '***@' + domain;
  };

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-[#eeeeff] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-900/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-30%] right-[-10%] w-[60vw] h-[60vw] bg-cyan-900/10 rounded-full blur-[150px]" />

      <div className="w-full max-w-md bg-[#16162d]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10 animate-scale-up text-center">
        <button
          onClick={() => { setIsLoggedIn(false); showToast('Giriş ekranına döndürülüyorsunuz.', 'info'); }}
          className="absolute top-6 left-6 text-gray-500 hover:text-white flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Geri</span>
        </button>

        <div className="p-4 rounded-2xl bg-cyan-950/20 text-[#00D4FF] border border-cyan-800/30 w-16 h-16 flex items-center justify-center mx-auto mb-6 mt-4">
          <ShieldCheck className="w-9 h-9" />
        </div>

        <h3 className="text-xl font-bold font-sora text-white tracking-wide">
          {currentLanguage === 'TR' ? 'İki Faktörlü Doğrulama' : '2-Factor Verification'}
        </h3>

        {sending ? (
          <div className="mt-4 flex flex-col items-center gap-2 text-gray-400 text-xs">
            <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
            <span>E-posta gönderiliyor...</span>
          </div>
        ) : sendError ? (
          <div className="mt-4 p-3 bg-rose-950/30 border border-rose-800/30 rounded-xl text-xs text-rose-400 text-left">
            ⚠️ {sendError}
          </div>
        ) : codeSent && adminEmail ? (
          <p className="text-xs text-gray-400 mt-3 mx-auto max-w-sm leading-relaxed flex items-center justify-center gap-2">
            <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
            <span><strong className="text-white">{maskEmail(adminEmail)}</strong> adresine 6 haneli kod gönderildi.</span>
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="p-3 bg-amber-950/30 border border-amber-700/40 rounded-xl text-xs text-amber-300 text-left leading-relaxed">
              ⚠️ SMTP henüz yapılandırılmamış. Panele girdikten sonra <strong>Ayarlar → SMTP</strong> kısmından e-posta ayarlarınızı tamamlayın.
            </div>
            <div className="p-4 bg-[#0f0f1d] border border-white/10 rounded-2xl text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold">Tek Kullanımlık Geçici Kod</p>
              <p className="text-3xl font-black tracking-[10px] text-cyan-300 font-mono select-all">
                {generatedCodeRef.current}
              </p>
              <p className="text-[10px] text-gray-600 mt-2">Bu kod 2 dakika geçerlidir • SMTP kurulunca e-postayla gelecek</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="flex items-center justify-center gap-2">
            {code.map((symbol, idx) => (
              <input
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
                disabled={loading || sending}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || sending}
            className="w-full py-3.5 bg-gradient-to-r from-[#00D4FF] to-[#7B2FFF] text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-cyan-400/20 transition active:scale-95 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              <span>Girişi Doğrula & Başlat</span>
            )}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-between text-xs text-gray-500">
          <span>Kod gelmedi mi?</span>
          <button
            onClick={handleResend}
            disabled={timer > 0 || sending}
            className={`flex items-center gap-1 font-semibold ${timer > 0 || sending ? 'text-gray-600 cursor-not-allowed' : 'text-cyan-400 hover:underline cursor-pointer'}`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{timer > 0 ? `${timer}s` : 'Yeniden Gönder'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
