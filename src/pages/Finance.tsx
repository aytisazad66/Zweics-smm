import React, { useState } from 'react';
import { useAppState } from '../context/AppContext';
import { PaymentRequest, PaymentMethod } from '../data/mockData';
import { CreditCard, Check, Ban, Settings, Sliders, DollarSign, TrendingUp, ArrowDownLeft, X, Wallet } from 'lucide-react';

export const Finance: React.FC = () => {
  const { 
    paymentRequests, 
    paymentMethods, 
    currentLanguage, 
    approvePaymentRequest, 
    rejectPaymentRequest, 
    togglePaymentMethod, 
    updatePaymentMethodCommission 
  } = useAppState();

  const [activeTab, setActiveTab] = useState<'claims' | 'gateways'>('claims');
  
  // Commission editor helper states
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [commissionVal, setCommissionVal] = useState('');

  // Calculations for earnings summary widgets
  const approvedClaims = paymentRequests.filter(r => r.status === 'Onaylandı');
  const todayClaims = approvedClaims.slice(0, 3).reduce((sum, r) => sum + r.amount, 0);
  const totalApprovedTotal = approvedClaims.reduce((sum, r) => sum + r.amount, 0) + 12000; // base scale

  const handleUpdateCommission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMethod) return;
    const rate = parseFloat(commissionVal);
    if (isNaN(rate) || rate < 0) return;

    updatePaymentMethodCommission(editingMethod.id, rate);
    setEditingMethod(null);
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#eeeeff]">
      
      {/* Earnings Summary panels (Gelir Özeti) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daily bills counter */}
        <div id="finance-stat-daily" className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-full" />
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">{currentLanguage === 'TR' ? 'Bugünkü Cirosal Giriş' : 'Today Payments processed'}</p>
          <p className="text-xl md:text-2xl font-black text-white font-mono leading-none">
            {todayClaims.toLocaleString('tr-TR')} ₺
          </p>
          <span className="text-[9px] text-emerald-400 mt-2.5 block flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+15% {currentLanguage === 'TR' ? 'dünceye göre' : 'vs yesterday'}</span>
          </span>
        </div>

        {/* Total funds deposited */}
        <div id="finance-stat-total" className="glass-panel p-5 rounded-2xl col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#00D4FF]/5 to-transparent rounded-bl-full" />
          <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-2">{currentLanguage === 'TR' ? 'Toplam Toplanan Güvence Bakiye' : 'Consolidated SMM Reserve'}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl md:text-3xl font-black text-white font-mono leading-none">
              {totalApprovedTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
            </p>
            <span className="text-xs text-gray-400">({currentLanguage === 'TR' ? 'Onaylanmış Bildirimler' : 'Gross collections validated'})</span>
          </div>
          <span className="text-[10px] text-[#00D4FF] mt-2 block font-semibold flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5" />
            <span>Sanal Papara, PayTR ve EFT kanalları entegrasyonu tamamen aktiftir.</span>
          </span>
        </div>
      </div>

      {/* Selector Navigation triggers tabs */}
      <div className="flex border-b border-white/5 gap-4">
        <button
          id="btn-finance-tab-claims"
          onClick={() => setActiveTab('claims')}
          className={`pb-3 text-xs font-bold tracking-wide uppercase transition relative cursor-pointer ${activeTab === 'claims' ? 'text-[#00D4FF]' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <span>{currentLanguage === 'TR' ? 'Bakiye Yükleme Talepleri' : 'Top-Up Claims list'}</span>
          {activeTab === 'claims' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full" />
          )}
        </button>

        <button
          id="btn-finance-tab-gateways"
          onClick={() => setActiveTab('gateways')}
          className={`pb-3 text-xs font-bold tracking-wide uppercase transition relative cursor-pointer ${activeTab === 'gateways' ? 'text-[#00D4FF]' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <span>{currentLanguage === 'TR' ? 'Müşteri Ödeme Kanalları' : 'Payment Providers Config'}</span>
          {activeTab === 'gateways' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full" />
          )}
        </button>
      </div>

      {/* CONDITIONAL SUB VIEWS PANEL */}
      {activeTab === 'claims' ? (
        /* Top-ups table list panel */
        <div className="glass-panel p-5 rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 font-semibold">
                  <th className="pb-3 pl-3">Bildirim Kodu</th>
                  <th className="pb-3">{currentLanguage === 'TR' ? 'Üye Adı' : 'Account user'}</th>
                  <th className="pb-3">Ödeme Kanalı</th>
                  <th className="pb-3">{currentLanguage === 'TR' ? 'Bakiye Miktarı' : 'Deposit'}</th>
                  <th className="pb-3">{currentLanguage === 'TR' ? 'Gönderim Saati' : 'Timestamp'}</th>
                  <th className="pb-3">Sorgu ID / Çıktı</th>
                  <th className="pb-3">Durum</th>
                  <th className="pb-3 pr-3 text-right">{currentLanguage === 'TR' ? 'Denetleme' : 'Validations'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paymentRequests.map(req => (
                  <tr id={`payment-row-${req.id}`} key={req.id} className="text-gray-300 hover:bg-white/5 transition">
                    <td className="py-3.5 pl-3 font-mono font-bold text-cyan-400">{req.id}</td>
                    <td className="py-3.5 font-semibold text-white">{req.userName}</td>
                    <td className="py-3.5 font-medium text-gray-400">{req.method}</td>
                    <td className="py-3.5 font-bold font-mono text-emerald-400">+{req.amount.toFixed(2)} ₺</td>
                    <td className="py-3.5 font-medium text-gray-500">{req.date.replace('T', ' ').substring(0, 16)}</td>
                    <td className="py-3.5 font-mono text-[10px] text-gray-400">{req.transactionId || '---'}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        req.status === 'Onaylandı' 
                          ? 'bg-emerald-950/20 text-emerald-400 border-emerald-800/20' 
                          : req.status === 'Reddedildi' 
                          ? 'bg-rose-950/20 text-rose-500 border-rose-800/10' 
                          : 'bg-yellow-950/20 text-yellow-500 border-yellow-800/30 animate-pulse'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-3 text-right whitespace-nowrap">
                      {req.status === 'Beklemede' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`approve-payment-btn-${req.id}`}
                            onClick={() => approvePaymentRequest(req.id)}
                            className="p-1 px-1.5 bg-emerald-950/20 border border-emerald-800/30 text-emerald-400 hover:bg-emerald-900/30 hover:text-emerald-300 text-[10px] font-bold rounded-lg transition"
                            title="Ödemeyi Doğrula & Bakiyeyi Tanımla"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            id={`reject-payment-btn-${req.id}`}
                            onClick={() => rejectPaymentRequest(req.id)}
                            className="p-1 px-1.5 bg-rose-950/20 border border-rose-800/30 text-rose-500 hover:bg-rose-900/30 hover:text-rose-400 text-[10px] font-bold rounded-lg transition"
                            title="Ödeme Bildirimini Reddet"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-500 font-semibold">{currentLanguage === 'TR' ? 'Tamamlandı' : 'Verified'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Payment Channels (Gateways) settings panel */
        <div id="payment-gateways-panel" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.map(method => (
              <div 
                id={`gateway-card-${method.id}`}
                key={method.id} 
                className="p-5 bg-[#121226]/60 border border-white/5 rounded-2xl flex items-start justify-between gap-4 transition hover:border-[#00D4FF]/20"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400">
                      <CreditCard className="w-4.5 h-4.5 text-[#00D4FF]" />
                    </div>
                    <h4 className="text-sm font-bold text-white leading-tight">{method.name}</h4>
                  </div>
                  
                  <div className="pt-3.5 space-y-1 text-gray-400">
                    <p>Komisyon Oranı: <strong className="text-white font-mono">%{method.commission}%</strong></p>
                    <p>Minimum Yükleme Sınırı: <strong className="text-white font-mono">{method.minAmount} TL</strong></p>
                  </div>
                </div>

                {/* Switcher and commission slider tools */}
                <div className="flex flex-col items-end justify-between h-full gap-4">
                  <button
                    id={`toggle-payment-method-switch-${method.id}`}
                    onClick={() => togglePaymentMethod(method.id)}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors relative cursor-pointer ${method.status ? 'bg-[#00D4FF]' : 'bg-[#1e1e32]'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${method.status ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>

                  <button
                    id={`edit-commission-btn-${method.id}`}
                    onClick={() => {
                      setEditingMethod(method);
                      setCommissionVal(method.commission.toString());
                    }}
                    className="p-1 px-2.5 bg-white/5 border border-white/10 text-xs font-bold text-[#00D4FF] hover:bg-white/10 rounded-lg flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Oran Değiştir</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMMISSION SETTING MODAL */}
      {editingMethod && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#121226] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-5 bg-[#171734] border-b border-white/10 flex items-center justify-between">
              <h4 className="text-sm font-bold font-sora text-white flex items-center gap-2">
                <Sliders className="w-4.5 h-4.5 text-cyan-400" />
                <span>Yöntem Oran Konfigürasyonu</span>
              </h4>
              <button onClick={() => setEditingMethod(null)} className="p-1 hover:bg-white/5 rounded text-gray-500 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCommission} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-[#0d0d1c] border border-white/5 rounded-xl block leading-snug">
                Kanal: <strong className="text-white">{editingMethod.name}</strong>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Yeni Komisyon Oranı (%)</label>
                <div className="relative">
                  <input
                    id="edit-commission-rate-input"
                    type="number"
                    step="0.1"
                    required
                    className="w-full bg-[#16162d] border border-white/10 rounded-xl py-3 px-4 font-mono font-black text-white"
                    value={commissionVal}
                    onChange={(e) => setCommissionVal(e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">%</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                <button
                  id="cancel-edit-commission-btn"
                  type="button"
                  onClick={() => setEditingMethod(null)}
                  className="px-4 py-2 rounded-xl border border-white/10 font-bold bg-[#171732] text-gray-300"
                >
                  İptal
                </button>
                <button
                  id="submit-edit-commission-btn"
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-purple-600 font-bold text-white rounded-xl active:scale-95"
                >
                  Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
