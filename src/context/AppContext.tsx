import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Service,
  Order,
  User,
  PaymentMethod,
  PaymentRequest,
  Ticket,
  ApiProvider,
  initialServices,
  initialOrders,
  initialUsers,
  initialPaymentMethods,
  initialPaymentRequests,
  initialTickets,
  initialApiProviders
} from '../data/mockData';

interface AppContextProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentLanguage: 'TR' | 'EN';
  setCurrentLanguage: (lang: 'TR' | 'EN') => void;
  currentTheme: 'dark' | 'light';
  setCurrentTheme: (theme: 'dark' | 'light') => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  is2FAVerified: boolean;
  setIs2FAVerified: (val: boolean) => void;
  currentUserRole: 'Süper Admin' | 'Admin' | 'Moderatör';
  setCurrentUserRole: (role: 'Süper Admin' | 'Admin' | 'Moderatör') => void;
  importServicesFromApi: (providerId: string) => Promise<number>;
  
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  paymentMethods: PaymentMethod[];
  setPaymentMethods: React.Dispatch<React.SetStateAction<PaymentMethod[]>>;
  paymentRequests: PaymentRequest[];
  setPaymentRequests: React.Dispatch<React.SetStateAction<PaymentRequest[]>>;
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  apiProviders: ApiProvider[];
  setApiProviders: React.Dispatch<React.SetStateAction<ApiProvider[]>>;
  
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  
  notifications: { id: string; text: string; time: string; read: boolean; type: string }[];
  addNotification: (text: string, type?: string) => void;
  markNotificationsAsRead: () => void;
  
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  isOnboardingActive: boolean;
  setIsOnboardingActive: (val: boolean) => void;
  
  // Custom functions to edit lists
  addBalance: (userId: string, amount: number) => void;
  deductBalance: (userId: string, amount: number) => void;
  toggleUserStatus: (userId: string) => void;
  addUserNote: (userId: string, note: string) => void;
  
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addOrderLog: (orderId: string, logText: string) => void;
  
  toggleServiceStatus: (serviceId: string) => void;
  addService: (service: Omit<Service, 'id' | 'sortOrder'>) => void;
  updateService: (serviceId: string, service: Partial<Service>) => void;
  deleteService: (serviceId: string) => void;
  reorderServices: (fromIndex: number, toIndex: number) => void;
  
  replyTicket: (ticketId: string, message: string, sender: 'admin' | 'user') => void;
  toggleTicketStatus: (ticketId: string, status: Ticket['status']) => void;
  
  approvePaymentRequest: (requestId: string) => void;
  rejectPaymentRequest: (requestId: string) => void;
  togglePaymentMethod: (id: string) => void;
  updatePaymentMethodCommission: (id: string, commission: number) => void;
  
  updateApiProviderStatus: (id: string, status: boolean) => void;
  updateApiProvider: (id: string, name: string, url: string, key: string) => void;
  testApiProvider: (id: string) => Promise<boolean>;
  
  toastMsg: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;

  // Client Portal & Landing management
  portalMode: 'landing' | 'client' | 'admin';
  setPortalMode: (mode: 'landing' | 'client' | 'admin') => void;
  currentClientUser: User | null;
  setCurrentClientUser: (user: User | null) => void;
  clientLoggedIn: boolean;
  setClientLoggedIn: (val: boolean) => void;
  registerClient: (fullName: string, email: string) => boolean;
  placeClientOrder: (serviceId: string, quantity: number, link: string, username: string) => Promise<boolean>;
  submitClientPaymentRequest: (amount: number, methodId: string) => void;
  submitClientTicket: (subject: string, message: string, priority: 'Düşük' | 'Orta' | 'Yüksek') => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [currentLanguage, setCurrentLanguage] = useState<'TR' | 'EN'>('TR');
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>('dark');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [is2FAVerified, setIs2FAVerified] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<'Süper Admin' | 'Admin' | 'Moderatör'>('Süper Admin');
  
  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('smm_services');
    return saved ? JSON.parse(saved) : initialServices;
  });
  
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('smm_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });
  
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('smm_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => {
    const saved = localStorage.getItem('smm_payment_methods');
    return saved ? JSON.parse(saved) : initialPaymentMethods;
  });
  
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>(() => {
    const saved = localStorage.getItem('smm_payment_requests');
    return saved ? JSON.parse(saved) : initialPaymentRequests;
  });
  
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('smm_tickets');
    return saved ? JSON.parse(saved) : initialTickets;
  });
  
  const [apiProviders, setApiProviders] = useState<ApiProvider[]>(() => {
    const saved = localStorage.getItem('smm_api_providers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ApiProvider[];
        const validIds = ['API_TURKPANELI', 'API_RESELLERPROVIDER'];
        const filtered = parsed.filter(p => validIds.includes(p.id));
        // Merge with defaults to ensure both providers always exist
        const merged = initialApiProviders.map(def => {
          const found = filtered.find(f => f.id === def.id);
          return found ? { ...def, ...found } : def;
        });
        return merged;
      } catch (e) {
        // ignore fallback
      }
    }
    return initialApiProviders;
  });
  
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);

  // Client / Landing layout states
  const [portalMode, setPortalMode] = useState<'landing' | 'client' | 'admin'>('landing');
  const [clientLoggedIn, setClientLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('smm_client_logged_in') === 'true';
  });
  const [currentClientUser, setCurrentClientUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('smm_current_client_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('smm_client_logged_in', clientLoggedIn.toString());
  }, [clientLoggedIn]);

  useEffect(() => {
    if (currentClientUser) {
      localStorage.setItem('smm_current_client_user', JSON.stringify(currentClientUser));
    } else {
      localStorage.removeItem('smm_current_client_user');
    }
  }, [currentClientUser]);
  
  // Persistent Storage
  useEffect(() => {
    localStorage.setItem('smm_services', JSON.stringify(services));
  }, [services]);
  useEffect(() => {
    localStorage.setItem('smm_orders', JSON.stringify(orders));
  }, [orders]);
  useEffect(() => {
    localStorage.setItem('smm_users', JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem('smm_payment_methods', JSON.stringify(paymentMethods));
  }, [paymentMethods]);
  useEffect(() => {
    localStorage.setItem('smm_payment_requests', JSON.stringify(paymentRequests));
  }, [paymentRequests]);
  useEffect(() => {
    localStorage.setItem('smm_tickets', JSON.stringify(tickets));
  }, [tickets]);
  useEffect(() => {
    localStorage.setItem('smm_api_providers', JSON.stringify(apiProviders));
  }, [apiProviders]);
  
  // Toast and notifications states
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [notifications, setNotifications] = useState<{ id: string; text: string; time: string; read: boolean; type: string }[]>([
    { id: "1", text: "Yeni ödeme bildirimi alındı (Kerem Taş - 250 TL)", time: "18 dk önce", read: false, type: "payment" },
    { id: "2", text: "Yeni destek talebi açıldı (T-503 - Ezgi Şen)", time: "42 dk önce", read: false, type: "ticket" },
    { id: "3", text: "Sistem: Şüpheli giriş tespiti! Admin (Salih) IP: 192.168.1.10", time: "1 saat önce", read: true, type: "security" },
    { id: "4", text: "Stripe global servisinde API hatası oluştu", time: "2 saat önce", read: true, type: "error" }
  ]);
  
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };
  
  const addNotification = (text: string, type = "info") => {
    const newNotif = {
      id: Math.random().toString(),
      text,
      time: "Şimdi",
      read: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  };
  
  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast("Tüm bildirimler okundu olarak işaretlendi", "info");
  };
  
  // Custom Operations: Users
  const addBalance = (userId: string, amount: number) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextBal = u.balance + amount;
        addNotification(`${u.fullName} kullanıcısına ${amount} TL el ile bakiye eklendi.`, "payment");
        showToast(`${u.fullName} cüzdanına ${amount} TL başarıyla eklendi.`, "success");
        return { ...u, balance: nextBal };
      }
      return u;
    }));
  };
  
  const deductBalance = (userId: string, amount: number) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextBal = Math.max(0, u.balance - amount);
        addNotification(`${u.fullName} kullanıcısından ${amount} TL el ile bakiye düşüldü.`, "payment");
        showToast(`${u.fullName} cüzdanından ${amount} TL başarıyla düşüldü.`, "info");
        return { ...u, balance: nextBal };
      }
      return u;
    }));
  };
  
  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'active' ? 'suspended' : 'active';
        showToast(`${u.fullName} hesabının durumu güncellendi: ${nextStatus === 'active' ? 'Aktif' : 'Askıda'}`, "info");
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };
  
  const addUserNote = (userId: string, note: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        showToast("Kullanıcı notu başarıyla güncellendi.", "success");
        return { ...u, note };
      }
      return u;
    }));
  };
  
  // Custom Operations: Orders
  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const refinedLogs = [...o.logs, { time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), text: `Sipariş durumu sistem yöneticisi tarafından '${status}' yapıldı.` }];
        showToast(`${orderId} nolu sipariş durumu '${status}' olarak güncellendi.`, "success");
        return { ...o, status, logs: refinedLogs };
      }
      return o;
    }));
  };
  
  const addOrderLog = (orderId: string, logText: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, logs: [...o.logs, { time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), text: logText }] };
      }
      return o;
    }));
  };
  
  // Custom Operations: Services
  const toggleServiceStatus = (serviceId: string) => {
    setServices(prev => prev.map(s => {
      if (s.id === serviceId) {
        const nextStatus = s.status === 'active' ? 'passive' : 'active';
        showToast(`${s.name.substring(0, 20)}... servisi ${nextStatus === 'active' ? 'Aktifleştirildi' : 'Pasifleştirildi'}.`, "info");
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };
  
  const addService = (newS: Omit<Service, 'id' | 'sortOrder'>) => {
    const nextId = (Math.max(...services.map(s => parseInt(s.id))) + 1).toString();
    const serviceWithId: Service = {
      ...newS,
      id: nextId,
      sortOrder: services.length + 1
    };
    setServices(prev => [...prev, serviceWithId]);
    showToast("Yeni SMM servisi başarıyla portfelyoya eklendi.", "success");
    addNotification(`Yeni servis eklendi: ID ${nextId} - ${newS.name.substring(0, 30)}...`, "service");
  };
  
  const updateService = (serviceId: string, partialS: Partial<Service>) => {
    setServices(prev => prev.map(s => {
      if (s.id === serviceId) {
        showToast("Servis ayrıntıları güncellendi.", "success");
        return { ...s, ...partialS };
      }
      return s;
    }));
  };
  
  const deleteService = (serviceId: string) => {
    setServices(prev => prev.filter(s => s.id !== serviceId));
    showToast("Servis başarıyla silindi.", "error");
  };
  
  const reorderServices = (fromIndex: number, toIndex: number) => {
    const copy = [...services];
    const [moved] = copy.splice(fromIndex, 1);
    copy.splice(toIndex, 0, moved);
    const updated = copy.map((serv, index) => ({ ...serv, sortOrder: index + 1 }));
    setServices(updated);
    showToast("Servis sıralaması güncellendi.", "success");
  };
  
  // Custom Operations: Tickets
  const replyTicket = (ticketId: string, text: string, sender: 'admin' | 'user') => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const newMessage = {
          id: Math.random().toString(),
          sender,
          senderName: sender === 'admin' ? `Admin (${currentUserRole})` : t.userName,
          message: text,
          time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        };
        const nextStatus = sender === 'admin' ? 'Cevaplandı' as const : 'Açık' as const;
        showToast(sender === 'admin' ? "Destek talebine yanıt gönderildi." : "Destek talebi güncellendi.", "success");
        return {
          ...t,
          status: nextStatus,
          messages: [...t.messages, newMessage]
        };
      }
      return t;
    }));
  };
  
  const toggleTicketStatus = (ticketId: string, status: Ticket['status']) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        showToast(`Destek talebi ${ticketId} durumu '${status}' olarak güncellendi.`, "info");
        return { ...t, status };
      }
      return t;
    }));
  };
  
  // Custom Operations: Payments
  const approvePaymentRequest = (requestId: string) => {
    setPaymentRequests(prev => prev.map(req => {
      if (req.id === requestId && req.status === 'Beklemede') {
        const appReq = { ...req, status: 'Onaylandı' as const, transactionId: "TR_" + Math.floor(Math.random() * 899999 + 100000) };
        addBalance(req.userId, req.amount); // Automatically push balance to the user!
        return appReq;
      }
      return req;
    }));
  };
  
  const rejectPaymentRequest = (requestId: string) => {
    setPaymentRequests(prev => prev.map(req => {
      if (req.id === requestId && req.status === 'Beklemede') {
        showToast("Ödeme bildirimi reddedildi.", "error");
        return { ...req, status: 'Reddedildi' as const };
      }
      return req;
    }));
  };
  
  const togglePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.map(p => {
      if (p.id === id) {
        showToast(`${p.name} ödeme kanalı ${!p.status ? 'aktif edildi' : 'pasif edildi'}`, "info");
        return { ...p, status: !p.status };
      }
      return p;
    }));
  };
  
  const updatePaymentMethodCommission = (id: string, commission: number) => {
    setPaymentMethods(prev => prev.map(p => {
      if (p.id === id) {
        showToast(`${p.name} komisyon oranı %${commission} yapıldı.`, "success");
        return { ...p, commission };
      }
      return p;
    }));
  };
  
  // Custom Operations: Providers
  const updateApiProviderStatus = (id: string, status: boolean) => {
    setApiProviders(prev => prev.map(p => {
      if (p.id === id) {
        showToast(`${p.name} sağlayıcısı ${status ? 'aktif edildi' : 'devre dışı bırakıldı'}`, "info");
        return { ...p, status };
      }
      return p;
    }));
  };

  const updateApiProvider = (id: string, name: string, url: string, key: string) => {
    setApiProviders(prev => prev.map(p => {
      if (p.id === id) {
        showToast(currentLanguage === 'TR' ? `${name} API bilgileri başarıyla güncellendi.` : `${name} API details updated successfully.`, "success");
        return { ...p, name, url, key };
      }
      return p;
    }));
  };
  
  const buildProxyUrl = (targetUrl: string): string => {
    const isReplit = window.location.hostname.includes('.replit') || window.location.hostname.includes('.repl.co');
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1');
    if (isLocal || isReplit) {
      return `/api-proxy.php?url=${encodeURIComponent(targetUrl)}`;
    }
    return `/api-proxy.php?url=${encodeURIComponent(targetUrl)}`;
  };

  const callProviderApi = async (provider: ApiProvider, params: Record<string, string>): Promise<any> => {
    const proxyUrl = buildProxyUrl(provider.url);
    const body = new URLSearchParams(params).toString();
    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    return JSON.parse(text);
  };

  const testApiProvider = async (id: string): Promise<boolean> => {
    const provider = apiProviders.find(p => p.id === id);
    if (!provider) return false;

    if (!provider.key || provider.key.trim() === '') {
      showToast(
        currentLanguage === 'TR'
          ? `${provider.name} için önce API Key giriniz!`
          : `Please enter an API Key for ${provider.name} first!`,
        "error"
      );
      return false;
    }

    try {
      const payload = await callProviderApi(provider, { key: provider.key, action: 'balance' });

      if (payload && (payload.balance !== undefined || payload.balance_raw !== undefined)) {
        const balanceVal = parseFloat(payload.balance ?? payload.balance_raw ?? "0");
        setApiProviders(prev => prev.map(p => p.id === id ? { ...p, balance: balanceVal } : p));
        showToast(
          currentLanguage === 'TR'
            ? `⚡ ${provider.name} Bağlantısı Başarılı! Bakiye: ${provider.region === 'TR' ? '₺' : '$'}${balanceVal.toFixed(2)}`
            : `⚡ ${provider.name} Connected! Balance: ${provider.region === 'TR' ? '₺' : '$'}${balanceVal.toFixed(2)}`,
          "success"
        );
        return true;
      } else if (payload && payload.error) {
        showToast(`API Hatası: ${payload.error}`, "error");
        return false;
      }
    } catch (err: any) {
      showToast(
        currentLanguage === 'TR'
          ? `Bağlantı hatası: ${err.message}. API Key ve URL'yi kontrol edin.`
          : `Connection error: ${err.message}. Check your API Key and URL.`,
        "error"
      );
    }
    return false;
  };

  const detectPlatformFromName = (name: string, category: string): Service['platform'] => {
    const combined = `${name} ${category}`.toLowerCase();
    if (combined.includes('tiktok') || combined.includes('tik tok')) return 'TikTok';
    if (combined.includes('youtube') || combined.includes('yt ')) return 'YouTube';
    if (combined.includes('twitter') || combined.includes('tweet') || combined.includes(' x ')) return 'Twitter';
    if (combined.includes('spotify')) return 'Spotify';
    if (combined.includes('telegram')) return 'Telegram';
    return 'Instagram';
  };

  const importServicesFromApi = async (providerId: string): Promise<number> => {
    const provider = apiProviders.find(p => p.id === providerId);
    if (!provider) return 0;

    if (!provider.key || provider.key.trim() === '') {
      showToast(
        currentLanguage === 'TR'
          ? `${provider.name} için önce API Key giriniz!`
          : `Please enter an API Key for ${provider.name} first!`,
        "error"
      );
      return 0;
    }

    try {
      const payload = await callProviderApi(provider, { key: provider.key, action: 'services' });

      if (!Array.isArray(payload)) {
        const errMsg = payload?.error || (currentLanguage === 'TR' ? 'Geçersiz API yanıtı' : 'Invalid API response');
        showToast(`API Hatası: ${errMsg}`, "error");
        return 0;
      }

      let addedCount = 0;
      const newServices: Service[] = [];

      payload.forEach((item: any) => {
        const serviceId = String(item.service ?? item.id ?? '');
        const already = services.some(s => s.providerServiceId === Number(serviceId) && s.providerApiId === providerId);
        if (already) return;

        const name = String(item.name ?? '');
        const category = String(item.category ?? item.type ?? 'Genel');
        const rate = parseFloat(item.rate ?? '0');
        const min = parseInt(item.min ?? '100', 10);
        const max = parseInt(item.max ?? '10000', 10);
        const platform = detectPlatformFromName(name, category);

        const markup = provider.region === 'TR' ? 1.3 : 1.35;
        const pricePer1000 = parseFloat((rate * markup).toFixed(2));

        const newService: Service = {
          id: `${providerId}_${serviceId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name,
          platform,
          category,
          min: isNaN(min) ? 100 : min,
          max: isNaN(max) ? 10000 : max,
          pricePer1000: isNaN(pricePer1000) ? 10 : pricePer1000,
          status: 'active',
          sortOrder: services.length + newServices.length + 1,
          description: `${category}`,
          providerServiceId: Number(serviceId),
          providerApiId: providerId
        };
        newServices.push(newService);
        addedCount++;
      });

      if (addedCount > 0) {
        setServices(prev => [...prev, ...newServices]);
        addNotification(
          currentLanguage === 'TR'
            ? `${provider.name} kaynağından ${addedCount} yeni servis aktarıldı.`
            : `${addedCount} services imported from ${provider.name}.`,
          "service"
        );
        showToast(
          currentLanguage === 'TR'
            ? `✅ ${addedCount} servis başarıyla içe aktarıldı!`
            : `✅ ${addedCount} services imported successfully!`,
          "success"
        );
      } else {
        showToast(
          currentLanguage === 'TR'
            ? 'Tüm servisler zaten mevcut, yeni servis eklenmedi.'
            : 'All services already imported. Nothing new to add.',
          "info"
        );
      }
      return addedCount;
    } catch (err: any) {
      showToast(
        currentLanguage === 'TR'
          ? `Servis çekme hatası: ${err.message}`
          : `Import error: ${err.message}`,
        "error"
      );
      return 0;
    }
  };

  const registerClient = (fullName: string, email: string): boolean => {
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      showToast(currentLanguage === 'TR' ? 'Bu e-posta adresiyle zaten bir hesap var.' : 'This email is already in use.', 'error');
      return false;
    }
    const newId = (Math.max(...users.map(u => parseInt(u.id) || 100)) + 1).toString();
    const newUser: User = {
      id: newId,
      fullName,
      email,
      balance: 0,
      totalOrders: 0,
      joinedDate: new Date().toLocaleDateString('tr-TR'),
      status: 'active' as const
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentClientUser(newUser);
    setClientLoggedIn(true);
    showToast(currentLanguage === 'TR' ? 'Hesabınız oluşturuldu! Bakiye yükleyerek sipariş verebilirsiniz.' : 'Account created! Add funds to start placing orders.', 'success');
    addNotification(`Yeni bayilik kaydı yapıldı: ${fullName} (${email})`, 'user');
    return true;
  };

  const placeClientOrder = async (serviceId: string, quantity: number, link: string, username: string): Promise<boolean> => {
    if (!currentClientUser) {
      showToast(currentLanguage === 'TR' ? 'Lütfen giriş yapın.' : 'Please log in.', 'error');
      return false;
    }
    const service = services.find(s => s.id === serviceId);
    if (!service) {
      showToast(currentLanguage === 'TR' ? 'Geçersiz servis.' : 'Invalid service.', 'error');
      return false;
    }
    const cost = parseFloat(((service.pricePer1000 * quantity) / 1000).toFixed(2));
    if (currentClientUser.balance < cost) {
      showToast(
        currentLanguage === 'TR'
          ? `Yetersiz bakiye! Bu sipariş ${cost} TL tutuyor, mevcut bakiyeniz ${currentClientUser.balance} TL.`
          : `Insufficient funds! This costs ${cost} TL, your balance is ${currentClientUser.balance} TL.`,
        'error'
      );
      return false;
    }

    const nowTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const nowDate = new Date().toLocaleDateString('tr-TR') + ' ' + nowTime;
    const newOrderId = "ORD-" + Math.floor(Math.random() * 89999 + 10000);

    // Deduct balance immediately and create order in "Bekliyor" state
    let updatedUser = currentClientUser;
    setUsers(prev => prev.map(u => {
      if (u.id === currentClientUser.id) {
        const updated = { ...u, balance: parseFloat((u.balance - cost).toFixed(2)), totalOrders: u.totalOrders + 1 };
        updatedUser = updated;
        setCurrentClientUser(updated);
        return updated;
      }
      return u;
    }));

    const orderLogs: Order['logs'] = [
      { time: nowTime, text: 'Sipariş alındı, bakiye tahsil edildi.' }
    ];

    // If service has a provider, send the order to the real API
    let providerOrderId: string | undefined;
    let providerApiId: string | undefined;
    let finalStatus: Order['status'] = 'Bekliyor';

    if (service.providerServiceId && service.providerApiId) {
      const provider = apiProviders.find(p => p.id === service.providerApiId && p.isActive && p.key && p.key.trim() !== '');
      if (provider) {
        orderLogs.push({ time: nowTime, text: 'Sipariş işleme alınıyor...' });
        try {
          const apiResult = await callProviderApi(provider, {
            key: provider.key,
            action: 'add',
            service: String(service.providerServiceId),
            link,
            quantity: String(quantity),
          });

          if (apiResult && apiResult.order) {
            // Success: provider accepted the order
            providerOrderId = String(apiResult.order);
            providerApiId = provider.id;
            finalStatus = 'İşlemde';
            orderLogs.push({ time: nowTime, text: `✅ Sipariş başarıyla işleme alındı. Referans No: ${providerOrderId}` });
          } else if (apiResult && apiResult.error) {
            // Provider returned an error — refund and cancel
            orderLogs.push({ time: nowTime, text: `❌ Sipariş işlenemedi. Bakiyeniz iade edildi.` });
            finalStatus = 'İptal';
            // Refund the user
            setUsers(prev => prev.map(u => {
              if (u.id === currentClientUser.id) {
                const refunded = { ...u, balance: parseFloat((u.balance + cost).toFixed(2)), totalOrders: u.totalOrders - 1 };
                setCurrentClientUser(refunded);
                return refunded;
              }
              return u;
            }));
            showToast(
              currentLanguage === 'TR'
                ? 'Sipariş işlenemedi. Bakiyeniz iade edildi.'
                : 'Order could not be processed. Your balance has been refunded.',
              'error'
            );
            const cancelledOrder: Order = {
              id: newOrderId,
              username: username || currentClientUser.fullName,
              userId: currentClientUser.id,
              serviceId: service.id,
              serviceName: service.name,
              platform: service.platform,
              quantity,
              charge: cost,
              status: 'İptal',
              date: nowDate,
              link,
              logs: orderLogs,
            };
            setOrders(prev => [cancelledOrder, ...prev]);
            addNotification(`Sipariş başarısız: ${service.name.substring(0, 20)}`, 'error');
            return false;
          } else {
            // Unexpected response — keep as Bekliyor, admin will handle
            orderLogs.push({ time: nowTime, text: '⚠️ Sipariş kuyruğa alındı, işleme devam ediyor.' });
            finalStatus = 'Bekliyor';
          }
        } catch (err: any) {
          // Network/proxy error — keep as Bekliyor, admin will handle
          orderLogs.push({ time: nowTime, text: '⚠️ Sipariş kuyruğa alındı, kısa süre içinde işlenecek.' });
          finalStatus = 'Bekliyor';
        }
      } else {
        orderLogs.push({ time: nowTime, text: 'Sipariş kuyruğa alındı.' });
        finalStatus = 'Bekliyor';
      }
    } else {
      // No provider linked — manual order
      orderLogs.push({ time: nowTime, text: 'Sipariş kuyruğa alındı.' });
      finalStatus = 'Bekliyor';
    }

    const newOrder: Order = {
      id: newOrderId,
      username: username || currentClientUser.fullName,
      userId: currentClientUser.id,
      serviceId: service.id,
      serviceName: service.name,
      platform: service.platform,
      quantity,
      charge: cost,
      status: finalStatus,
      date: nowDate,
      link,
      logs: orderLogs,
      providerOrderId,
      providerApiId,
    };

    setOrders(prev => [newOrder, ...prev]);
    addNotification(`Yeni Sipariş: ${currentClientUser.fullName} - ${service.name.substring(0, 20)}...`, 'info');

    if (finalStatus === 'İşlemde') {
      showToast(
        currentLanguage === 'TR'
          ? `✅ Sipariş başarıyla işleme alındı! Sipariş ID: ${newOrderId}`
          : `✅ Order successfully placed! Order ID: ${newOrderId}`,
        'success'
      );
    } else {
      showToast(
        currentLanguage === 'TR'
          ? `Sipariş alındı! Sipariş ID: ${newOrderId}`
          : `Order received! Order ID: ${newOrderId}`,
        'info'
      );
    }
    return true;
  };

  const submitClientPaymentRequest = (amount: number, methodId: string) => {
    if (!currentClientUser) return;
    const method = paymentMethods.find(m => m.id === methodId);
    if (!method) return;
    const newRequest: PaymentRequest = {
      id: "PMT-" + Math.floor(Math.random() * 89999 + 10000),
      userId: currentClientUser.id,
      userName: currentClientUser.fullName,
      amount,
      method: method.name,
      status: 'Beklemede' as const,
      date: new Date().toLocaleDateString('tr-TR') + ' ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };
    setPaymentRequests(prev => [newRequest, ...prev]);
    showToast(currentLanguage === 'TR' ? 'Ödeme bildiriminiz yöneticilere iletildi. Onaylanınca bakiye yüklenecektir.' : 'Deposit request sent for approval.', 'success');
    addNotification(`Müşteri Ödeme Bildirimi: ${currentClientUser.fullName} (${amount} TL)`, 'payment');
  };

  const submitClientTicket = (subject: string, message: string, priority: 'Düşük' | 'Orta' | 'Yüksek') => {
    if (!currentClientUser) return;
    const newTicketId = "T-" + Math.floor(Math.random() * 899 + 100);
    const newTicket: Ticket = {
      id: newTicketId,
      userId: currentClientUser.id,
      userName: currentClientUser.fullName,
      subject,
      priority,
      status: 'Açık' as const,
      date: new Date().toLocaleDateString('tr-TR'),
      messages: [
        {
          id: Math.random().toString(),
          sender: 'user',
          senderName: currentClientUser.fullName,
          message,
          time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };
    setTickets(prev => [newTicket, ...prev]);
    showToast(currentLanguage === 'TR' ? `Destek talebiniz oluşturuldu! Bildirim ID: ${newTicketId}` : `Support ticket opened! ID: ${newTicketId}`, 'success');
    addNotification(`Müşteri yeni destek talebi açtı: ${newTicketId} - ${subject}`, 'ticket');
  };

  
  return (
    <AppContext.Provider value={{
      currentTab, setCurrentTab,
      currentLanguage, setCurrentLanguage,
      currentTheme, setCurrentTheme,
      isLoggedIn, setIsLoggedIn,
      is2FAVerified, setIs2FAVerified,
      currentUserRole, setCurrentUserRole,
      services, setServices,
      orders, setOrders,
      users, setUsers,
      paymentMethods, setPaymentMethods,
      paymentRequests, setPaymentRequests,
      tickets, setTickets,
      apiProviders, setApiProviders,
      searchOpen, setSearchOpen,
      mobileMenuOpen, setMobileMenuOpen,
      notifications, addNotification, markNotificationsAsRead,
      onboardingStep, setOnboardingStep,
      isOnboardingActive, setIsOnboardingActive,
      addBalance, deductBalance, toggleUserStatus, addUserNote,
      updateOrderStatus, addOrderLog,
      toggleServiceStatus, addService, updateService, deleteService, reorderServices,
      replyTicket, toggleTicketStatus,
      approvePaymentRequest, rejectPaymentRequest, togglePaymentMethod, updatePaymentMethodCommission,
      updateApiProviderStatus, updateApiProvider, testApiProvider, importServicesFromApi,
      toastMsg, showToast,

      // Expose newly created client variables and methods
      portalMode, setPortalMode,
      currentClientUser, setCurrentClientUser,
      clientLoggedIn, setClientLoggedIn,
      registerClient,
      placeClientOrder,
      submitClientPaymentRequest,
      submitClientTicket
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
};
