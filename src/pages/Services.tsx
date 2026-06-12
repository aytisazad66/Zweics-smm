import React, { useState } from 'react';
import { useAppState } from '../context/AppContext';
import { Service, PLATFORMS } from '../data/mockData';
import { 
  Sliders, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  ArrowUp, 
  ArrowDown, 
  Globe, 
  Instagram, 
  Youtube, 
  Twitter, 
  Music, 
  Send as SendIcon, 
  Maximize2 
} from 'lucide-react';

export const Services: React.FC = () => {
  const { 
    services, 
    setServices, 
    currentLanguage, 
    addService, 
    updateService, 
    deleteService, 
    toggleServiceStatus,
    reorderServices,
    showToast 
  } = useAppState();

  const [activePlatform, setActivePlatform] = useState<string>('Instagram');
  const [markupPercent, setMarkupPercent] = useState('');
  const [servicesPage, setServicesPage] = useState(1);
  const SERVICES_PER_PAGE = 20;
  
  // Modals state management
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  
  // New service form values
  const [newName, setNewName] = useState('');
  const [newPlatform, setNewPlatform] = useState<typeof PLATFORMS[number]>('Instagram');
  const [newCategory, setNewCategory] = useState('');
  const [newMin, setNewMin] = useState(100);
  const [newMax, setNewMax] = useState(10000);
  const [newPrice, setNewPrice] = useState(10);
  const [newDesc, setNewDesc] = useState('');
  const [newActive, setNewActive] = useState(true);

  // Filter services by parent tab platform
  const filteredServices = services
    .filter(s => s.platform === activePlatform)
    .sort((a,b) => a.sortOrder - b.sortOrder);
  const totalServicePages = Math.ceil(filteredServices.length / SERVICES_PER_PAGE);
  const pagedServices = filteredServices.slice((servicesPage - 1) * SERVICES_PER_PAGE, servicesPage * SERVICES_PER_PAGE);

  // Bulk Price Adjuster
  const handleBulkMarkup = (e: React.FormEvent) => {
    e.preventDefault();
    const percent = parseFloat(markupPercent);
    if (isNaN(percent)) {
      showToast(currentLanguage === 'TR' ? 'Lütfen geçerli bir yüzde giriniz.' : 'Please enter a valid rate percent.', 'error');
      return;
    }

    setServices(prev => prev.map(s => {
      // Apply percentage change
      const nextPrice = s.pricePer1000 + (s.pricePer1000 * (percent / 100));
      return { ...s, pricePer1000: Math.max(0.1, parseFloat(nextPrice.toFixed(2))) };
    }));

    showToast(
      currentLanguage === 'TR' ? `Tüm SMM servis fiyatları %${percent} oranında güncellendi!` : `All SMM catalog listings updated by ${percent}%`,
      'success'
    );
    setMarkupPercent('');
  };

  const handleAddNewService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCategory || !newPrice) {
      showToast(currentLanguage === 'TR' ? 'Alanların tamamını doldurunuz.' : 'Complete all fields.', 'error');
      return;
    }

    addService({
      name: newName,
      platform: newPlatform,
      category: newCategory,
      min: Number(newMin),
      max: Number(newMax),
      pricePer1000: Number(newPrice),
      description: newDesc,
      status: newActive ? 'active' : 'passive'
    });

    setAddModalOpen(false);
    // Reset inputs
    setNewName('');
    setNewCategory('');
    setNewMin(100);
    setNewMax(10000);
    setNewPrice(10);
    setNewDesc('');
  };

  const handleUpdateServiceDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editService) return;

    updateService(editService.id, {
      name: editService.name,
      category: editService.category,
      min: Number(editService.min),
      max: Number(editService.max),
      pricePer1000: Number(editService.pricePer1000),
      description: editService.description
    });

    setEditService(null);
  };

  const getPlatformIcon = (plat: string) => {
    switch (plat.toLowerCase()) {
      case 'instagram': return <Instagram className="w-4 h-4 text-pink-500" />;
      case 'youtube': return <Youtube className="w-4 h-4 text-rose-500" />;
      case 'twitter': return <Twitter className="w-4 h-4 text-sky-400" />;
      case 'spotify': return <Music className="w-4 h-4 text-[#1DB954]" />;
      case 'telegram': return <SendIcon className="w-4 h-4 text-cyan-400" />;
      default: return <Globe className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#eeeeff]">
      
      {/* Top action grid: Add SMM Service Button & Global Price Update Tool */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Right side: bulk pricing update (Toplu Fiyat Güncelleme) */}
        <div className="glass-panel p-5 rounded-3xl lg:col-span-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h4 className="text-sm font-bold font-sora text-white flex items-center gap-2">
              <Sliders className="w-4.5 h-4.5 text-[#00D4FF]" />
              <span>{currentLanguage === 'TR' ? 'Toplu Fiyat Güncelleme' : 'Bulk SMM markup factor'}</span>
            </h4>
            <p className="text-[11px] text-gray-500 mt-1 font-medium">
              {currentLanguage === 'TR' ? 'Portföydeki tüm hizmet fiyatlarını tek seferde yüzdeyle artırın veya düşürün.' : 'Multiply your margin globally. (Prefix negative sign - for discount)'}
            </p>
          </div>

          <form onSubmit={handleBulkMarkup} className="flex items-center gap-2 w-full md:w-auto">
            <input
              id="bulk-markup-percent-input"
              type="text"
              className="bg-[#121226]/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold w-full md:w-28 text-center text-white focus:outline-none focus:border-cyan-400"
              placeholder="% +10"
              value={markupPercent}
              onChange={(e) => setMarkupPercent(e.target.value)}
            />
            <button
              id="apply-bulk-price-markup-btn"
              type="submit"
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-400 to-indigo-500 text-white font-bold rounded-xl text-xs whitespace-nowrap active:scale-95 transition-all cursor-pointer shadow-lg shadow-cyan-950/20"
            >
              {currentLanguage === 'TR' ? 'Uygula' : 'Apply Markup'}
            </button>
          </form>
        </div>

        {/* Left Card: create new product trigger */}
        <div className="glass-panel p-5 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-cyan-400 tracking-wider uppercase mb-1">{currentLanguage === 'TR' ? 'Hızlı Aksiyon' : 'SMM actions'}</p>
            <h4 className="text-sm font-bold font-sora text-white">{currentLanguage === 'TR' ? 'Yeni SMM Hizmeti Oluştur' : 'Introduce New SMM API'}</h4>
          </div>
          <button
            id="open-add-service-modal-btn"
            onClick={() => setAddModalOpen(true)}
            className="p-3.5 bg-gradient-to-tr from-[#00D4FF] to-[#7B2FFF] text-white rounded-2xl shadow-xl shadow-cyan-950/25 active:scale-95 cursor-pointer hover:rotate-90 transition-all"
          >
            <Plus className="w-5.5 h-5.5" />
          </button>
        </div>
      </div>

      {/* Categories Tabs Section */}
      <div className="glass-panel p-2 rounded-2xl flex flex-wrap gap-1 bg-[#121226]/40">
        {PLATFORMS.map(plat => (
          <button
            id={`platform-tab-btn-${plat}`}
            key={plat}
            onClick={() => { setActivePlatform(plat); setServicesPage(1); }}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold rounded-xl transition cursor-pointer ${activePlatform === plat ? 'bg-[#181832] text-[#00D4FF] shadow border border-white/5' : 'hover:bg-white/5 text-gray-500 hover:text-gray-300'}`}
          >
            {getPlatformIcon(plat)}
            <span>{plat}</span>
          </button>
        ))}
      </div>

      {/* Grid: Services List Card/Table view supporting simulated Drag & Drop sorting */}
      <div className="glass-panel p-5 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold font-sora text-white tracking-wide uppercase flex items-center gap-2">
              <span>{activePlatform} {currentLanguage === 'TR' ? 'Servis Rehberi' : 'SMM Catalog'}</span>
              <span className="text-[10px] font-mono font-black bg-[#00D4FF]/10 text-cyan-400 px-1.5 py-0.5 rounded-md border border-cyan-800/20">{filteredServices.length} Adet</span>
            </h3>
            <p className="text-[11px] text-gray-500 font-medium">Sayfa {servicesPage}/{totalServicePages || 1} • Toplam {filteredServices.length} hizmet • 20'şer görüntüleniyor</p>
          </div>
        </div>

        {filteredServices.length === 0 ? (
          <div className="text-center py-16 bg-[#0e0e1a]/20 rounded-2xl border border-white/5">
            <Trash2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400 font-medium">{currentLanguage === 'TR' ? 'Bu platform kategorisinde henüz bir hizmet tanımlanmadı.' : 'This category contains no services.'}</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {pagedServices.map((service, index) => {
              const index_in_filtered = (servicesPage - 1) * SERVICES_PER_PAGE + index;
              const fromIdxInOriginal = services.findIndex(s => s.id === service.id);
              
              return (
                <div 
                  id={`service-row-item-${service.id}`}
                  key={service.id}
                  className="p-4 bg-[#121226]/60 border border-white/5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition hover:border-[#00D4FF]/20"
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Move items order triggers (simulated drag & drop) */}
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button
                        id={`move-up-service-${service.id}`}
                        onClick={() => {
                          if (index_in_filtered > 0) {
                            const previousS = filteredServices[index_in_filtered - 1];
                            const fromIdx = services.findIndex(s => s.id === service.id);
                            const toIdx = services.findIndex(s => s.id === previousS.id);
                            reorderServices(fromIdx, toIdx);
                          }
                        }}
                        disabled={index_in_filtered === 0}
                        className={`p-1.5 hover:bg-white/5 text-gray-600 rounded-lg transition ${index_in_filtered === 0 ? 'opacity-25 cursor-not-allowed' : 'hover:text-cyan-400 cursor-pointer'}`}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`move-down-service-${service.id}`}
                        onClick={() => {
                          if (index_in_filtered < filteredServices.length - 1) {
                            const nextS = filteredServices[index_in_filtered + 1];
                            const fromIdx = services.findIndex(s => s.id === service.id);
                            const toIdx = services.findIndex(s => s.id === nextS.id);
                            reorderServices(fromIdx, toIdx);
                          }
                        }}
                        disabled={index_in_filtered === filteredServices.length - 1}
                        className={`p-1.5 hover:bg-white/5 text-gray-600 rounded-lg transition ${index_in_filtered === filteredServices.length - 1 ? 'opacity-25 cursor-not-allowed' : 'hover:text-cyan-400 cursor-pointer'}`}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* ID and descriptions */}
                    <div className="min-w-0">
                      <span className="text-[10px] bg-indigo-950/40 text-purple-400 border border-indigo-900/30 font-bold px-2 py-0.5 rounded-lg font-mono">
                        ID_{service.id}
                      </span>
                      <h4 className="text-xs font-bold text-white mt-1.5 leading-snug">{service.name}</h4>
                      <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-1">{service.description}</p>
                      
                      <div className="flex items-center gap-3.5 mt-2 flex-wrap">
                        <span className="text-[10px] font-bold text-gray-400">Min: <strong className="text-white font-mono">{service.min}</strong></span>
                        <span className="text-[10px] font-bold text-gray-400">Max: <strong className="text-white font-mono">{service.max}</strong></span>
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">{service.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and status controllers */}
                  <div className="flex items-center gap-5.5 justify-between md:justify-end w-full md:w-auto flex-shrink-0 border-t border-white/5 md:border-none pt-3.5 md:pt-0">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] font-semibold text-gray-500 block uppercase">1000 Adet Fiyatı</span>
                      <p className="text-sm font-black text-[#00D4FF] font-mono mt-0.5">{service.pricePer1000.toFixed(2)} ₺</p>
                    </div>

                    {/* Active state switch */}
                    <div className="flex items-center gap-3">
                      <button
                        id={`toggle-service-status-switch-${service.id}`}
                        onClick={() => toggleServiceStatus(service.id)}
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors relative cursor-pointer ${service.status === 'active' ? 'bg-[#00D4FF]' : 'bg-[#1e1e32]'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${service.status === 'active' ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>

                      {/* Edit actions */}
                      <button
                        id={`edit-service-details-btn-${service.id}`}
                        onClick={() => setEditService(service)}
                        className="p-2 bg-white/5 border border-white/10 text-gray-400 hover:text-white rounded-xl transition cursor-pointer active:scale-95"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete actions */}
                      <button
                        id={`delete-service-btn-${service.id}`}
                        onClick={() => deleteService(service.id)}
                        className="p-2 bg-white/5 border border-white/10 text-rose-500 hover:text-rose-400 rounded-xl transition cursor-pointer active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalServicePages > 1 && (
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
            <p className="text-[11px] text-gray-500">
              {(servicesPage - 1) * SERVICES_PER_PAGE + 1}–{Math.min(servicesPage * SERVICES_PER_PAGE, filteredServices.length)} / {filteredServices.length} hizmet
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setServicesPage(p => Math.max(1, p - 1))}
                disabled={servicesPage === 1}
                className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
              >← Önceki</button>
              {Array.from({ length: totalServicePages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setServicesPage(p)}
                  className={`w-7 h-7 text-[11px] font-bold rounded-lg transition cursor-pointer ${p === servicesPage ? 'bg-cyan-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                >{p}</button>
              ))}
              <button
                onClick={() => setServicesPage(p => Math.min(totalServicePages, p + 1))}
                disabled={servicesPage === totalServicePages}
                className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
              >Sonraki →</button>
            </div>
          </div>
        )}
      </div>

      {/* NEW SERVICE MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#121226] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-scale-up">
            
            <div className="p-5 bg-[#171734] border-b border-white/10 flex items-center justify-between">
              <h4 className="text-sm font-bold font-sora text-white flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>{currentLanguage === 'TR' ? 'Yeni SMM Hizmeti Ekle' : 'Define New SMM Agent'}</span>
              </h4>
              <button 
                id="close-add-service-modal-btn-X"
                onClick={() => setAddModalOpen(false)} 
                className="p-1 hover:bg-white/5 rounded text-gray-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewService} className="p-6 space-y-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-400 uppercase">{currentLanguage === 'TR' ? 'Hizmet Adı' : 'Public label name'}</label>
                <input
                  id="add-service-name-input"
                  type="text"
                  className="w-full bg-[#16162d] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400"
                  placeholder="örn: Instagram Çekiliş ile Organik Türk Takipçi"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase">Platform Ağ</label>
                  <select
                    id="add-service-platform-select"
                    className="w-full bg-[#16162d] border border-white/10 rounded-xl py-3 px-3 text-white focus:outline-none focus:border-cyan-400"
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value as typeof PLATFORMS[number])}
                  >
                    {PLATFORMS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase">Kategori</label>
                  <input
                    id="add-service-category-input"
                    type="text"
                    className="w-full bg-[#16162d] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400"
                    placeholder="örn: Takipçi, İzlenme, Beğeni"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase">Min Sipariş</label>
                  <input
                    id="add-service-min-input"
                    type="number"
                    className="w-full bg-[#16162d] border border-white/10 rounded-xl py-2.5 px-3.5 text-white focus:outline-none focus:border-cyan-400"
                    value={newMin}
                    onChange={(e) => setNewMin(Number(e.target.value))}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase">Max Sipariş</label>
                  <input
                    id="add-service-max-input"
                    type="number"
                    className="w-full bg-[#16162d] border border-white/10 rounded-xl py-2.5 px-3.5 text-white focus:outline-none focus:border-cyan-400"
                    value={newMax}
                    onChange={(e) => setNewMax(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase">Fiyat (Per 1k / TL)</label>
                  <input
                    id="add-service-price-input"
                    type="number"
                    step="0.01"
                    className="w-full bg-[#16162d] border border-white/10 rounded-xl py-2.5 px-3.5 text-white focus:outline-none focus:border-cyan-400"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-400 uppercase">Açıklama</label>
                <textarea
                  id="add-service-desc-textarea"
                  className="w-full bg-[#16162d] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400 h-24"
                  placeholder="Ürün teslim hızı, garanti durumu ve diğer detaylar..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2.5">
                <input
                  id="add-service-active-checkbox"
                  type="checkbox"
                  checked={newActive}
                  onChange={(e) => setNewActive(e.target.checked)}
                  className="w-4.5 h-4.5 bg-white/5 border border-white/10 rounded"
                />
                <span className="font-semibold text-gray-300">Eklenince anında aktif olsun</span>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                <button
                  id="add-service-cancel-btn"
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-5 py-3 border border-white/10 rounded-xl font-bold bg-[#171732] hover:bg-white/5 text-gray-300 hover:text-white transition cursor-pointer"
                >
                  {currentLanguage === 'TR' ? 'İptal' : 'Back'}
                </button>
                <button
                  id="add-service-submit-btn"
                  type="submit"
                  className="px-5 py-3 bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-bold rounded-xl transition cursor-pointer active:scale-95"
                >
                  {currentLanguage === 'TR' ? 'Ekle' : 'Confirm'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* EDIT SERVICE DETAILS MODAL */}
      {editService && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#121226] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-scale-up">
            
            <div className="p-5 bg-[#171734] border-b border-white/10 flex items-center justify-between">
              <h4 className="text-sm font-bold font-sora text-white flex items-center gap-1.5">
                <Edit className="w-4 h-4 text-cyan-400" />
                <span>Hizmet Bilgilerini Düzenle</span>
              </h4>
              <button 
                id="close-edit-service-modal-btn"
                onClick={() => setEditService(null)} 
                className="p-1 hover:bg-white/5 rounded text-gray-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateServiceDetails} className="p-6 space-y-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-400 uppercase">Hizmet Adı</label>
                <input
                  id="edit-service-name-input"
                  type="text"
                  className="w-full bg-[#16162d] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400"
                  value={editService.name}
                  onChange={(e) => setEditService({ ...editService, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase">Kategori</label>
                  <input
                    id="edit-service-category-input"
                    type="text"
                    className="w-full bg-[#16162d] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400"
                    value={editService.category}
                    onChange={(e) => setEditService({ ...editService, category: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase">Para Birimi Fiyatı (1k / TL)</label>
                  <input
                    id="edit-service-price-input"
                    type="number"
                    step="0.1"
                    className="w-full bg-[#16162d] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400"
                    value={editService.pricePer1000}
                    onChange={(e) => setEditService({ ...editService, pricePer1000: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase">Minimum Miktar</label>
                  <input
                    id="edit-service-min-input"
                    type="number"
                    className="w-full bg-[#16162d] border border-white/10 rounded-xl py-2.5 px-3.5 text-white focus:outline-none focus:border-cyan-400"
                    value={editService.min}
                    onChange={(e) => setEditService({ ...editService, min: Number(e.target.value) })}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase">Maksimum Miktar</label>
                  <input
                    id="edit-service-max-input"
                    type="number"
                    className="w-full bg-[#16162d] border border-white/10 rounded-xl py-2.5 px-3.5 text-white focus:outline-none focus:border-cyan-400"
                    value={editService.max}
                    onChange={(e) => setEditService({ ...editService, max: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-400 uppercase">Açıklama Detayları</label>
                <textarea
                  id="edit-service-desc-textarea"
                  className="w-full bg-[#16162d] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400 h-24"
                  value={editService.description}
                  onChange={(e) => setEditService({ ...editService, description: e.target.value })}
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                <button
                  id="edit-service-cancel-btn"
                  type="button"
                  onClick={() => setEditService(null)}
                  className="px-5 py-3 border border-white/10 rounded-xl bg-[#171732] hover:bg-white/5 text-gray-300 hover:text-white transition cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  id="edit-service-submit-btn"
                  type="submit"
                  className="px-5 py-3 bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-bold rounded-xl transition cursor-pointer active:scale-95"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
