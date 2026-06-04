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
  testApiProvider: (id: string) => Promise<boolean>;
  
  toastMsg: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
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
    return saved ? JSON.parse(saved) : initialApiProviders;
  });
  
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  
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
  
  const testApiProvider = (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const works = Math.random() > 0.15; // 85% success simulation
        if (works) {
          showToast(`${id} API testi başarılı! API Bağlantısı kuruldu.`, "success");
          resolve(true);
        } else {
          showToast(`${id} API testi başarısız oldu! Rate limit veya API KEY geçersiz.`, "error");
          resolve(false);
        }
      }, 1200);
    });
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
      updateApiProviderStatus, testApiProvider,
      toastMsg, showToast
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
