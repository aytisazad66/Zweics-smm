import React from 'react';
import { useAppState } from '../context/AppContext';
import { Globe } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const { currentLanguage, setCurrentLanguage, showToast } = useAppState();

  const handleLanguageToggle = () => {
    const nextLang = currentLanguage === 'TR' ? 'EN' : 'TR';
    setCurrentLanguage(nextLang);
    showToast(
      nextLang === 'TR' ? 'Dil Türkçe olarak ayarlandı' : 'Language set to English',
      'info'
    );
  };

  return (
    <button
      id="toggle-lang-btn"
      onClick={handleLanguageToggle}
      className="p-2 hover:bg-white/5 border border-white/10 rounded-xl flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white transition cursor-pointer active:scale-95"
      title="Dili Değiştir / Toggle Language"
    >
      <Globe className="w-4 h-4 text-[#00D4FF]" />
      <span>{currentLanguage === 'TR' ? 'TR' : 'EN'}</span>
    </button>
  );
};
