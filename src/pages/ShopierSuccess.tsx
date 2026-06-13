import React, { useEffect, useState } from 'react';
import { CheckCircle, Loader2, AlertCircle, ArrowLeft, Wallet } from 'lucide-react';

export const ShopierSuccess: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'error'>('loading');
  const [amount, setAmount] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [attempts, setAttempts] = useState(0);

  // ref from URL params (future: if Shopier passes it) or from localStorage (current approach)
  const urlRef = new URLSearchParams(window.location.search).get('ref') || '';
  const ref = urlRef || localStorage.getItem('shopier_pending_ref') || '';

  useEffect(() => {
    if (!ref) {
      setStatus('error');
      setMessage('Ödeme referansı bulunamadı. Lütfen yönetici ile iletişime geçin.');
      return;
    }
    checkPayment();
  }, []);

  const checkPayment = async (attempt = 0) => {
    try {
      const resp = await fetch(`/api/shopier/check-payment?ref=${encodeURIComponent(ref)}`);
      const data = await resp.json();

      if (data.status === 'completed') {
        localStorage.removeItem('shopier_pending_ref');
        localStorage.removeItem('shopier_pending_amount');
        setStatus('success');
        setAmount(data.amount);
        setMessage(`₺${data.amount.toFixed(2)} bakiyenize eklendi.`);
      } else if (data.status === 'pending' && attempt < 8) {
        setStatus('pending');
        setAttempts(attempt + 1);
        setTimeout(() => checkPayment(attempt + 1), 3000);
      } else if (data.status === 'already_processed') {
        localStorage.removeItem('shopier_pending_ref');
        localStorage.removeItem('shopier_pending_amount');
        setStatus('success');
        setAmount(data.amount);
        setMessage(`Bu ödeme daha önce işlendi. ₺${data.amount?.toFixed(2)} bakiyenize eklendi.`);
      } else {
        setStatus('error');
        setMessage(data.message || 'Ödeme doğrulanamadı. Lütfen yönetici ile iletişime geçin.');
      }
    } catch {
      if (attempt < 5) {
        setTimeout(() => checkPayment(attempt + 1), 4000);
      } else {
        setStatus('error');
        setMessage('Bağlantı hatası. Lütfen sayfayı yenileyip tekrar deneyin.');
      }
    }
  };

  const goHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#121226] border border-white/8 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          {status === 'loading' && (
            <>
              <div className="w-20 h-20 mx-auto rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white font-sora">Ödeme Doğrulanıyor</h1>
                <p className="text-sm text-gray-500 mt-2">Shopier'den ödeme onayı bekleniyor...</p>
              </div>
            </>
          )}

          {status === 'pending' && (
            <>
              <div className="w-20 h-20 mx-auto rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-yellow-400 animate-spin" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white font-sora">İşleniyor...</h1>
                <p className="text-sm text-gray-500 mt-2">Ödeme onayı kontrol ediliyor ({attempts}/8)</p>
                <div className="mt-3 flex justify-center gap-1">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < attempts ? 'bg-yellow-400' : 'bg-white/10'}`} />
                  ))}
                </div>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center animate-bounce-once">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white font-sora">Ödeme Başarılı! 🎉</h1>
                {amount !== null && (
                  <div className="mt-3 p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-2xl">
                    <span className="text-3xl font-black text-emerald-400 font-mono">₺{amount.toFixed(2)}</span>
                    <p className="text-xs text-emerald-300/70 mt-1">bakiyenize eklendi</p>
                  </div>
                )}
                <p className="text-sm text-gray-400 mt-3">{message}</p>
              </div>
              <div className="flex items-center gap-2 p-3 bg-cyan-950/20 border border-cyan-500/15 rounded-2xl text-left">
                <Wallet className="w-4 h-4 text-cyan-400 shrink-0" />
                <p className="text-xs text-cyan-300">Bakiyeniz anında güncellendi. Sipariş oluşturabilirsiniz.</p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-20 h-20 mx-auto rounded-full bg-rose-400/10 border border-rose-400/20 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-rose-400" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white font-sora">Doğrulama Hatası</h1>
                <p className="text-sm text-gray-400 mt-2">{message}</p>
              </div>
              <div className="p-3 bg-amber-950/20 border border-amber-500/15 rounded-2xl text-xs text-amber-300 text-left">
                Eğer ödeme yaptıysanız, bakiyeniz kısa süre içinde yönetici tarafından manuel olarak eklenecektir.
                Referans: <span className="font-mono text-amber-400">{ref}</span>
              </div>
            </>
          )}

          <button
            onClick={goHome}
            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard'a Dön
          </button>

          <div className="flex items-center justify-center gap-2 opacity-50">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#00D4FF] to-[#7B2FFF] flex items-center justify-center text-[8px] font-black text-white">B</div>
            <span className="text-[10px] text-gray-500 font-semibold">Bor Media SMM Panel</span>
          </div>
        </div>
      </div>
    </div>
  );
};
