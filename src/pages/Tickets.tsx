import React, { useState, useRef, useEffect } from 'react';
import { useAppState } from '../context/AppContext';
import { Ticket, quickReplies } from '../data/mockData';
import { Search, Send, Clock, AlertTriangle, Check, RotateCcw, X, MessageSquare, Sparkles } from 'lucide-react';

export const Tickets: React.FC = () => {
  const { 
    tickets, 
    replyTicket, 
    toggleTicketStatus, 
    currentLanguage, 
    showToast 
  } = useAppState();

  const [search, setSearch] = useState('');
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(tickets[0] || null);
  const [typedMessage, setTypedMessage] = useState('');
  
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll inside chat
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTicket, activeTicket?.messages.length]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !typedMessage.trim()) return;

    replyTicket(activeTicket.id, typedMessage, 'admin');
    setTypedMessage('');

    // Trigger update of state pointer reference so chat body immediately shifts
    const targetId = activeTicket.id;
    setTimeout(() => {
      const refreshed = tickets.find(t => t.id === targetId);
      if (refreshed) setActiveTicket(refreshed);
    }, 150);
  };

  const handleApplyQuickReply = (text: string) => {
    setTypedMessage(text);
    showToast(currentLanguage === 'TR' ? 'Hızlı yanıt şablonu mesaja yüklendi!' : 'canned template applied to textbox!', 'info');
  };

  const handleToggleStatus = (status: Ticket['status']) => {
    if (!activeTicket) return;
    toggleTicketStatus(activeTicket.id, status);
    
    // Refresh display
    const targetId = activeTicket.id;
    setTimeout(() => {
      const refreshed = tickets.find(t => t.id === targetId);
      if (refreshed) setActiveTicket(refreshed);
    }, 100);
  };

  const filteredTickets = tickets.filter(t => 
    t.id.toLowerCase().includes(search.toLowerCase()) ||
    t.userName.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase())
  );

  const getPriorityColor = (prio: Ticket['priority']) => {
    switch (prio) {
      case 'Yüksek': return 'bg-rose-950/20 text-rose-500 border-rose-800/20';
      case 'Orta': return 'bg-yellow-950/20 text-yellow-500 border-yellow-800/20';
      default: return 'bg-gray-950/20 text-gray-400 border-gray-800/20';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#eeeeff]">
      
      {/* SMM Helpdesk Hub layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[76vh] items-stretch">
        
        {/* Left Side: Ticket search and listing */}
        <div className="glass-panel p-5 rounded-3xl flex flex-col justify-between h-full overflow-hidden">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold font-sora text-white tracking-wide uppercase">
                {currentLanguage === 'TR' ? 'YÖNETİCİ DESTEK PORTALI' : 'Helpdesk ticket box'}
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">Kullanıcılardan gelen yardım çağrılarını yönetin.</p>
            </div>

            {/* General search inputs */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                id="search-tickets-input"
                type="text"
                placeholder="Bilet ID, konu veya üye ara..."
                className="w-full bg-[#121226]/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-cyan-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Tickets scroll list column */}
          <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-2.5 scrollbar-none">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-12 text-gray-600 text-xs font-semibold">
                Eşleşen yardım bildirim kaydı yok.
              </div>
            ) : (
              filteredTickets.map(ticket => {
                const isActive = activeTicket?.id === ticket.id;
                return (
                  <button
                    id={`ticket-item-btn-${ticket.id}`}
                    key={ticket.id}
                    onClick={() => setActiveTicket(ticket)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition relative flex flex-col text-xs cursor-pointer ${
                      isActive 
                        ? 'bg-[#181832] border-[#00D4FF]/35 shadow' 
                        : 'bg-[#121226]/55 border-white/5 hover:border-white/15'
                    }`}
                  >
                    {/* Glowing highlight sidebar effect */}
                    {isActive && (
                      <div className="absolute left-0 top-3 bottom-3 w-[2px] bg-cyan-400 rounded-full" />
                    )}

                    <div className="flex items-center justify-between mb-1.5 w-full">
                      <span className="font-mono font-bold text-cyan-400">{ticket.id}</span>
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>

                    <h4 className="font-bold text-white line-clamp-1 mb-1">{ticket.subject}</h4>
                    <p className="text-[10px] text-gray-500 font-semibold mb-2">Gönderen: @{ticket.userName}</p>

                    <div className="flex items-center justify-between w-full mt-auto">
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{ticket.date.substring(5, 10)} {ticket.date.substring(11, 16)}</span>
                      </span>

                      <span className={`text-[9px] font-bold uppercase tracking-wider ${
                        ticket.status === 'Açık' 
                          ? 'text-rose-500 animate-pulse' 
                          : ticket.status === 'Cevaplandı' 
                          ? 'text-[#00D4FF]' 
                          : 'text-gray-500'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>

                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active conversation thread detail chat */}
        <div className="glass-panel rounded-3xl lg:col-span-2 overflow-hidden flex flex-col h-full bg-[#121226]/40">
          {activeTicket ? (
            <div className="flex flex-col h-full justify-between">
              
              {/* Active Conversation Details Panel Title */}
              <div className="p-4 bg-[#171734] border-b border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>[{activeTicket.id}] {activeTicket.subject}</span>
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-1 font-semibold">Aktif Müşteri: @{activeTicket.userName} ({activeTicket.userId})</p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status switches */}
                  {activeTicket.status !== 'Kapalı' ? (
                    <button
                      id="close-ticket-status-btn"
                      onClick={() => handleToggleStatus('Kapalı')}
                      className="px-3 py-1.5 bg-rose-950/20 border border-rose-800/30 text-rose-500 hover:bg-rose-950/40 text-[10px] font-bold rounded-lg transition"
                    >
                      Bileti Kapat (Çözüldü)
                    </button>
                  ) : (
                    <button
                      id="reopen-ticket-status-btn"
                      onClick={() => handleToggleStatus('Açık')}
                      className="px-3 py-1.5 bg-cyan-950/20 border border-cyan-800/30 text-[#00D4FF] hover:bg-cyan-950/40 text-[10px] font-bold rounded-lg transition"
                    >
                      Bileti Yeniden Aç
                    </button>
                  )}
                </div>
              </div>

              {/* Chat Thread Messages Box */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-none bg-[#090916]">
                {activeTicket.messages.map(msg => {
                  const isAdminMsg = msg.sender === 'admin';
                  return (
                    <div id={`msg-item-block-${msg.id}`} key={msg.id} className={`flex items-start gap-3 ${isAdminMsg ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center ${isAdminMsg ? 'bg-purple-600 text-white' : 'bg-cyan-950/40 text-cyan-400 border border-cyan-800/30'}`}>
                        {isAdminMsg ? 'AD' : msg.senderName.substring(0,2).toUpperCase()}
                      </div>
                      <div className="max-w-[75%] space-y-1">
                        <span className={`text-[10px] text-gray-500 block ${isAdminMsg ? 'text-right' : ''}`}>
                          {msg.senderName} • {msg.time}
                        </span>
                        <div className={`px-4 py-3 text-xs leading-relaxed rounded-2xl ${isAdminMsg ? 'bg-indigo-600/75 text-white rounded-tr-none' : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-none'}`}>
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              {/* Hızlı yanıt macros canned shortcuts bar */}
              <div className="p-3 bg-[#0d0d1e] border-t border-white/5">
                <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5 tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Cevap Şablonları (Instant Quick Marcos)</span>
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {quickReplies.map((reply, rIdx) => (
                    <button
                      id={`quick-reply-macro-${rIdx}`}
                      key={rIdx}
                      onClick={() => handleApplyQuickReply(reply)}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 rounded-xl text-[10px] font-bold transition shrink-0 cursor-pointer active:scale-95"
                      title={reply}
                    >
                      {reply.substring(0, 22)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Output Form Message typing bar */}
              <form onSubmit={handleSendMessage} className="p-3.5 border-t border-white/10 bg-[#121226] flex items-center gap-2">
                <input
                  id="typed-ticket-message-input"
                  type="text"
                  placeholder="Yanıtlama paneli... Müşteriye cevap gönderin..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs placeholder-gray-600 outline-none text-white focus:border-cyan-400"
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                />
                <button
                  id="send-ticket-message-btn"
                  type="submit"
                  className="p-3 bg-gradient-to-r from-cyan-400 to-purple-500 text-white rounded-xl active:scale-95 shadow hover:shadow-cyan-400/20 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>
          ) : (
            <div className="text-center py-24 my-auto">
              <MessageSquare className="w-14 h-14 text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-medium">İncelemek için sol panelden bir destek biletine tıklayınız.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
