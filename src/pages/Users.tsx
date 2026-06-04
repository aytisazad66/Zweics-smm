import React, { useState } from 'react';
import { useAppState } from '../context/AppContext';
import { User, Order, PaymentRequest } from '../data/mockData';
import { Search, UserMinus, UserCheck, ShieldAlert, CreditCard, Eye, Plus, Minus, MessageSquare, Save, X, Sparkles, FileText } from 'lucide-react';

export const Users: React.FC = () => {
  const { 
    users, 
    setUsers, 
    orders, 
    paymentRequests, 
    currentLanguage, 
    addBalance, 
    deductBalance, 
    toggleUserStatus, 
    addUserNote,
    showToast 
  } = useAppState();

  const [search, setSearch] = useState('');
  
  // Modals status
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [balanceUser, setBalanceUser] = useState<User | null>(null);
  const [msgUser, setMsgUser] = useState<User | null>(null);
  
  // Balance modifier local states
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceAction, setBalanceAction] = useState<'add' | 'deduct'>('add');
  
  // Messaging mockup
  const [msgText, setMsgText] = useState('');
  const [noteText, setNoteText] = useState('');

  // Search filter
  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleBalanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!balanceUser) return;
    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast(currentLanguage === 'TR' ? 'Lütfen geçerli bir tutar giriniz.' : 'Please enter valid funds amount.', 'error');
      return;
    }

    if (balanceAction === 'add') {
      addBalance(balanceUser.id, amount);
    } else {
      deductBalance(balanceUser.id, amount);
    }

    setBalanceUser(null);
    setBalanceAmount('');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgUser || !msgText.trim()) return;

    showToast(
      currentLanguage === 'TR' ? `${msgUser.fullName} adlı kullanıcıya mesajınız e-posta ve panel içi bilet olarak iletildi.` : `Administrative memo forwarded to ${msgUser.fullName} as dispatch mail.`,
      'success'
    );
    setMsgUser(null);
    setMsgText('');
  };

  const handleSaveNotes = (uId: string) => {
    addUserNote(uId, noteText);
    if (selectedUser) {
      setSelectedUser({ ...selectedUser, note: noteText });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#eeeeff]">
      
      {/* Top Filter and Search bar */}
      <div className="glass-panel p-5 rounded-3xl flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
          <input
            id="search-users-input"
            type="text"
            placeholder={currentLanguage === 'TR' ? 'Müşteri adı, ID veya e-posta ile ara...' : 'Search accounts ledger (e.g. Mehmet)...'}
            className="w-full bg-[#121226]/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs placeholder-gray-500 focus:outline-none focus:border-cyan-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="text-[11px] font-semibold text-gray-500 tracking-wider text-right uppercase">
          {currentLanguage === 'TR' ? `Toplam Müşteri Hacmi: ${users.length} Kayıt` : `Account registry count: ${users.length} clients`}
        </div>
      </div>

      {/* Accounts list table */}
      <div className="glass-panel p-5 rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-gray-400 font-semibold">
                <th className="pb-3 pl-3">ID_Müşteri</th>
                <th className="pb-3">{currentLanguage === 'TR' ? 'Adı Soyadı / Hesap' : 'Name / Profil'}</th>
                <th className="pb-3">E-Posta Adresi</th>
                <th className="pb-3">{currentLanguage === 'TR' ? 'Mevcut Bakiye' : 'Wallet (₺)'}</th>
                <th className="pb-3">{currentLanguage === 'TR' ? 'Ciro Sipariş' : 'Order Count'}</th>
                <th className="pb-3">{currentLanguage === 'TR' ? 'Durum' : 'Account Status'}</th>
                <th className="pb-3 pr-3 text-right">{currentLanguage === 'TR' ? 'İşlemler' : 'Operations'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map(user => (
                <tr id={`user-row-id-${user.id}`} key={user.id} className="text-gray-300 hover:bg-white/5 transition">
                  <td className="py-3.5 pl-3 font-mono font-bold text-cyan-400">{user.id}</td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-cyan-950/40 text-cyan-400 font-black flex items-center justify-center border border-cyan-800/20">
                        {user.fullName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-bold text-white">{user.fullName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 font-medium text-gray-400">{user.email}</td>
                  <td className="py-3.5 font-bold font-mono text-emerald-400">{user.balance.toFixed(2)} ₺</td>
                  <td className="py-3.5 font-bold font-mono">{user.totalOrders} Adet</td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border ${
                      user.status === 'active' 
                        ? 'bg-emerald-950/20 text-emerald-400 border-emerald-800/20' 
                        : 'bg-rose-950/20 text-rose-500 border-rose-800/10'
                    }`}>
                      {user.status === 'active' ? (currentLanguage === 'TR' ? 'Aktif' : 'Active') : (currentLanguage === 'TR' ? 'Askıda' : 'Suspended')}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3 text-right space-x-1.5 whitespace-nowrap">
                    {/* View Drawer detailing */}
                    <button
                      id={`inspect-user-details-btn-${user.id}`}
                      onClick={() => {
                        setSelectedUser(user);
                        setNoteText(user.note || '');
                      }}
                      className="p-1 px-2 bg-white/5 hover:bg-[#181832] text-cyan-400 rounded-lg border border-white/10 active:scale-95"
                      title={currentLanguage === 'TR' ? 'Profil & Ledger Detay' : 'Audit ledger details'}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {/* Balance credit/debit knob */}
                    <button
                      id={`adjust-user-balance-btn-${user.id}`}
                      onClick={() => setBalanceUser(user)}
                      className="p-1 px-2 bg-white/5 hover:bg-emerald-950/20 text-emerald-400 rounded-lg border border-white/10 active:scale-95"
                      title={currentLanguage === 'TR' ? 'Bakiye Tanımla' : 'Transfer/Deduct funds'}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                    </button>

                    {/* Direct Admin Mail memo mockup */}
                    <button
                      id={`direct-msg-user-btn-${user.id}`}
                      onClick={() => setMsgUser(user)}
                      className="p-1 px-2 bg-white/5 hover:bg-purple-950/20 text-purple-400 rounded-lg border border-white/10 active:scale-95"
                      title="Kullanıcıya Mesaj/Bildirim"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>

                    {/* Suspend Account toggle switch */}
                    <button
                      id={`suspend-user-status-btn-${user.id}`}
                      onClick={() => toggleUserStatus(user.id)}
                      className={`p-1 px-2 rounded-lg border border-white/10 active:scale-95 transition ${user.status === 'active' ? 'bg-rose-950/20 text-rose-500 hover:bg-rose-900/10' : 'bg-emerald-950/20 text-emerald-400 hover:bg-emerald-900/10'}`}
                      title={user.status === 'active' ? (currentLanguage === 'TR' ? 'Hesabı Askıya Al' : 'Suspend Account') : (currentLanguage === 'TR' ? 'Hesabı Aktifleştir' : 'Unsuspend Account')}
                    >
                      {user.status === 'active' ? <UserMinus className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BALANCE ADJUSTMENT ACTION MODAL */}
      {balanceUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#121226] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-5 bg-[#171734] border-b border-white/10 flex items-center justify-between">
              <h4 className="text-sm font-bold font-sora text-white flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Hesap Bakiye Düzenleme</span>
              </h4>
              <button onClick={() => setBalanceUser(null)} className="p-1 hover:bg-white/5 rounded text-gray-500 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBalanceSubmit} className="p-5 space-y-4 text-xs">
              <div className="flex items-center gap-3.5 justify-center py-2">
                <button
                  id="balance-action-add-btn"
                  type="button"
                  onClick={() => setBalanceAction('add')}
                  className={`flex-1 py-2 rounded-xl border font-bold text-center flex items-center justify-center gap-1 ${balanceAction === 'add' ? 'bg-emerald-950/20 text-emerald-400 border-emerald-800/30' : 'bg-white/5 border-white/10 text-gray-500'}`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Para Yükle (+)</span>
                </button>
                <button
                  id="balance-action-deduct-btn"
                  type="button"
                  onClick={() => setBalanceAction('deduct')}
                  className={`flex-1 py-2 rounded-xl border font-bold text-center flex items-center justify-center gap-1 ${balanceAction === 'deduct' ? 'bg-rose-950/20 text-rose-500 border-rose-800/30' : 'bg-white/5 border-white/10 text-gray-500'}`}
                >
                  <Minus className="w-4 h-4" />
                  <span>Para Düş (-)</span>
                </button>
              </div>

              <div className="p-3.5 bg-indigo-950/20 border border-white/5 rounded-2xl">
                <p className="text-gray-400 leading-snug">
                  Müşteri: <strong className="text-white">@{balanceUser.fullName}</strong>
                </p>
                <p className="text-gray-400 leading-snug mt-1">
                  Mevcut Cüzdan: <strong className="text-emerald-400 font-mono">{balanceUser.balance.toFixed(2)} ₺</strong>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Yüklenecek / Düşülecek Tutar (TL)</label>
                <div className="relative">
                  <input
                    id="adjust-balance-amount-input"
                    type="number"
                    step="0.01"
                    required
                    className="w-full bg-[#16162d] border border-white/10 rounded-xl py-3 px-4 text-white font-mono font-black"
                    placeholder="örn: 50.00"
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">TL</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                <button
                  id="cancel-adjust-balance-btn"
                  type="button"
                  onClick={() => setBalanceUser(null)}
                  className="px-4 py-2 rounded-xl border border-white/10 font-bold bg-[#171732] hover:bg-white/5 text-gray-300"
                >
                  İptal
                </button>
                <button
                  id="submit-adjust-balance-btn"
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-purple-600 font-bold text-white rounded-xl shadow-lg hover:shadow-cyan-400/10 active:scale-95"
                >
                  Uygula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIRECT MSG MEMO MODAL */}
      {msgUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#121226] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-5 bg-[#171734] border-b border-white/10 flex items-center justify-between">
              <h4 className="text-sm font-bold font-sora text-white flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span>Kullanıcıya Sistem Bildirimi Yayınla</span>
              </h4>
              <button onClick={() => setMsgUser(null)} className="p-1 hover:bg-white/5 rounded text-gray-500 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-[#0f0f1d] border border-white/5 rounded-2xl leading-relaxed text-gray-400">
                Alıcı: <strong className="text-white">@{msgUser.fullName}</strong> • <span className="text-purple-400 font-bold">{msgUser.email}</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Yönetim Mesaj İçeriği</label>
                <textarea
                  id="admin-direct-msg-textarea"
                  required
                  className="w-full bg-[#16162d] border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 h-28"
                  placeholder="Sevgili bayimiz, son bakiye yüklemenizdeki açıklama hatasından ötürü bildiriminiz tamamlandı yapılmadı..."
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                <button
                  id="cancel-direct-msg-btn"
                  type="button"
                  onClick={() => setMsgUser(null)}
                  className="px-4 py-2 rounded-xl border border-white/10 font-bold bg-[#171732] hover:bg-white/5 text-gray-300"
                >
                  Geri
                </button>
                <button
                  id="submit-direct-msg-btn"
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-xl active:scale-95"
                >
                  Bildirimi Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAY LI SİPARİŞ/ÖDEME HISTORIC DRILLDOWN DRAWER MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-end p-0">
          <div className="w-full max-w-2xl bg-[#121226] border-l border-white/10 h-full overflow-hidden shadow-2xl animate-slide-left flex flex-col justify-between">
            
            {/* Header */}
            <div className="p-5 bg-[#171734] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00D4FF] to-[#7B2FFF] text-white font-extrabold flex items-center justify-center text-sm shadow">
                  {selectedUser.fullName.split(' ').map(n=>n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-sm font-bold font-sora text-white leading-tight">{selectedUser.fullName}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5 font-medium">Bakiye: {selectedUser.balance.toFixed(2)} ₺ • ID: {selectedUser.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-1 px-2.5 bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white rounded-xl border border-white/10 active:scale-95 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable contents */}
            <div className="flex-1 p-6 space-y-6 text-xs overflow-y-auto bg-[#0a0a14]/60">
              
              {/* Account properties drilldown */}
              <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div>
                  <p className="text-[9px] font-bold text-gray-500 uppercase">E-posta adresi</p>
                  <p className="font-semibold text-white mt-1">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-500 uppercase">Kayıt Tarihi</p>
                  <p className="font-semibold text-white mt-1 font-mono">{selectedUser.joinedDate}</p>
                </div>
              </div>

              {/* Dynamic Orders associated */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">BU KULLANICIYA AİT SON SİPARİŞLER</p>
                <div className="space-y-2.5">
                  {orders.filter(o => o.userId === selectedUser.id).length === 0 ? (
                    <div className="p-4 text-center text-gray-500 bg-[#121226] border border-white/5 rounded-xl">
                      Bu bayiye ait sipariş kaydı bulunmamaktadır.
                    </div>
                  ) : (
                    orders.filter(o => o.userId === selectedUser.id).map(order => (
                      <div id={`ledger-order-${order.id}`} key={order.id} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="font-mono font-bold text-cyan-400">{order.id}</span>
                          <span className="text-gray-400 text-[11px] block mt-0.5 font-medium">{order.serviceName}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white font-mono">{order.charge.toFixed(2)} ₺</p>
                          <span className={`text-[9px] font-bold ${order.status === 'Tamamlandı' ? 'text-emerald-400' : 'text-yellow-400'}`}>{order.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Dynamic Ledger credit top-ups associated */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">ÖDEME BİLDİRİM GEÇMİŞİ</p>
                <div className="space-y-2.5">
                  {paymentRequests.filter(r => r.userId === selectedUser.id).length === 0 ? (
                    <div className="p-4 text-center text-gray-500 bg-[#121226] border border-white/5 rounded-xl">
                      Finansal ödeme bildirimi bulunmamaktadır.
                    </div>
                  ) : (
                    paymentRequests.filter(r => r.userId === selectedUser.id).map(req => (
                      <div id={`ledger-payment-${req.id}`} key={req.id} className="p-3 bg-[#111126]/60 border border-white/5 rounded-xl flex items-center justify-between">
                        <div>
                          <strong className="text-gray-200">{req.method}</strong>
                          <span className="text-[10px] text-gray-500 block mt-0.5">{req.date.substring(0, 10)}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-emerald-400">+{req.amount} ₺</p>
                          <span className={`text-[9px] font-bold ${req.status === 'Onaylandı' ? 'text-emerald-400' : 'text-rose-500'}`}>{req.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Notes configuration */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>YÖNETİCİ ÖZEL NOTU</span>
                </p>
                <div className="space-y-2">
                  <textarea
                    id="admin-private-user-note-textarea"
                    className="w-full bg-[#121226] border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 h-24 font-semibold"
                    placeholder="Bayi hakkında özel şirket notlarınızı kaydedebilirsiniz (Örn: Yıldız üye, indirim tanımlanabilir)..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                  />
                  <button
                    id="save-admin-user-note-btn"
                    onClick={() => handleSaveNotes(selectedUser.id)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-400 to-purple-600 text-white font-bold rounded-lg ml-auto active:scale-95 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Güncelle ve Kilitle</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-[#0a0a14] border-t border-white/5 text-right">
              <button onClick={() => setSelectedUser(null)} className="px-5 py-2.5 bg-[#171732] hover:bg-white/5 border border-white/10 text-gray-200 hover:text-white rounded-xl active:scale-95">
                Kapat
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
