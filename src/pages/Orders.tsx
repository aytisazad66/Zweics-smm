import React, { useState } from 'react';
import { useAppState } from '../context/AppContext';
import { Order, PLATFORMS } from '../data/mockData';
import { Search, Eye, Filter, Trash2, Check, Ban, ChevronLeft, ChevronRight, CornerDownRight, X, Sparkles, Sliders } from 'lucide-react';

export const Orders: React.FC = () => {
  const { 
    orders, 
    setOrders, 
    currentLanguage, 
    updateOrderStatus, 
    addNotification, 
    showToast 
  } = useAppState();

  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  
  // Modal states
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter logic
  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.username.toLowerCase().includes(search.toLowerCase()) ||
      o.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      o.link.toLowerCase().includes(search.toLowerCase());
      
    const matchesPlatform = platformFilter === 'All' || o.platform === platformFilter;
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;

    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(paginatedOrders.map(o => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleSelectRow = (checked: boolean, id: string) => {
    if (checked) {
      setSelectedOrderIds(prev => [...prev, id]);
    } else {
      setSelectedOrderIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedOrderIds.length === 0) return;
    setOrders(prev => prev.filter(o => !selectedOrderIds.includes(o.id)));
    showToast(currentLanguage === 'TR' ? 'Seçilen siparişler silindi.' : 'Selected orders removed.', 'error');
    setSelectedOrderIds([]);
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#eeeeff]">
      
      {/* Search and Advanced Filters Panel */}
      <div className="glass-panel p-5 rounded-3xl space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Main search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
            <input
              id="search-orders-input"
              type="text"
              placeholder={currentLanguage === 'TR' ? 'Sipariş ID, link veya kullanıcı adı ile ara...' : 'Search checkout by ID, user handle etc...'}
              className="w-full bg-[#121226]/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs placeholder-gray-500 focus:outline-none focus:border-cyan-400"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Platform category select */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-semibold">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentLanguage === 'TR' ? 'Platform' : 'Network'}:</span>
            </div>
            
            <select
              id="filter-orders-platform"
              className="bg-[#121226]/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold focus:border-cyan-400 focus:outline-none"
              value={platformFilter}
              onChange={(e) => {
                setPlatformFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">{currentLanguage === 'TR' ? 'Tüm Ağlar' : 'All Networks'}</option>
              {PLATFORMS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            {/* Status select */}
            <select
              id="filter-orders-status"
              className="bg-[#121226]/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold focus:border-cyan-400 focus:outline-none"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">{currentLanguage === 'TR' ? 'Tüm Durumlar' : 'All Statuses'}</option>
              <option value="Bekliyor">Bekliyor</option>
              <option value="İşlemde">İşlemde</option>
              <option value="Tamamlandı">Tamamlandı</option>
              <option value="İptal">İptal</option>
            </select>
          </div>
        </div>

        {/* Bulk processing control bar */}
        {selectedOrderIds.length > 0 && (
          <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-scale-up">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00D4FF]" />
              <span className="text-xs font-bold text-gray-200">
                {selectedOrderIds.length} {currentLanguage === 'TR' ? 'sipariş seçildi' : 'orders checked'}
              </span>
              <span className="text-[10px] text-cyan-400 font-mono font-bold bg-cyan-950/40 px-2 py-0.5 rounded-lg border border-cyan-500/10">
                ⚡ {currentLanguage === 'TR' ? 'SMM API Otomasyonu' : 'SMM API Automation'}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                id="bulk-delete"
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF2E74]/15 border border-[#FF2E74]/30 text-[#FF2E74] hover:bg-[#FF2E74]/25 text-[10px] font-bold rounded-lg transition active:scale-95 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{currentLanguage === 'TR' ? 'Sistemden Sil' : 'Delete'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Orders Table list */}
      <div className="glass-panel p-5 rounded-3xl overflow-hidden">
        {paginatedOrders.length === 0 ? (
          <div className="text-center py-16">
            <Trash2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400 font-medium">{currentLanguage === 'TR' ? 'Aranan ölçütlere uygun hiçbir sipariş bulunamadı.' : 'No matched orders found.'}</p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-gray-400 font-semibold">
                    <th className="pb-3 pl-3">
                      <input
                        id="select-all-orders-checkbox"
                        type="checkbox"
                        className="w-4.5 h-4.5 rounded bg-white/5 border border-white/10"
                        checked={selectedOrderIds.length === paginatedOrders.length && paginatedOrders.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th className="pb-3">{currentLanguage === 'TR' ? 'Sipariş ID' : 'Order ID'}</th>
                    <th className="pb-3">{currentLanguage === 'TR' ? 'Kullanıcı' : 'Account'}</th>
                    <th className="pb-3">{currentLanguage === 'TR' ? 'Hizmet / Servis Detayı' : 'SMM Service'}</th>
                    <th className="pb-3">{currentLanguage === 'TR' ? 'Adet' : 'Qty'}</th>
                    <th className="pb-3">{currentLanguage === 'TR' ? 'Ödeme Tutar' : 'Charge'}</th>
                    <th className="pb-3">{currentLanguage === 'TR' ? 'Durum' : 'Status'}</th>
                    <th className="pb-3 pr-3 text-right">{currentLanguage === 'TR' ? 'İşlemler' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedOrders.map(order => (
                    <tr id={`orders-row-${order.id}`} key={order.id} className="text-gray-300 hover:bg-white/5 transition-all">
                      <td className="py-3.5 pl-3">
                        <input
                          id={`select-order-checkbox-${order.id}`}
                          type="checkbox"
                          className="w-4.5 h-4.5 rounded bg-white/5 border border-white/10"
                          checked={selectedOrderIds.includes(order.id)}
                          onChange={(e) => handleSelectRow(e.target.checked, order.id)}
                        />
                      </td>
                      <td className="py-3.5 font-mono font-bold text-[#00D4FF]">{order.id}</td>
                      <td className="py-3.5 font-semibold text-white">@{order.username}</td>
                      <td className="py-3.5">
                        <div className="max-w-xs md:max-w-md">
                          <p className="font-semibold text-gray-200 line-clamp-1">{order.serviceName}</p>
                          <a href={order.link} target="_blank" className="text-[10px] text-cyan-400 hover:underline mt-0.5 block line-clamp-1 truncate">{order.link}</a>
                        </div>
                      </td>
                      <td className="py-3.5 font-bold font-mono text-gray-300">{order.quantity.toLocaleString('tr-TR')}</td>
                      <td className="py-3.5 font-bold font-mono text-[#00D4FF]">{order.charge.toFixed(2)} ₺</td>
                      <td className="py-3.5">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border ${
                            order.status === 'Tamamlandı' 
                              ? 'bg-emerald-950/20 text-emerald-400 border-emerald-800/30 font-bold' 
                              : order.status === 'İşlemde' 
                              ? 'bg-yellow-950/20 text-yellow-400 border-yellow-800/30 font-bold' 
                              : order.status === 'İptal' 
                              ? 'bg-red-950/20 text-red-400 border-red-800/30 font-bold' 
                              : 'bg-gray-950/20 text-gray-400 border-gray-800/30 font-bold'
                          }`}>
                            {order.status}
                          </span>
                          <span className="text-[8px] text-cyan-400 font-mono font-bold flex items-center gap-0.5 mt-0.5 uppercase tracking-wide">
                            <Sparkles className="w-2.5 h-2.5 text-cyan-400 animate-pulse shrink-0" />
                            <span>{currentLanguage === 'TR' ? 'OTOMATİK API' : 'AUTO API'}</span>
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-3 text-right">
                        <button
                          id={`view-order-details-btn-${order.id}`}
                          onClick={() => setViewingOrder(order)}
                          className="p-1 px-2.5 bg-white/5 hover:bg-white/10 text-cyan-400 hover:text-cyan-200 text-[10px] font-bold rounded-lg border border-white/10 transition active:scale-95 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{currentLanguage === 'TR' ? 'Loglar' : 'Logs'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls bar */}
            <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs mt-3">
              <span className="text-gray-500 font-semibold">
                {currentLanguage === 'TR' ? `Toplam ${filteredOrders.length} siparişten ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, filteredOrders.length)} gösteriliyor` : `Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, filteredOrders.length)} of ${filteredOrders.length}`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  id="orders-prev-page-btn"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`p-1.5 border border-white/10 rounded-lg text-gray-400 hover:text-white bg-white/5 transition active:scale-95 ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-gray-200 bg-[#16162d] px-3 py-1 rounded-lg">
                  {currentPage} / {totalPages || 1}
                </span>
                <button
                  id="orders-next-page-btn"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`p-1.5 border border-white/10 rounded-lg text-gray-400 hover:text-white bg-white/5 transition active:scale-95 ${currentPage === totalPages || totalPages === 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DETAY MODEL MODAL */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#121226] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-scale-up">
            
            {/* Header */}
            <div className="p-5 bg-[#171734] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#00D4FF] bg-[#00D4FF]/10 px-2 py-1 rounded">
                  {viewingOrder.id}
                </span>
                <h4 className="text-sm font-bold font-sora text-white">
                  {currentLanguage === 'TR' ? 'Sipariş Dağıtım Detayları' : 'Order Distribution Logs'}
                </h4>
              </div>
              <button 
                id="close-order-modal-btn"
                onClick={() => setViewingOrder(null)} 
                className="p-1 hover:bg-white/5 rounded text-gray-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5 text-xs max-h-[70vh] overflow-y-auto">
              {/* Core Attributes */}
              <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{currentLanguage === 'TR' ? 'Hedef / Bağlantı' : 'Target URL'}</p>
                  <a href={viewingOrder.link} target="_blank" className="font-bold text-cyan-400 hover:underline inline-block truncate max-w-full mt-1">{viewingOrder.link}</a>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{currentLanguage === 'TR' ? 'SMM Hizmet ID' : 'SMM Service'}</p>
                  <p className="font-semibold text-white mt-1">[{viewingOrder.serviceId}] {viewingOrder.serviceName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{currentLanguage === 'TR' ? 'Miktar' : 'Quantity'}</p>
                  <p className="font-bold text-white mt-1 font-mono">{viewingOrder.quantity.toLocaleString('tr-TR')} adet</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{currentLanguage === 'TR' ? 'Hizmet Bedeli' : 'Paid Amount'}</p>
                  <p className="font-black text-[#00D4FF] mt-1 font-mono">{viewingOrder.charge.toFixed(2)} ₺</p>
                </div>
              </div>

              {/* API Provider Status */}
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">PRO-SYSTEM API ROUTING WORKSPACE</p>
                <div className="p-3 bg-[#0d0d1e] border border-white/5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="font-semibold text-gray-300">TurkPaneli.com SMM Dağıtıcı API</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/20 px-2.5 py-1 rounded-lg">STATUS: SUCCESS</span>
                </div>
              </div>

              {/* Logs Stream */}
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">{currentLanguage === 'TR' ? 'Yükleme Sunucu Günlükleri' : 'Delivery Audit logs'}</p>
                <div className="space-y-3 pl-2.5 border-l border-white/10 py-1.5 font-mono">
                  {viewingOrder.logs.map((log, lIdx) => (
                    <div id={`order-log-${lIdx}`} key={lIdx} className="flex gap-3 relative">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 absolute -left-3.5 top-1.5 shadow-sm" />
                      <span className="text-gray-500 font-bold">{log.time}</span>
                      <p className="text-gray-300 leading-relaxed font-semibold flex-1">{log.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#0a0a14] border-t border-white/5 flex items-center justify-end">
              <button
                id="close-viewing-order-btn"
                onClick={() => setViewingOrder(null)}
                className="px-5 py-2.5 bg-[#171732] hover:bg-white/5 text-gray-200 hover:text-white font-bold rounded-xl active:scale-95 border border-white/10 transition cursor-pointer"
              >
                {currentLanguage === 'TR' ? 'Kapat' : 'Dismiss'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
