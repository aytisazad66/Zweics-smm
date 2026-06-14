import React, { useState, useMemo, useEffect } from 'react';
import { useAppState } from '../context/AppContext';
import { BorMediaLogo } from '../components/BorMediaLogo';
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
    clientLoggedIn,
    currentClientUser,
    users,
    setUsers,
    showToast,
    isServerSynced,
    smtpConfig
  } = useAppState();

  const [activePlatformFilter, setActivePlatformFilter] = useState<string>('Tümü');
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Authentication states (Modal)
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotOtpMode, setForgotOtpMode] = useState(false);
  const [forgotOtpInput, setForgotOtpInput] = useState('');
  const [forgotOtpError, setForgotOtpError] = useState(false);
  const [forgotOtpLoading, setForgotOtpLoading] = useState(false);
  const [forgotMailError, setForgotMailError] = useState('');
  const [forgotFallbackCode, setForgotFallbackCode] = useState('');
  const [forgotNewPassStep, setForgotNewPassStep] = useState(false);
  const [regOtpStep, setRegOtpStep] = useState(false);
  const [regOtpInput, setRegOtpInput] = useState('');
  const [regOtpCode, setRegOtpCode] = useState('');
  const [regOtpLoading, setRegOtpLoading] = useState(false);
  const [regOtpError, setRegOtpError] = useState('');
  const [regFallbackCode, setRegFallbackCode] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotNewPass2, setForgotNewPass2] = useState('');
  const [forgotNewPassLoading, setForgotNewPassLoading] = useState(false);
  const [forgotVerifiedUser, setForgotVerifiedUser] = useState<any>(null);

  const otpKey = (email: string) => 'smm_otp_' + email.toLowerCase().replace(/[^a-z0-9]/g, '_');

  const handleForgotSend = async () => {
    if (!forgotEmail) return;
    setForgotLoading(true);
    setForgotMailError('');
    setForgotFallbackCode('');

    // Check user exists
    let foundUser: any = users.find((u: any) => u.email.toLowerCase() === forgotEmail.toLowerCase());
    if (!foundUser) {
      try {
        const res = await fetch('/api/kv/smm_users');
        if (res.ok) {
          const d = await res.json();
          if (d.value) foundUser = JSON.parse(d.value).find((u: any) => u.email.toLowerCase() === forgotEmail.toLowerCase());
        }
      } catch {}
    }

    if (!foundUser) {
      setForgotLoading(false);
      showToast(currentLanguage === 'TR' ? 'Bu e-posta adresi kayıtlı değil.' : 'This email is not registered.', 'error');
      return;
    }

    // Generate 6-digit OTP and save to KV
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000; // 10 min
    try {
      await fetch('/api/kv/' + otpKey(forgotEmail), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: JSON.stringify({ otp, expiry }) })
      });
    } catch {}

    // Try to send email
    const smtpReady = !!(smtpConfig?.host && smtpConfig?.user && smtpConfig?.pass);
    let mailSent = false;
    if (smtpReady) {
      try {
        const mailRes = await fetch('/api/mail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: forgotEmail,
            subject: 'Bor Media — Giriş Doğrulama Kodunuz',
            body: `
              <div style="font-family:sans-serif;background:#0F0F1A;color:#eeeeff;padding:32px;border-radius:16px;max-width:480px;margin:auto;">
                <div style="text-align:center;margin-bottom:24px;">
                  <div style="width:56px;height:56px;background:linear-gradient(135deg,#00D4FF,#7B2FFF);border-radius:14px;display:inline-flex;align-items:center;justify-content:center;font-weight:bold;font-size:18px;color:#fff;">BM</div>
                </div>
                <h2 style="text-align:center;color:#ffffff;margin-bottom:8px;">Şifremi Unuttum</h2>
                <p style="text-align:center;color:#9999bb;font-size:13px;">Hesabınıza erişmek için tek kullanımlık kodunuz:</p>
                <div style="text-align:center;margin:28px 0;">
                  <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#00D4FF;">${otp}</span>
                </div>
                <p style="text-align:center;color:#666688;font-size:11px;">Bu kod 10 dakika içinde geçerliliğini yitirir.<br>Siz talep etmediyseniz bu maili görmezden gelin.</p>
                <hr style="border-color:#ffffff11;margin:24px 0;" />
                <p style="text-align:center;color:#444466;font-size:10px;">Bor Media SMM Panel</p>
              </div>
            `,
            smtp_host: smtpConfig.host,
            smtp_port: smtpConfig.port,
            smtp_user: smtpConfig.user,
            smtp_pass: smtpConfig.pass,
            from_name: smtpConfig.fromName || 'Bor Media'
          })
        });
        const mailJson = await mailRes.json();
        if (mailJson.ok) {
          mailSent = true;
        } else {
          setForgotMailError(mailJson.message || 'Mail gönderilemedi.');
          setForgotFallbackCode(otp);
        }
      } catch (e: any) {
        setForgotMailError(e?.message || 'SMTP bağlantı hatası.');
        setForgotFallbackCode(otp);
      }
    } else {
      // No SMTP configured — show code on screen
      setForgotFallbackCode(otp);
    }

    setForgotLoading(false);
    setForgotOtpMode(true);
    if (mailSent) {
      showToast(currentLanguage === 'TR' ? 'Doğrulama kodu e-posta adresinize gönderildi.' : 'Verification code sent to your email.', 'success');
    }
  };

  const handleForgotVerifyOtp = async () => {
    if (!forgotOtpInput || forgotOtpInput.length !== 6) return;
    setForgotOtpLoading(true);
    setForgotOtpError(false);
    try {
      const key = otpKey(forgotEmail);
      const res = await fetch('/api/kv/' + key);
      if (res.ok) {
        const d = await res.json();
        if (d.value) {
          const { otp, expiry } = JSON.parse(d.value);
          if (Date.now() > expiry) {
            setForgotOtpLoading(false);
            showToast(currentLanguage === 'TR' ? 'Kodun süresi doldu. Tekrar deneyin.' : 'Code expired. Try again.', 'error');
            setForgotOtpMode(false);
            setForgotOtpInput('');
            return;
          }
          if (forgotOtpInput === otp) {
            // Delete OTP from KV
            fetch('/api/kv/' + key, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value: null }) }).catch(() => {});
            // Find user
            let u: any = users.find((u: any) => u.email.toLowerCase() === forgotEmail.toLowerCase());
            if (!u) {
              const r2 = await fetch('/api/kv/smm_users');
              if (r2.ok) { const d2 = await r2.json(); if (d2.value) u = JSON.parse(d2.value).find((x: any) => x.email.toLowerCase() === forgotEmail.toLowerCase()); }
            }
            setForgotOtpLoading(false);
            if (u) {
              setForgotVerifiedUser(u);
              setForgotNewPassStep(true);
            } else {
              showToast(currentLanguage === 'TR' ? 'Kullanıcı bulunamadı.' : 'User not found.', 'error');
            }
            return;
          }
        }
      }
    } catch {}
    setForgotOtpLoading(false);
    setForgotOtpError(true);
    showToast(currentLanguage === 'TR' ? 'Hatalı kod. Lütfen tekrar deneyin.' : 'Wrong code. Please try again.', 'error');
  };

  const handleForgotSetPassword = async () => {
    if (!forgotNewPass || forgotNewPass.length < 6) {
      showToast(currentLanguage === 'TR' ? 'Şifre en az 6 karakter olmalı.' : 'Password must be at least 6 characters.', 'error');
      return;
    }
    if (forgotNewPass !== forgotNewPass2) {
      showToast(currentLanguage === 'TR' ? 'Şifreler eşleşmiyor.' : 'Passwords do not match.', 'error');
      return;
    }
    setForgotNewPassLoading(true);
    const updatedUser = { ...forgotVerifiedUser, password: forgotNewPass };
    // Update in users state and KV
    setUsers((prev: any[]) => prev.map((u: any) => u.id === updatedUser.id ? updatedUser : u));
    try {
      const res = await fetch('/api/kv/smm_users');
      if (res.ok) {
        const d = await res.json();
        if (d.value) {
          const all = JSON.parse(d.value).map((u: any) => u.id === updatedUser.id ? updatedUser : u);
          await fetch('/api/kv/smm_users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: JSON.stringify(all) })
          });
        }
      }
    } catch {}
    setForgotNewPassLoading(false);
    showToast(currentLanguage === 'TR' ? 'Şifreniz başarıyla güncellendi!' : 'Password updated successfully!', 'success');
    // Reset forgot state and log in
    setForgotNewPassStep(false);
    setForgotOtpMode(false);
    setForgotOtpInput('');
    setForgotNewPass('');
    setForgotNewPass2('');
    setForgotEmail('');
    setForgotFallbackCode('');
    setForgotMailError('');
    doLogin(updatedUser);
  };

  const platforms = useMemo(() => {
    return ['Tümü', 'Instagram', 'TikTok', 'YouTube', 'Twitter', 'Spotify', 'Telegram'];
  }, []);

  const filteredServices = useMemo(() => {
    setCurrentPage(1);
    return services.filter(service => {
      if (service.status !== 'active') return false;
      const matchesPlatform = activePlatformFilter === 'Tümü' || service.platform === activePlatformFilter;
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            service.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesPlatform && matchesSearch;
    });
  }, [services, activePlatformFilter, searchTerm]);

  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Handle Client Authentication
  const [authLoading, setAuthLoading] = useState(false);

  // Google OAuth
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/google/config')
      .then(r => r.json())
      .then(d => { setGoogleEnabled(!!d.enabled); setGoogleClientId(d.clientId || ''); })
      .catch(() => {});
  }, []);

  // Handle Google OAuth callback redirect: ?gauth_uid=xxx or ?gauth_error=xxx
  useEffect(() => {
    if (!isServerSynced) return;
    const params = new URLSearchParams(window.location.search);
    const gauthUid = params.get('gauth_uid');
    const gauthError = params.get('gauth_error');
    if (gauthError) {
      const msgs: Record<string, string> = {
        cancelled: 'Google girişi iptal edildi.',
        not_configured: 'Google OAuth henüz yapılandırılmamış.',
        token_failed: 'Google token alınamadı. Lütfen tekrar deneyin.',
        no_email: 'Google hesabından e-posta alınamadı.',
        suspended: 'Hesabınız askıya alınmış.',
        server_error: 'Sunucu hatası oluştu.',
      };
      showToast(msgs[gauthError] || 'Google girişi başarısız.', 'error');
      window.history.replaceState({}, '', '/');
      return;
    }
    if (gauthUid) {
      window.history.replaceState({}, '', '/');
      const user = users.find(u => u.id === gauthUid);
      if (user && user.status !== 'suspended') {
        doLogin(user);
      } else if (!user) {
        fetch('/api/kv/smm_users').then(r => r.json()).then(d => {
          if (d.value) {
            const fresh = JSON.parse(d.value);
            const u = fresh.find((x: any) => x.id === gauthUid);
            if (u && u.status !== 'suspended') doLogin(u);
            else showToast('Google ile giriş yapıldı fakat hesap yüklenemedi.', 'error');
          }
        }).catch(() => showToast('Hesap yüklenemedi.', 'error'));
      }
    }
  }, [isServerSynced]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGoogleLogin = async () => {
    if (!googleEnabled || !googleClientId) {
      showToast(currentLanguage === 'TR' ? 'Google ile giriş şu anda etkin değil.' : 'Google login is not enabled.', 'error');
      return;
    }
    setGoogleLoading(true);
    const redirectUri = `${window.location.origin}/api/auth/google/callback`;
    const params = new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'email profile',
      access_type: 'online',
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  };

  const doLogin = (user: { id: string; fullName: string; email: string; balance: number; totalOrders: number; joinedDate: string; status: string }) => {
    if (user.status === 'suspended') {
      showToast(currentLanguage === 'TR' ? 'Hesabınız askıya alınmıştır.' : 'Your account has been suspended.', 'error');
      return;
    }
    sessionStorage.setItem('smm_client_user_id', user.id);
    sessionStorage.setItem('smm_client_user_cache', JSON.stringify(user));
    setCurrentClientUser(user as any);
    setClientLoggedIn(true);
    setPortalMode('client');
    setAuthModalOpen(false);
    showToast(currentLanguage === 'TR' ? `Tekrar hoş geldiniz, Sayın ${user.fullName}!` : `Welcome back, ${user.fullName}!`, 'success');
  };

  const handleSendRegOtp = async () => {
    if (!authFullName || !authEmail || !authPassword) {
      showToast(currentLanguage === 'TR' ? 'Lütfen tüm alanları doldurun.' : 'Please fill all fields.', 'error');
      return;
    }
    // Check if email already in use
    const existing = users.some(u => u.email.toLowerCase() === authEmail.toLowerCase());
    if (existing) {
      showToast(currentLanguage === 'TR' ? 'Bu e-posta adresiyle zaten bir hesap var.' : 'Email already registered.', 'error');
      return;
    }
    setRegOtpLoading(true);
    setRegOtpError('');
    setRegFallbackCode('');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setRegOtpCode(code);
    // Store OTP on server with 10-min expiry
    const safeEmail = authEmail.replace(/[^a-zA-Z0-9_]/g, '_');
    try {
      await fetch(`/api/kv/smm_otp_${safeEmail}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: JSON.stringify({ code, expiry: Date.now() + 600_000 }) })
      });
    } catch {}
    const smtpReady = !!(smtpConfig?.host && smtpConfig?.user && smtpConfig?.pass);
    if (!smtpReady) {
      setRegFallbackCode(code);
      setRegOtpError(currentLanguage === 'TR' ? `SMTP ayarlanmamış. Doğrulama kodunuz: ${code}` : `SMTP not configured. Your code: ${code}`);
    } else {
      try {
        const mailRes = await fetch('/api/mail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: authEmail,
            subject: 'Bor Media - E-posta Doğrulama Kodu',
            body: `<div style="font-family:sans-serif;background:#0d0d1f;color:#eee;padding:32px;border-radius:16px;max-width:480px;margin:auto">
              <h2 style="color:#00D4FF;margin-bottom:8px">Bor Media SMM Panel</h2>
              <p>Kayıt için e-posta doğrulama kodunuz:</p>
              <div style="font-size:32px;font-weight:900;color:#7B2FFF;letter-spacing:8px;margin:24px 0;padding:16px;background:#1a1a3e;border-radius:12px;text-align:center">${code}</div>
              <p style="color:#aaa;font-size:12px">Bu kod 10 dakika geçerlidir. Kodu kimseyle paylaşmayın.</p>
            </div>`,
            smtp_host: smtpConfig.host,
            smtp_port: smtpConfig.port,
            smtp_user: smtpConfig.user,
            smtp_pass: smtpConfig.pass,
            from_name: smtpConfig.fromName || 'Bor Media'
          })
        });
        const mailData = await mailRes.json();
        if (!mailData.ok) {
          setRegFallbackCode(code);
          setRegOtpError(currentLanguage === 'TR' ? `E-posta gönderilemedi. Doğrulama kodunuz: ${code}` : `Mail failed. Your code: ${code}`);
        }
      } catch {
        setRegFallbackCode(code);
        setRegOtpError(currentLanguage === 'TR' ? `E-posta gönderilemedi. Doğrulama kodunuz: ${code}` : `Mail failed. Your code: ${code}`);
      }
    }
    setRegOtpLoading(false);
    setRegOtpStep(true);
  };

  const handleVerifyRegOtp = () => {
    if (regOtpInput.trim() !== regOtpCode) {
      setRegOtpError(currentLanguage === 'TR' ? 'Yanlış kod. Lütfen tekrar deneyin.' : 'Wrong code. Please try again.');
      return;
    }
    setRegOtpError('');
    const success = registerClient(authFullName, authEmail);
    if (success) {
      setRegOtpStep(false);
      setAuthModalOpen(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authTab === 'register') {
      await handleSendRegOtp();
      return;
    } else {
      if (!authEmail || !authPassword) {
        showToast(currentLanguage === 'TR' ? 'Lütfen tüm alanları doldurun.' : 'Please fill all fields.', 'error');
        return;
      }

      const email = authEmail.toLowerCase();

      // 1. Check local state first (instant)
      const localUser = users.find(u => u.email.toLowerCase() === email);
      if (localUser) {
        if (localUser.password && localUser.password !== authPassword) {
          showToast(currentLanguage === 'TR' ? 'Şifre hatalı.' : 'Wrong password.', 'error');
          return;
        }
        doLogin(localUser);
        return;
      }

      // 2. Fallback: fetch directly from server (handles race condition on new devices)
      setAuthLoading(true);
      try {
        const res = await fetch('/api/kv/smm_users');
        if (res.ok) {
          const data = await res.json();
          if (data.value) {
            const serverUsers: any[] = JSON.parse(data.value);
            const serverUser = serverUsers.find((u: any) => u.email.toLowerCase() === email);
            if (serverUser) {
              if (serverUser.password && serverUser.password !== authPassword) {
                setAuthLoading(false);
                showToast(currentLanguage === 'TR' ? 'Şifre hatalı.' : 'Wrong password.', 'error');
                return;
              }
              doLogin(serverUser);
              setAuthLoading(false);
              return;
            }
          }
        }
      } catch { /* server unavailable */ }
      setAuthLoading(false);

      // 3. Demo fallback
      const isDemo = authEmail === 'client@gmail.com' || authEmail === 'user@gmail.com';
      if (isDemo || authPassword === 'password123') {
        const targetUser = users[0] || { id: "1", fullName: "Demo Kullanıcı", email: authEmail, balance: 1500, totalOrders: 15, joinedDate: "01.01.2026", status: "active" };
        sessionStorage.setItem('smm_client_user_id', targetUser.id);
        sessionStorage.setItem('smm_client_user_cache', JSON.stringify(targetUser));
        setCurrentClientUser(targetUser as any);
        setClientLoggedIn(true);
        setPortalMode('client');
        setAuthModalOpen(false);
        showToast(currentLanguage === 'TR' ? 'Demo kullanıcı olarak giriş yapıldı.' : 'Logged in as demo client.', 'success');
      } else {
        showToast(currentLanguage === 'TR' ? 'Kullanıcı bulunamadı. Lütfen yeni kayıt oluşturun.' : 'Client not found. Please register.', 'error');
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
    <div className="min-h-screen bg-[#090915] text-[#eeeeff] font-sans antialiased relative overflow-hidden">

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
          <BorMediaLogo size="sm" />

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-gray-300">
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
          <div className="hidden md:flex items-center gap-4 ml-4">
            {/* Language switcher */}
            <button
              onClick={() => setCurrentLanguage(currentLanguage === 'TR' ? 'EN' : 'TR')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentLanguage}</span>
            </button>

            {clientLoggedIn && currentClientUser ? (
              <button
                onClick={() => setPortalMode('client')}
                className="px-5 py-2.5 bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 rounded-xl text-xs font-bold hover:bg-cyan-500/20 transition cursor-pointer"
              >
                {currentLanguage === 'TR' ? `← ${currentClientUser.fullName.split(' ')[0]}` : `← Dashboard`}
              </button>
            ) : (
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
            )}

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
            className="md:hidden p-2 text-gray-400 hover:text-white bg-white/5 border border-white/10 rounded-xl cursor-pointer"
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

          <div className="flex items-center justify-end pt-3">
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
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/35 text-[10px] font-bold text-[#00D4FF] tracking-wider uppercase mx-auto animate-pulse">
            <Cpu className="w-3.5 h-3.5" />
            <span>{currentLanguage === 'TR' ? 'OTOMATIK GÖNDERIM ALTYAPISI' : 'AUTOMATED RESELLER API'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-sora text-white tracking-tight leading-tight">
            {currentLanguage === 'TR' ? (
              <>
                Türkiye'nin En Ucuz, En Hızlı <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent"> SMM Servisi</span> 
              </>
            ) : (
              <>
                The Ultimate Cheap & Automated <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">SMM Panel API</span> Hub
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-2xl mx-auto">
            {currentLanguage === 'TR' 
              ? 'Instagram, TikTok, YouTube ve yüzlerce platformda anında gönderim sağlayan otomatik SMM servisleriyle sosyal medya etkileşimlerinizi uçuşa geçirin. Üye olarak hemen denemeye başlayın!' 
              : 'Launch your social accounts to new heights using automated marketing api. Instantly get your free welcome load in your wallet upon secure signup!'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => {
              setAuthTab('register');
              setAuthModalOpen(true);
            }}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#00D4FF] to-[#7B2FFF] text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-cyan-400/20 active:scale-95 transition cursor-pointer"
          >
            <span>{currentLanguage === 'TR' ? 'Ücretsiz Kayıt Ol' : 'Register Free'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              document.getElementById('services-sec')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-8 py-4 bg-[#14142d] hover:bg-[#1a1a3c] border border-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <span>{currentLanguage === 'TR' ? 'Servisleri İncele' : 'Browse Services'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 max-w-5xl mx-auto">
          {[
            { value: '400+', labelTR: 'Aktif Bayiler', labelEN: 'Active Resellers', color: 'text-cyan-400' },
            { value: '3.4M', labelTR: 'Tamamlanan Sipariş', labelEN: 'Orders Completed', color: 'text-purple-400' },
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
              ? 'Tüm fiyatlarımız piyasa koşullarına göre güncellenir. Fiyatlar 1000 adet gönderim için geçerlidir.' 
              : 'Our system updates pricing on the fly based on network loads. Unit costs apply per 1,000 requests.'}
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
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

        <div className="bg-[#121226]/35 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#191932]/35 border-b border-white/5 text-gray-500 font-bold uppercase tracking-wider">
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
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      {currentLanguage === 'TR' ? 'Aradığınız kriterlere uygun servis bulunamadı.' : 'No active services compile into your current filters.'}
                    </td>
                  </tr>
                ) : (
                  paginatedServices.map(service => (
                    <tr key={service.id} className="hover:bg-white/2 transition">
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-xs font-bold bg-[#121226]/60 border border-white/10 rounded-xl text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
            >
              {currentLanguage === 'TR' ? '← Önceki' : '← Prev'}
            </button>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce<(number | string)[]>((acc, p, idx, arr) => {
                  if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-600 text-xs">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p as number)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition cursor-pointer ${
                        currentPage === p
                          ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white'
                          : 'bg-[#121226]/60 border border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-xs font-bold bg-[#121226]/60 border border-white/10 rounded-xl text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
            >
              {currentLanguage === 'TR' ? 'Sonraki →' : 'Next →'}
            </button>
          </div>
        )}

        {/* Result count */}
        <p className="text-center text-[10px] text-gray-600 mt-3">
          {filteredServices.length} {currentLanguage === 'TR' ? 'servis bulundu' : 'services found'} · {currentLanguage === 'TR' ? 'Sayfa' : 'Page'} {currentPage}/{totalPages || 1}
        </p>

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
                ? 'SMM Pro Group Turkey markası olarak, kendi panelini veya yazılıp bayiliğini yürütmek isteyen müşterilerimize sınırsız hacimde, donmasız ve anında teslim garantili servis sağlıyoruz.'
                : 'Enjoy infinite scale capabilities, complete server protection patterns, and near zero lag. We keep standard operations working 24/7 with immediate response parameters.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs pt-4">
              {[
                { title: 'Hızlı Sipariş & Teslimat', desc: 'Siparişleriniz anında işlenir, teslimat otomatik başlar.' },
                { title: 'API & Entegrasyon', desc: 'Kendi panelinizden JSON API ile tam entegrasyon sağlayın.' },
                { title: 'Güvenli Ödeme', desc: 'Kredi kartı ile %100 güvenli 3D Secure bakiye yüklemesi.' },
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

          <div className="bg-[#121226]/50 border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-cyan-400/20 transition duration-300">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-gray-500">api-endpoint-v2.json</span>
                <span className="px-2 py-0.5 bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-[9px] font-bold rounded-full uppercase tracking-wider">Yakında...</span>
              </div>
            </div>

            <pre className="font-mono text-[10.5px] leading-relaxed text-indigo-300 overflow-x-auto select-all">
{`{
  "api_action": "place_order",
  "api_key": "",
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

      {/* Developer API section */}
      <section id="api-sec" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-gradient-to-r from-cyan-950/20 to-purple-950/20 border border-white/5 rounded-3xl p-6 sm:p-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-md">
          <div className="space-y-3.5 max-w-xl text-left">
            <Code className="w-8 h-8 text-cyan-400" />
            <h3 className="text-xl sm:text-2xl font-bold font-sora text-white">
              {currentLanguage === 'TR' ? 'Kendi Sitenizden Mi Satış Yapacaksınız?' : 'Are You Reselling from Your Personal Codebase?'}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {currentLanguage === 'TR' 
                ? 'Panelimizin kusursuz JSON API desteği sayesinde tüm API entegrasyonlarını saniyeler içinde tamamlayın. Perfect Panel, SMM Lite ve tüm diğer altyapılarla uyumludur.' 
                : 'Our comprehensive REST API supports continuous webhook triggers and full multi-currency sync operations.'}
            </p>
          </div>
          <div>
            <div className="flex flex-col items-center gap-2">
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
              <span className="text-[10px] text-yellow-400 font-bold">(Yakında...)</span>
            </div>
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

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#05050f]/90 py-8 text-xs text-gray-500 relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00D4FF] to-[#7B2FFF] flex items-center justify-center font-bold text-white text-xs">
              BM
            </div>
            <span className="font-bold text-gray-300">Bor Media Group © 2026. Tüm hakları saklıdır.</span>
          </div>
          <span>Uptime 100% Guaranteed</span>
        </div>
      </footer>

      {/* Authentication Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[5000] flex items-center justify-center p-4 animate-fade-in">

          <div className="w-full max-w-md bg-[#16162d] border border-white/10 rounded-3xl p-6 shadow-2xl relative animate-scale-up">

            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-6">
              <h3 className="text-lg font-bold font-sora text-white">
                {authTab === 'login' ? (
                  currentLanguage === 'TR' ? 'Müşteri Girişi' : 'Client Access'
                ) : authTab === 'forgot' ? (
                  currentLanguage === 'TR' ? 'Şifremi Unuttum' : 'Forgot Password'
                ) : (
                  currentLanguage === 'TR' ? 'Hemen Hesap Oluştur' : 'Register New Dealer'
                )}
              </h3>
              <p className="text-[11px] text-gray-500 mt-1">
                {currentLanguage === 'TR' 
                  ? 'Bor Media ayrıcalıklı bayiler platformu.' 
                  : 'Bor Media premium reselling program.'}
              </p>
            </div>


            {authTab !== 'forgot' && (
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
                  {currentLanguage === 'TR' ? 'Kayıt Ol (Ücretsiz)' : 'Sign Up'}
                </button>
              </div>
            )}

            {authTab === 'forgot' ? (
              <div className="space-y-4 text-xs">
                {forgotNewPassStep ? (
                  <>
                    <div className="text-center space-y-1 pb-1">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2">
                        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <p className="text-white font-bold text-sm">{currentLanguage === 'TR' ? 'Kimlik Doğrulandı ✓' : 'Identity Verified ✓'}</p>
                      <p className="text-[11px] text-gray-400">{currentLanguage === 'TR' ? 'Yeni şifrenizi belirleyin.' : 'Set your new password.'}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-400 tracking-wide uppercase font-bold text-[10px]">{currentLanguage === 'TR' ? 'Yeni Şifre' : 'New Password'}</label>
                      <input
                        type="password"
                        className="w-full bg-[#121226] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400"
                        placeholder={currentLanguage === 'TR' ? 'En az 6 karakter' : 'At least 6 characters'}
                        value={forgotNewPass}
                        onChange={(e) => setForgotNewPass(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-400 tracking-wide uppercase font-bold text-[10px]">{currentLanguage === 'TR' ? 'Yeni Şifre (Tekrar)' : 'Confirm New Password'}</label>
                      <input
                        type="password"
                        className={`w-full bg-[#121226] border ${forgotNewPass2 && forgotNewPass !== forgotNewPass2 ? 'border-red-500' : 'border-white/10'} rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400`}
                        placeholder={currentLanguage === 'TR' ? 'Şifreyi tekrar girin' : 'Repeat password'}
                        value={forgotNewPass2}
                        onChange={(e) => setForgotNewPass2(e.target.value)}
                      />
                      {forgotNewPass2 && forgotNewPass !== forgotNewPass2 && (
                        <p className="text-[10px] text-red-400">{currentLanguage === 'TR' ? 'Şifreler eşleşmiyor.' : 'Passwords do not match.'}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={!forgotNewPass || forgotNewPass.length < 6 || forgotNewPass !== forgotNewPass2 || forgotNewPassLoading}
                      onClick={handleForgotSetPassword}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {forgotNewPassLoading ? (
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span>{currentLanguage === 'TR' ? 'Şifreyi Kaydet & Giriş Yap' : 'Save Password & Login'}</span>
                      )}
                    </button>
                  </>
                ) : !forgotOtpMode ? (
                  <>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      {currentLanguage === 'TR' ? 'Kayıtlı e-posta adresinizi girin. 6 haneli doğrulama kodunu e-postanıza göndereceğiz.' : 'Enter your registered email. We will send a 6-digit verification code.'}
                    </p>
                    <div className="space-y-1">
                      <label className="text-gray-400 tracking-wide uppercase font-bold text-[10px]">{currentLanguage === 'TR' ? 'E-Posta Adresiniz' : 'Email Address'}</label>
                      <input
                        type="email"
                        required
                        className="w-full bg-[#121226] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400"
                        placeholder="örn: email@ornek.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                      />
                    </div>
                    {!smtpConfig?.host && (
                      <p className="text-[10px] text-amber-400 bg-amber-950/30 border border-amber-700/30 rounded-xl px-3 py-2">
                        ⚠️ {currentLanguage === 'TR' ? 'SMTP ayarı yapılmamış. Kod e-posta yerine ekranda gösterilecek.' : 'SMTP not configured. Code will be shown on screen.'}
                      </p>
                    )}
                    <button
                      type="button"
                      disabled={!forgotEmail || forgotLoading}
                      onClick={handleForgotSend}
                      className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-cyan-400/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {forgotLoading ? (
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>{currentLanguage === 'TR' ? 'Doğrulama Kodu Gönder' : 'Send Verification Code'}</span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <button type="button" onClick={() => setAuthTab('login')} className="w-full text-center text-[11px] text-gray-500 hover:text-cyan-400 cursor-pointer transition">
                      {currentLanguage === 'TR' ? '← Giriş sayfasına dön' : '← Back to login'}
                    </button>
                  </>
                ) : (
                  <>
                    {/* Mail error — show code on screen */}
                    {forgotFallbackCode ? (
                      <div className="rounded-xl border border-amber-600/40 bg-amber-950/20 px-4 py-3 space-y-2">
                        {forgotMailError ? (
                          <p className="text-[10px] text-amber-400 font-semibold">
                            ⚠️ {currentLanguage === 'TR' ? 'Mail gönderilemedi:' : 'Mail failed:'} {forgotMailError}
                          </p>
                        ) : (
                          <p className="text-[10px] text-amber-400 font-semibold">
                            ⚠️ {currentLanguage === 'TR' ? 'SMTP ayarı yapılmamış.' : 'SMTP not configured.'}
                          </p>
                        )}
                        <p className="text-[10px] text-gray-400">
                          {currentLanguage === 'TR' ? 'Giriş kodunuz:' : 'Your login code:'}
                        </p>
                        <div className="text-center py-1">
                          <span className="text-2xl font-black tracking-[10px] text-cyan-400 font-mono">{forgotFallbackCode}</span>
                        </div>
                        <p className="text-[9px] text-gray-500 text-center">
                          {currentLanguage === 'TR' ? 'Bu kodu aşağıya girin ve giriş yapın.' : 'Enter this code below to log in.'}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-400 text-center">
                        {currentLanguage === 'TR' ? `6 haneli kod ` : `6-digit code sent to `}
                        <strong className="text-white">{forgotEmail}</strong>
                        {currentLanguage === 'TR' ? ` adresine gönderildi.` : `.`}
                      </p>
                    )}
                    <div className="space-y-1">
                      <label className="text-gray-400 tracking-wide uppercase font-bold text-[10px]">{currentLanguage === 'TR' ? '6 Haneli Kod' : '6-Digit Code'}</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        className={`w-full bg-[#121226] border ${forgotOtpError ? 'border-red-500' : 'border-white/10'} rounded-xl py-3 px-4 text-white text-center text-lg font-mono tracking-[8px] placeholder-gray-600 focus:outline-none focus:border-cyan-400`}
                        placeholder="— — — — — —"
                        value={forgotOtpInput}
                        onChange={(e) => { setForgotOtpInput(e.target.value.replace(/\D/g, '')); setForgotOtpError(false); }}
                      />
                    </div>
                    <button
                      type="button"
                      disabled={forgotOtpInput.length !== 6 || forgotOtpLoading}
                      onClick={handleForgotVerifyOtp}
                      className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-cyan-400/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {forgotOtpLoading ? (
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span>{currentLanguage === 'TR' ? 'Kodu Doğrula & Giriş Yap' : 'Verify Code & Login'}</span>
                      )}
                    </button>
                    <button type="button" onClick={() => { setForgotOtpMode(false); setForgotOtpInput(''); setForgotOtpError(false); setForgotFallbackCode(''); setForgotMailError(''); }} className="w-full text-center text-[11px] text-gray-500 hover:text-cyan-400 cursor-pointer transition">
                      {currentLanguage === 'TR' ? '← E-postayı değiştir' : '← Change email'}
                    </button>
                  </>
                )}
              </div>
            ) : regOtpStep ? (
              <div className="space-y-4 text-xs">
                <div className="text-center space-y-1 pb-1">
                  <div className="w-12 h-12 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <p className="text-white font-bold text-sm">{currentLanguage === 'TR' ? 'E-postanı Doğrula' : 'Verify Your Email'}</p>
                  <p className="text-[11px] text-gray-400">
                    {currentLanguage === 'TR' ? `${authEmail} adresine 6 haneli kod gönderildi.` : `6-digit code sent to ${authEmail}.`}
                  </p>
                </div>
                {regOtpError && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 text-[11px] font-semibold text-center">
                    {regOtpError}
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-gray-400 tracking-wide uppercase font-bold text-[10px]">{currentLanguage === 'TR' ? 'Doğrulama Kodu' : 'Verification Code'}</label>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    className="w-full bg-[#121226] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 text-center text-xl font-mono font-black tracking-widest"
                    placeholder="______"
                    value={regOtpInput}
                    onChange={(e) => setRegOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleVerifyRegOtp(); }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyRegOtp}
                  disabled={regOtpInput.length < 6}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{currentLanguage === 'TR' ? 'Doğrula ve Hesabı Oluştur' : 'Verify & Create Account'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="flex items-center justify-between pt-1">
                  <button type="button" onClick={() => { setRegOtpStep(false); setRegOtpInput(''); setRegOtpError(''); setRegFallbackCode(''); }} className="text-[11px] text-gray-500 hover:text-cyan-400 cursor-pointer transition">
                    {currentLanguage === 'TR' ? '← Geri Dön' : '← Go Back'}
                  </button>
                  <button type="button" onClick={handleSendRegOtp} disabled={regOtpLoading} className="text-[11px] text-gray-500 hover:text-cyan-400 cursor-pointer transition disabled:opacity-50">
                    {currentLanguage === 'TR' ? 'Kodu Tekrar Gönder' : 'Resend Code'}
                  </button>
                </div>
              </div>
            ) : (
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
                  <div className="flex items-center justify-between">
                    <label className="text-gray-400 tracking-wide uppercase font-bold text-[10px]">{currentLanguage === 'TR' ? 'Şifre' : 'Password'}</label>
                    {authTab === 'login' && (
                      <button
                        type="button"
                        onClick={() => { setAuthTab('forgot'); setForgotEmail(authEmail); setForgotSent(false); }}
                        className="text-[10px] font-bold text-cyan-400 hover:underline cursor-pointer"
                      >
                        {currentLanguage === 'TR' ? 'Şifremi Unuttum' : 'Forgot Password?'}
                      </button>
                    )}
                  </div>
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
                  disabled={authLoading || regOtpLoading}
                  className="w-full py-3.5 mt-2 bg-gradient-to-r from-cyan-400 to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-cyan-400/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-wait"
                >
                  {(authLoading || regOtpLoading) ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>{regOtpLoading ? (currentLanguage === 'TR' ? 'Doğrulama kodu gönderiliyor...' : 'Sending verification code...') : (currentLanguage === 'TR' ? 'Hesap aranıyor...' : 'Looking up account...')}</span>
                    </>
                  ) : (
                    <>
                      <span>{authTab === 'login' ? (currentLanguage === 'TR' ? 'Hesaba Giriş Yap' : 'Authorize Session') : (currentLanguage === 'TR' ? 'Hesabımı Oluştur' : 'Create Account')}</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {googleEnabled && (
                  <>
                    <div className="flex items-center gap-3 my-1">
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                        {currentLanguage === 'TR' ? 'veya' : 'or'}
                      </span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={googleLoading}
                      className="w-full py-3 bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer disabled:opacity-60"
                    >
                      {googleLoading ? (
                        <span className="w-4 h-4 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin" />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        </svg>
                      )}
                      <span>{currentLanguage === 'TR' ? 'Google ile Giriş Yap' : 'Continue with Google'}</span>
                    </button>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};