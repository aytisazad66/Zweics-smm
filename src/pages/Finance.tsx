import React, { useState, useEffect } from 'react';
import { useAppState } from '../context/AppContext';
import { PaymentMethod } from '../data/mockData';
import { CreditCard, Check, Ban, Settings, Sliders, TrendingUp, ArrowDownLeft, X, Wallet, FileText, ShoppingCart, AlertCircle, RefreshCw } from 'lucide-react';

interface ShopierPayment {
  ref: string;
  userId: string;
  userName: string;
  chargeAmount: number;
  creditAmount: number;
  shopierFee: number;
  status: 'pending' | 'completed';
  createdAt: string;
  processedAt: string | null;
}

export const Finance: React.FC = () => {
  const { 
    paymentRequests, 
    paymentMethods, 
    currentLanguage, 
    approvePaymentRequest, 
    rejectPaymentRequest, 
    togglePaymentMethod, 
    updatePaymentMethodDetails,
  } = useAppState();

  const [activeTab, setActiveTab] = useState<'claims' | 'shopier' | 'gateways'>('claims');
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [editName, setEditName] = useState('');
  const [editCommission, setEditCommission] = useState('');
  const [editMinAmount, setEditMinAmount] = useState('');
  const [editInstructions, setEditInstructions] = useState('');

  const [shopierPayments, setShopierPayments] = useState<ShopierPayment[]>([]);
  const [shopierLoading, setShopierLoading] = useState(false);

  const fetchShopierPayments = async () => {
    setShopierLoading(true);
    try {
      const r = await fetch('/api/shopier/admin-payments');
      const d = await r.json();
      if (d.ok) setShopierPayments(d.payments);
    } catch {}
    setShopierLoading(false);
  };

  useEffect(() => {
    fetchShopierPayments();
  }, []);

  // ── Genel istatistikler ──────────────────────────────────────────────────
  const todayStr = new Date().toISOString().split('T')[0];

  // Manuel talepler
  const approvedClaims = paymentRequests.filter(r => r.status === 'Onaylandı');
  const todayManual = approvedClaims.filter(r => r.date?.startsWith(todayStr)).reduce((s, r) => s + r.amount, 0);
  const totalManual = approvedClaims.reduce((s, r) => s + r.amount, 0);

  // Shopier (sadece completed)
  const completedShopier = shopierPayments.filter(p => p.status === 'completed');
  const todayShopier = completedShopier
    .filter(p => (p.processedAt ?? p.createdAt).startsWith(todayStr))
    .reduce((s, p) => s + p.chargeAmount, 0);
  const totalShopier = completedShopier.reduce((s, p) => s + p.chargeAmount, 0);
  const totalShopierFee = completedShopier.reduce((s, p) => s + p.shopierFee, 0);
  const totalShopierNet = completedShopier.reduce((s, p) => s + p.creditAmount, 0);

  // Toplam (birleşik)
  const todayTotal = todayManual + todayShopier;
  const grandTotal = totalManual + totalShopier;

  const handleUpdateMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMethod) return;
    const commission = parseFloat(editCommission);
    const minAmount = parseFloat(editMinAmount);
    updatePaymentMethodDetails(editingMethod.id, {
      name: editName.trim() || editingMethod.name,
      commission: isNaN(commission) ? editingMethod.commission : commission,
      minAmount: isNaN(minAmount) ? editingMethod.minAmount : minAmount,
      instructions: editInstructions,
    });
    setEditingMethod(null);
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#eeeeff]">

      {/* ── Özet Kartlar ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        {/* Bugünkü toplam ciro */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-full" />
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Bugünkü Toplam Ciro</p>
          <p className="text-2xl font-black text-white font-mono">{todayTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</p>
          <div className="mt-2 flex flex-col gap-0.5 text-[10px] text-gray-500">
            <span>Manuel: <span className="text-gray-300 font-mono">{todayManual.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span></span>
            <span>Shopier: <span className="text-cyan-400 font-mono">{todayShopier.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span></span>
          </div>
        </div>

        {/* Toplam birikimli ciro */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden md:col-span-2">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#00D4FF]/5 to-transparent rounded-bl-full" />
          <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-2">Toplam Birikimli Ciro</p>
          <p className="text-3xl font-black text-white font-mono">{grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</p>
          <div className="mt-2 flex gap-4 text-[10px] text-gray-500">
            <span>Manuel: <span className="text-gray-300 font-mono">{totalManual.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span></span>
            <span>Shopier tahsilat: <span className="text-cyan-400 font-mono">{totalShopier.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span></span>
          </div>
        </div>

        {/* Shopier kâr analizi */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-bl-full" />
          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-2">Shopier Kâr Analizi</p>
          <p className="text-xl font-black text-white font-mono">{totalShopierNet.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</p>
          <div className="mt-2 flex flex-col gap-0.5 text-[10px]">
            <span className="text-gray-500">Net (size kalan): <span className="text-emerald-400 font-mono">{totalShopierNet.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span></span>
            <span className="text-gray-500">Shopier komisyonu: <span className="text-rose-400 font-mono">-{totalShopierFee.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span></span>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ─────────────────────────────────────────────────────────── */}
      <div className="flex border-b border-white/5 gap-4">
        <button
          onClick={() => setActiveTab('claims')}
          className={`pb-3 text-xs font-bold tracking-wide uppercase transition relative cursor-pointer ${activeTab === 'claims' ? 'text-[#00D4FF]' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <span>Bakiye Yükleme Talepleri</span>
          {paymentRequests.filter(r => r.status === 'Beklemede').length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-[9px] font-black">
              {paymentRequests.filter(r => r.status === 'Beklemede').length}
            </span>
          )}
          {activeTab === 'claims' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full" />}
        </button>

        <button
          onClick={() => { setActiveTab('shopier'); fetchShopierPayments(); }}
          className={`pb-3 text-xs font-bold tracking-wide uppercase transition relative cursor-pointer ${activeTab === 'shopier' ? 'text-[#00D4FF]' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <span>Shopier Ödemeleri</span>
          {completedShopier.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-[9px] font-black">
              {completedShopier.length}
            </span>
          )}
          {activeTab === 'shopier' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full" />}
        </button>

        <button
          onClick={() => setActiveTab('gateways')}
          className={`pb-3 text-xs font-bold tracking-wide uppercase transition relative cursor-pointer ${activeTab === 'gateways' ? 'text-[#00D4FF]' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <span>Ödeme Kanalları</span>
          {activeTab === 'gateways' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full" />}
        </button>
      </div>

      {/* ── TAB: Manuel Talepler ─────────────────────────────────────────────── */}
      {activeTab === 'claims' && (
        <div className="glass-panel p-5 rounded-3xl">
          {paymentRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Wallet className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-semibold">Henüz bakiye yükleme talebi yok</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-gray-400 font-semibold">
                    <th className="pb-3 pl-3">Bildirim Kodu</th>
                    <th className="pb-3">Üye</th>
                    <th className="pb-3">Ödeme Kanalı</th>
                    <th className="pb-3">Miktar</th>
                    <th className="pb-3">Tarih</th>
                    <th className="pb-3">İşlem ID</th>
                    <th className="pb-3">Durum</th>
                    <th className="pb-3 pr-3 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paymentRequests.map(req => (
                    <tr key={req.id} className="text-gray-300 hover:bg-white/5 transition">
                      <td className="py-3.5 pl-3 font-mono font-bold text-cyan-400">{req.id}</td>
                      <td className="py-3.5 font-semibold text-white">{req.userName}</td>
                      <td className="py-3.5 font-medium text-gray-400">{req.method}</td>
                      <td className="py-3.5 font-bold font-mono text-emerald-400">+{req.amount.toFixed(2)} ₺</td>
                      <td className="py-3.5 text-gray-500">{req.date.replace('T', ' ').substring(0, 16)}</td>
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
                              onClick={() => approvePaymentRequest(req.id)}
                              className="p-1 px-1.5 bg-emerald-950/20 border border-emerald-800/30 text-emerald-400 hover:bg-emerald-900/30 text-[10px] font-bold rounded-lg transition"
                              title="Onayla ve bakiyeyi tanımla"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => rejectPaymentRequest(req.id)}
                              className="p-1 px-1.5 bg-rose-950/20 border border-rose-800/30 text-rose-500 hover:bg-rose-900/30 text-[10px] font-bold rounded-lg transition"
                              title="Reddet"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-500 font-semibold">Tamamlandı</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Shopier Ödemeleri ────────────────────────────────────────────── */}
      {activeTab === 'shopier' && (
        <div className="space-y-4">
          {/* Shopier özet satırı */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-panel p-4 rounded-2xl text-center">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Toplam Tahsilat</p>
              <p className="text-lg font-black font-mono text-white">{totalShopier.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</p>
              <p className="text-[10px] text-gray-600 mt-0.5">müşteriden alınan</p>
            </div>
            <div className="glass-panel p-4 rounded-2xl text-center">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Net Gelir</p>
              <p className="text-lg font-black font-mono text-emerald-400">{totalShopierNet.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</p>
              <p className="text-[10px] text-gray-600 mt-0.5">bakiyeye eklenen</p>
            </div>
            <div className="glass-panel p-4 rounded-2xl text-center">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Shopier Komisyonu</p>
              <p className="text-lg font-black font-mono text-rose-400">{totalShopierFee.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</p>
              <p className="text-[10px] text-gray-600 mt-0.5">Shopier'a giden pay</p>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-cyan-400" />
                Shopier İşlem Geçmişi
              </h3>
              <button
                onClick={fetchShopierPayments}
                disabled={shopierLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-cyan-400 border border-cyan-800/30 rounded-lg hover:bg-cyan-950/20 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${shopierLoading ? 'animate-spin' : ''}`} />
                Yenile
              </button>
            </div>

            {shopierLoading ? (
              <div className="text-center py-10 text-gray-500 text-sm">Yükleniyor...</div>
            ) : shopierPayments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ShoppingCart className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold">Henüz Shopier ödemesi yok</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-400 font-semibold">
                      <th className="pb-3 pl-3">Referans</th>
                      <th className="pb-3">Üye</th>
                      <th className="pb-3 text-right">Tahsilat</th>
                      <th className="pb-3 text-right">Net (size)</th>
                      <th className="pb-3 text-right">Shopier Kes.</th>
                      <th className="pb-3">Tarih</th>
                      <th className="pb-3">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {shopierPayments.map(p => (
                      <tr key={p.ref} className="text-gray-300 hover:bg-white/5 transition">
                        <td className="py-3.5 pl-3 font-mono text-[10px] text-cyan-400">{p.ref}</td>
                        <td className="py-3.5 font-semibold text-white">{p.userName}</td>
                        <td className="py-3.5 text-right font-bold font-mono text-white">{p.chargeAmount.toFixed(2)} ₺</td>
                        <td className="py-3.5 text-right font-bold font-mono text-emerald-400">+{p.creditAmount.toFixed(2)} ₺</td>
                        <td className="py-3.5 text-right font-mono text-rose-400 text-[10px]">-{p.shopierFee.toFixed(2)} ₺</td>
                        <td className="py-3.5 text-gray-500">
                          {(p.processedAt ?? p.createdAt).replace('T', ' ').substring(0, 16)}
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            p.status === 'completed'
                              ? 'bg-emerald-950/20 text-emerald-400 border-emerald-800/20'
                              : 'bg-yellow-950/20 text-yellow-500 border-yellow-800/30 animate-pulse'
                          }`}>
                            {p.status === 'completed' ? 'Tamamlandı' : 'Beklemede'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {completedShopier.length > 0 && (
                    <tfoot>
                      <tr className="border-t border-white/10 text-gray-400 font-bold">
                        <td colSpan={2} className="pt-3 pl-3 text-[10px] uppercase tracking-wider">Toplam ({completedShopier.length} tamamlandı)</td>
                        <td className="pt-3 text-right font-mono text-white">{totalShopier.toFixed(2)} ₺</td>
                        <td className="pt-3 text-right font-mono text-emerald-400">{totalShopierNet.toFixed(2)} ₺</td>
                        <td className="pt-3 text-right font-mono text-rose-400 text-[10px]">-{totalShopierFee.toFixed(2)} ₺</td>
                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: Ödeme Kanalları ─────────────────────────────────────────────── */}
      {activeTab === 'gateways' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.map(method => (
              <div
                key={method.id}
                className="p-5 bg-[#121226]/60 border border-white/5 rounded-2xl flex items-start justify-between gap-4 transition hover:border-[#00D4FF]/20"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-white/5 border border-white/10 rounded-xl">
                      <CreditCard className="w-4 h-4 text-[#00D4FF]" />
                    </div>
                    <h4 className="text-sm font-bold text-white">{method.name}</h4>
                  </div>
                  <div className="pt-2 space-y-1 text-[11px] text-gray-400">
                    <p>Komisyon: <strong className="text-white font-mono">%{method.commission}</strong> &nbsp;|&nbsp; Min: <strong className="text-white font-mono">{method.minAmount} ₺</strong></p>
                    {method.instructions ? (
                      <p className="text-cyan-400/80 truncate flex items-center gap-1">
                        <FileText className="w-3 h-3 shrink-0" />
                        <span className="truncate">{method.instructions}</span>
                      </p>
                    ) : (
                      <p className="text-yellow-500/60 italic flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Hesap bilgisi girilmemiş
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between h-full gap-4 shrink-0">
                  <button
                    onClick={() => togglePaymentMethod(method.id)}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors relative cursor-pointer ${method.status ? 'bg-[#00D4FF]' : 'bg-[#1e1e32]'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${method.status ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                  <button
                    onClick={() => {
                      setEditingMethod(method);
                      setEditName(method.name);
                      setEditCommission(method.commission.toString());
                      setEditMinAmount(method.minAmount.toString());
                      setEditInstructions(method.instructions || '');
                    }}
                    className="p-1 px-2.5 bg-white/5 border border-white/10 text-xs font-bold text-[#00D4FF] hover:bg-white/10 rounded-lg flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Düzenle</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Modal: Ödeme Yöntemi Düzenle ────────────────────────────────────── */}
      {editingMethod && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#121226] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-5 bg-[#171734] border-b border-white/10 flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Ödeme Yöntemi Düzenle
              </h4>
              <button onClick={() => setEditingMethod(null)} className="p-1 hover:bg-white/5 rounded text-gray-500 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateMethod} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Yöntem Adı</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#16162d] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Komisyon (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      required
                      className="w-full bg-[#16162d] border border-white/10 rounded-xl py-3 px-4 font-mono font-black text-white focus:outline-none focus:border-cyan-500/50"
                      value={editCommission}
                      onChange={e => setEditCommission(e.target.value)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-xs">%</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Min. Yükleme (₺)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full bg-[#16162d] border border-white/10 rounded-xl py-3 px-4 font-mono font-black text-white focus:outline-none focus:border-cyan-500/50"
                    value={editMinAmount}
                    onChange={e => setEditMinAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3 h-3" />
                  Hesap Bilgileri / Talimatlar
                </label>
                <textarea
                  rows={4}
                  className="w-full bg-[#16162d] border border-white/10 rounded-xl py-3 px-4 text-sm text-white resize-none focus:outline-none focus:border-cyan-500/50 leading-relaxed"
                  value={editInstructions}
                  onChange={e => setEditInstructions(e.target.value)}
                  placeholder="ör. Papara No: 1234567890&#10;IBAN: TR00 0000 0000 0000 0000 00&#10;BTC: bc1q..."
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingMethod(null)}
                  className="px-4 py-2 rounded-xl border border-white/10 font-bold bg-[#171732] text-gray-300 cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-purple-600 font-bold text-white rounded-xl active:scale-95 cursor-pointer"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
