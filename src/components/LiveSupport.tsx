import React, { useState, useRef, useEffect } from 'react';
import { useAppState } from '../context/AppContext';
import { MessageSquare, Send, X, ShieldAlert, Sparkles } from 'lucide-react';

export const LiveSupport: React.FC = () => {
  const { currentLanguage } = useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ id: string; sender: 'user' | 'system'; text: string; time: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    // Welcome message
    if (messages.length === 0) {
      setMessages([
        {
          id: 'w1',
          sender: 'system',
          text: currentLanguage === 'TR' 
            ? 'Hoş geldiniz! Ben SMM Pro Yapay Zeka Danışmanınız. Paneliniz, servisleriniz veya API entegrasyonlarınızla ilgili bana her şeyi sorabilirsiniz.'
            : 'Welcome! I am your SMM Pro AI Assistant. Feel free to ask me anything about your panels, services, or API integrations.',
          time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [currentLanguage]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = {
      id: Math.random().toString(),
      sender: 'user' as const,
      text: inputText,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Simulated system automated expert replies
    setTimeout(() => {
      let replyText = '';
      const query = inputText.toLowerCase();

      if (query.includes('servis') || query.includes('fiyat')) {
        replyText = currentLanguage === 'TR'
          ? 'Hizmetler sayfasından istediğiniz servisi pasif/aktif edebilir, fiyatlarını güncelleyebilirsiniz. Dilerseniz sıralamalarını sürükleyip bırakarak önceliklendirebilirsiniz.'
          : 'You can toggle, edit on-the-fly or reorder SMM catalog listings under the Services sub-menu.';
      } else if (query.includes('api') || query.includes('key')) {
        replyText = currentLanguage === 'TR'
          ? 'API Yönetimi sekmesi üzerinden harici servis sağlayıcıları ekleyebilir, API KEY düzenlemesi yapabilir ve bağlantıları her an test edebilirsiniz.'
          : 'Under API Management, secure external key connections, update providers endpoints, and run diagnostic live tests.';
      } else if (query.includes('bakiye') || query.includes('ödeme') || query.includes('onay')) {
        replyText = currentLanguage === 'TR'
          ? 'Finansal ekranımızda ödeme talepleri listesini görebilirsiniz. Havale/EFT onaylama için "Onayla" demeniz yeterlidir, kullanıcının bakiye hanesi otomatik güncellenecektir.'
          : 'In the Finance dashboard, view top-ups alerts, accept electronic banks wires and automatically adjust client balances.';
      } else if (query.includes('türk') || query.includes('bot')) {
        replyText = currentLanguage === 'TR'
          ? 'Servis listemizdeki VIP 101 ID nolu Türk organik takipçi servisi yüksek kalitelidir ve müşteri memnuniyeti en yüksek olan üründür.'
          : 'Service ID 101 is our premium organic Turkish follower service, guaranteeing stellar retention rates and stellar user feedback.';
      } else {
        replyText = currentLanguage === 'TR'
          ? 'SMM Paneliniz tamamen senkronize çalışmaktadır. Destek biletleri veya para transferlerinde anlık bildirimler almaya devam edeceksiniz.'
          : 'Your SMM Panel is fully functional and synchronized. You will continue to receive real-time notifications about incoming payments or support tickets.';
      }

      const systemMsg = {
        id: Math.random().toString(),
        sender: 'system' as const,
        text: replyText,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, systemMsg]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Expanded chat window */}
      {isOpen && (
        <div className="w-80 md:w-96 h-[28rem] bg-[#121225] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 animate-scale-up">
          {/* Header */}
          <div className="p-4 bg-[#1a1a38] border-b border-white/15 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>SMM AI Copilot</span>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                </h4>
                <p className="text-[10px] text-gray-400 font-medium">Sistem Yöneticisi Asistanı</p>
              </div>
            </div>
            <button 
              id="close-live-support-btn"
              onClick={() => setIsOpen(false)} 
              className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-none bg-[#0e0e1a]">
            {messages.map(m => (
              <div key={m.id} className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${m.sender === 'user' ? 'bg-cyan-500 text-white' : 'bg-purple-600 text-white'}`}>
                  {m.sender === 'user' ? 'AD' : 'AI'}
                </div>
                <div className="max-w-[75%]">
                  <div className={`px-3.5 py-2.5 text-xs rounded-2xl leading-relaxed ${m.sender === 'user' ? 'bg-indigo-600/70 text-white rounded-tr-none' : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-none'}`}>
                    {m.text}
                  </div>
                  <span className={`text-[9px] text-gray-500 mt-1 block ${m.sender === 'user' ? 'text-right' : ''}`}>
                    {m.time}
                  </span>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input Panel */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-[#121225] flex items-center gap-2">
            <input
              id="live-support-input"
              type="text"
              placeholder={currentLanguage === 'TR' ? 'Cevap yazın...' : 'Type your answer...'}
              className="flex-1 bg-white/5 text-xs border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 outline-none focus:border-cyan-400"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button 
              id="live-support-send-btn"
              type="submit" 
              className="p-2.5 bg-gradient-to-r from-cyan-400 to-purple-500 text-white rounded-xl active:scale-95 hover:shadow-cyan-400/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Launcher Button */}
      <button
        id="toggle-live-support-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-tr from-[#00D4FF] to-[#7B2FFF] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-cyan-400/20 active:scale-95 transition-all text-xl cursor-pointer hover:rotate-12"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    </div>
  );
};
