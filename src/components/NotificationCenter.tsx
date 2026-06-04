import React, { useState, useRef, useEffect } from 'react';
import { useAppState } from '../context/AppContext';
import { Bell, CreditCard, MessageSquare, ShieldAlert, Sparkles, X, CheckCheck } from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const { notifications, markNotificationsAsRead, currentLanguage } = useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <CreditCard className="w-4 h-4 text-emerald-400" />;
      case 'ticket':
        return <MessageSquare className="w-4 h-4 text-cyan-400" />;
      case 'security':
        return <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Trigger */}
      <button
        id="toggle-notifications-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl relative text-gray-300 hover:text-white transition active:scale-95 cursor-pointer"
        title="Bildirimler"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-tr from-rose-500 to-purple-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#16162d]">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown list */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 md:w-96 bg-[#131326] border border-white/10 rounded-xl shadow-2xl z-[9000] overflow-hidden animate-scale-up">
          {/* Header */}
          <div className="p-4 bg-[#181832] border-b border-white/10 flex items-center justify-between">
            <h4 className="text-xs font-bold text-white tracking-wider uppercase">
              {currentLanguage === 'TR' ? 'Sistem Bildirimleri' : 'System Notifications'}
            </h4>
            {unreadCount > 0 && (
              <button
                id="mark-all-read-btn"
                onClick={() => {
                  markNotificationsAsRead();
                  setIsOpen(false);
                }}
                className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{currentLanguage === 'TR' ? 'Tamamını Oku' : 'Mark All Read'}</span>
              </button>
            )}
          </div>

          {/* List items */}
          <div className="max-h-72 overflow-y-auto divide-y divide-white/5 bg-[#0e0e1a]">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">
                {currentLanguage === 'TR' ? 'Yeni bildirim bulunmuyor' : 'No new notifications'}
              </div>
            ) : (
              notifications.map(n => (
                <div 
                  id={`notif-item-${n.id}`}
                  key={n.id} 
                  className={`p-3.5 flex items-start gap-3 transition hover:bg-white/5 ${!n.read ? 'bg-indigo-950/20' : ''}`}
                >
                  <div className={`p-2 rounded-lg bg-white/5 border border-white/10`}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-relaxed ${!n.read ? 'text-white font-bold' : 'text-gray-400 font-medium'}`}>
                      {n.text}
                    </p>
                    <span className="text-[10px] text-gray-500 mt-1 block font-medium">
                      {n.time}
                    </span>
                  </div>
                  {!n.read && (
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-[#00D4FF] to-[#7B2FFF] mt-2 flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer view */}
          <div className="p-3 bg-[#0a0a14] border-t border-white/5 text-center">
            <span className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase">
              SMM PRO SECURITY GUARD ENGINE
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
