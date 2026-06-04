import React from 'react';
import { useAppState } from '../context/AppContext';
import { HelpCircle, Star, Sparkles, Sliders, ShieldAlert, CheckCircle, ArrowRight, X } from 'lucide-react';

export const OnboardingWizard: React.FC = () => {
  const { 
    onboardingStep, 
    setOnboardingStep, 
    isOnboardingActive, 
    setIsOnboardingActive, 
    currentLanguage,
    setCurrentTab
  } = useAppState();

  if (!isOnboardingActive) return null;

  const steps = [
    {
      title: currentLanguage === 'TR' ? "SMM Panel'e Hoş Geldiniz! ✨" : 'Welcome to SMM Panel! ✨',
      description: currentLanguage === 'TR' 
        ? 'Bu interaktif tur ile SMM Panel Admin Arayüzünün tüm gelişmiş yeteneklerini, finansal yönetim araçlarını ve servis otomasyonlarını anında keşfedin.'
        : 'With this interactive tour, explore SMM Panel Admin advanced capabilities, financial management tools, and service automations instantly.',
      icon: Sparkles,
      color: 'from-blue-500 to-purple-500',
      action: () => setCurrentTab('dashboard')
    },
    {
      title: currentLanguage === 'TR' ? 'Gelişmiş Sipariş Akışı 📦' : 'Advanced Order Pipeline 📦',
      description: currentLanguage === 'TR'
        ? 'Gelen tüm sosyal medya siparişlerini tek bir ekrandan görün. Anlık durum kontrolleri, log geçmişi inceleme ve toplu servis iptal/iade işlemlerini gerçekleştirin.'
        : 'See all social media orders from a single view. Real-time status checks, detail log inspection, and bulk order cancel/refund actions.',
      icon: Sliders,
      color: 'from-yellow-500 to-orange-500',
      action: () => setCurrentTab('orders')
    },
    {
      title: currentLanguage === 'TR' ? 'Hizmet Kataloğu & Sürükle-Bırak 🛠' : 'Services Catalogue & Drag-Drop 🛠',
      description: currentLanguage === 'TR'
        ? 'Kategorilere göre ayrılmış servisleri yönetin. Servisleri sürükleyip bırakarak öncelik sıralaması yapabilir, anlık fiyatları güncelleyebilir veya aktif/pasif moduna alabilirsiniz.'
        : 'Manage your portfolio by categories. Drag and drop services to sort prioritization, update pricing/rates on-the-fly, or toggle live status.',
      icon: HelpCircle,
      color: 'from-purple-500 to-pink-500',
      action: () => setCurrentTab('services')
    },
    {
      title: currentLanguage === 'TR' ? 'API Entegrasyon & Otomasyon 🔌' : 'API Providers & Automation 🔌',
      description: currentLanguage === 'TR'
        ? 'Dış sağlayıcılardan API ile servis çekin veya siparişleri otomatik o kanala yönlendirin. API bağlantılarını her an test edin ve sağlayıcıdaki bakiye durumunu görün.'
        : 'Pull automated services or forward outgoing orders to external SMM providers through APIs. Test key configurations and fetch provider balance.',
      icon: ShieldAlert,
      color: 'from-cyan-500 to-blue-500',
      action: () => setCurrentTab('api')
    },
    {
      title: currentLanguage === 'TR' ? 'Finans, Ödeme & Manuel Bildirimler 💳' : 'Finance, Payment & Manual Ledger 💳',
      description: currentLanguage === 'TR'
        ? 'Müşterilerinizin bakiye yükleme taleplerini görün, Havale/EFT ödemelerini tek tıkla inceleyip onaylayarak otomatik bakiye tanımlaması yapın.'
        : 'Monitor manual balance top-ups. Confirm electronic bank transfers with a single click and automatically credit customer account.',
      icon: Star,
      color: 'from-green-500 to-emerald-500',
      action: () => setCurrentTab('finance')
    },
    {
      title: currentLanguage === 'TR' ? 'Tebrikler! Güvendesiniz 🚀' : 'Congratulations! You are ready 🚀',
      description: currentLanguage === 'TR'
        ? 'Artık SMM Panel işletmenizin tüm yönetim süreçlerini başlatmaya hazırsınız. Yardıma ihtiyaç duyarsanız sağ alttaki Canlı Destek panelinden her an ulaşabilirsiniz.'
        : 'You are now ready to run your digital marketing platform. If you ever need help, feel free to use the floating Live Support widget on bottom right.',
      icon: CheckCircle,
      color: 'from-emerald-500 to-teal-500',
      action: () => setCurrentTab('dashboard')
    }
  ];

  const curr = steps[onboardingStep];
  const IconComponent = curr.icon;

  const handleNext = () => {
    curr.action();
    if (onboardingStep < steps.length - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      setIsOnboardingActive(false);
      setOnboardingStep(0);
    }
  };

  const handlePrev = () => {
    if (onboardingStep > 0) {
      setOnboardingStep(onboardingStep - 1);
      steps[onboardingStep - 1].action();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#16162d] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
        <button 
          id="close-onboarding-btn"
          onClick={() => {
            setIsOnboardingActive(false);
            setOnboardingStep(0);
          }} 
          className="absolute top-4 right-4 text-gray-500 hover:text-white p-1 hover:bg-white/5 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress header bar */}
        <div className="h-1 text-gray-100 flex gap-1">
          {steps.map((_, idx) => (
            <div 
              id={`onboarding-progress-step-${idx}`}
              key={idx} 
              className={`h-full flex-1 transition-all duration-300 ${idx <= onboardingStep ? 'bg-gradient-to-r from-cyan-400 to-purple-500' : 'bg-gray-800'}`}
            />
          ))}
        </div>

        <div className="p-8 text-center flex flex-col items-center">
          <div className={`p-4 rounded-full bg-gradient-to-tr ${curr.color} text-white mb-6 shadow-lg shadow-purple-950/20`}>
            <IconComponent className="w-10 h-10" />
          </div>

          <h3 className="text-xl font-bold font-sora text-white mb-3">
            {curr.title}
          </h3>

          <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-md">
            {curr.description}
          </p>

          <div className="flex items-center justify-between w-full mt-auto">
            <button
              id="prev-onboarding-step-btn"
              onClick={handlePrev}
              disabled={onboardingStep === 0}
              className={`px-4 py-2 rounded-xl text-xs font-semibold ${onboardingStep === 0 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 hover:bg-white/5 bg-transparent'}`}
            >
              {currentLanguage === 'TR' ? 'Önceki' : 'Back'}
            </button>

            <span className="text-xs text-gray-500">
              {onboardingStep + 1} / {steps.length}
            </span>

            <button
              id="next-onboarding-step-btn"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-[#00D4FF] to-[#7B2FFF] text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-cyan-400/20 active:scale-95 transition-all"
            >
              <span>{onboardingStep === steps.length - 1 ? (currentLanguage === 'TR' ? 'Tamamla' : 'Finish') : (currentLanguage === 'TR' ? 'İleri' : 'Next')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
