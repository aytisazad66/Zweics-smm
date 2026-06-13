import React from 'react';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export const ShopierFail: React.FC = () => {
  const ref = new URLSearchParams(window.location.search).get('ref') || '';

  return (
    <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#121226] border border-white/8 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 mx-auto rounded-full bg-rose-400/10 border border-rose-400/20 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-rose-400" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-white font-sora">Ödeme Başarısız</h1>
            <p className="text-sm text-gray-400 mt-2">Shopier üzerinde ödeme tamamlanamadı veya iptal edildi.</p>
          </div>

          <div className="p-4 bg-rose-950/20 border border-rose-500/15 rounded-2xl text-left space-y-2">
            <p className="text-xs font-bold text-rose-400">Olası Nedenler:</p>
            <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
              <li>Kart bakiyesi yetersiz</li>
              <li>Ödeme işlemi iptal edildi</li>
              <li>Banka tarafından reddedildi</li>
            </ul>
          </div>

          {ref && (
            <p className="text-[10px] text-gray-600 font-mono">Referans: {ref}</p>
          )}

          <div className="flex flex-col gap-2">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full py-3 bg-gradient-to-r from-cyan-400 to-purple-600 text-white font-extrabold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              Tekrar Dene
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard'a Dön
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 opacity-50">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#00D4FF] to-[#7B2FFF] flex items-center justify-center text-[8px] font-black text-white">B</div>
            <span className="text-[10px] text-gray-500 font-semibold">Bor Media SMM Panel</span>
          </div>
        </div>
      </div>
    </div>
  );
};
