import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  initialApiProviders,
  UserNotification
} from '../data/mockData';

export interface SmtpConfig {
  host: string;
  port: string;
  user: string;
  pass: string;
  adminEmail: string;
  fromName: string;
}

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
  updatePaymentMethodDetails: (id: string, updates: { name?: string; commission?: number; minAmount?: number; instructions?: string }) => void;
  
  updateApiProviderStatus: (id: string, status: boolean) => void;
  updateApiProvider: (id: string, name: string, url: string, key: string) => void;
  testApiProvider: (id: string) => Promise<boolean>;
  syncProviderOrders: () => Promise<void>;
  
  toastMsg: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;

  // Client Portal & Landing management
  portalMode: 'landing' | 'client' | 'admin';
  setPortalMode: (mode: 'landing' | 'client' | 'admin') => void;
  currentClientUser: User | null;
  setCurrentClientUser: (user: User | null) => void;
  clientLoggedIn: boolean;
  setClientLoggedIn: (val: boolean) => void;
  registerClient: (fullName: string, email: string, password?: string) => boolean;
  placeClientOrder: (serviceId: string, quantity: number, link: string, username: string) => Promise<string | null>;
  submitClientPaymentRequest: (amount: number, methodId: string) => void;
  submitClientTicket: (subject: string, message: string, priority: 'Düşük' | 'Orta' | 'Yüksek') => void;
  sendUserNotification: (userId: string, text: string) => void;
  sendBroadcastNotification: (text: string) => void;
  markUserNotificationsRead: (userId: string) => void;
  announcementText: string;
  setAnnouncementText: (text: string) => void;
  smtpConfig: SmtpConfig;
  setSmtpConfig: (cfg: SmtpConfig) => void;
  isServerSynced: boolean;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [currentLanguage, setCurrentLanguage] = useState<'TR' | 'EN'>('TR');
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>('dark');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [is2FAVerified, setIs2FAVerified] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<'Süper Admin' | 'Admin' | 'Moderatör'>('Süper Admin');
  
  const [services, setServices] = useState<Service[]>(initialServices);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(initialPaymentMethods);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>(initialPaymentRequests);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [apiProviders, setApiProviders] = useState<ApiProvider[]>(initialApiProviders);
  
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);

  // Client / Landing layout states
  const [portalMode, setPortalMode] = useState<'landing' | 'client' | 'admin'>('landing');
  const [clientLoggedIn, setClientLoggedIn] = useState<boolean>(false);
  const [currentClientUser, setCurrentClientUser] = useState<User | null>(null);
  const [announcementText, setAnnouncementText] = useState('');
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>({
    host: '', port: '587', user: '', pass: '', adminEmail: '', fromName: 'Bor Media'
  });
  
  const syncDoneRef = useRef(false);
  const [isServerSynced, setIsServerSynced] = useState(false);

  const clientLoggedInRef = useRef(clientLoggedIn);
  useEffect(() => { clientLoggedInRef.current = clientLoggedIn; }, [clientLoggedIn]);
  const currentClientUserRef = useRef(currentClientUser);
  useEffect(() => { currentClientUserRef.current = currentClientUser; }, [currentClientUser]);

  const saveToApi = (key: string, value: unknown) => {
    if (!syncDoneRef.current) return;
    fetch(`/api/kv/${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: JSON.stringify(value) })
    }).catch(() => {});
  };

  // Persistent Storage — KV store only (no localStorage)
  useEffect(() => { saveToApi('smm_services', services); }, [services]);
  useEffect(() => { saveToApi('smm_orders', orders); }, [orders]);
  useEffect(() => { saveToApi('smm_users', users); }, [users]);
  useEffect(() => { saveToApi('smm_payment_methods', paymentMethods); }, [paymentMethods]);
  useEffect(() => { saveToApi('smm_payment_requests', paymentRequests); }, [paymentRequests]);
  useEffect(() => { saveToApi('smm_tickets', tickets); }, [tickets]);
  useEffect(() => { saveToApi('smm_api_providers', apiProviders); }, [apiProviders]);
  useEffect(() => { saveToApi('smm_announcement', announcementText); }, [announcementText]);
  useEffect(() => { saveToApi('smm_smtp_config', smtpConfig); }, [smtpConfig]);

  // Admin session persistence — survive F5 / hard refresh (8h TTY)
  useEffect(() => {
    if (isLoggedIn) {
      const session = JSON.parse(sessionStorage.getItem('bm_admin_session') || '{}');
      sessionStorage.setItem('bm_admin_session', JSON.stringify({
        ...session,
        isLoggedIn: true,
        expiry: Date.now() + 8 * 3600_000
      }));
    } else {
      sessionStorage.removeItem('bm_admin_session');
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (is2FAVerified && isLoggedIn) {
      sessionStorage.setItem('bm_admin_session', JSON.stringify({
        isLoggedIn: true,
        is2FAVerified: true,
        expiry: Date.now() + 8 * 3600_000
      }));
    }
  }, [is2FAVerified]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load from server on mount — DB is the single source of truth
  useEffect(() => {
    const syncFromServer = async () => {
      const entries: [string, React.Dispatch<React.SetStateAction<any>>][] = [
        ['smm_services', setServices],
        ['smm_orders', setOrders],
        ['smm_users', setUsers],
        ['smm_payment_methods', setPaymentMethods],
        ['smm_payment_requests', setPaymentRequests],
        ['smm_tickets', setTickets],
        ['smm_api_providers', setApiProviders],
      ];
      let loadedUsers: User[] | null = null;
      for (const [key, setter] of entries) {
        try {
          const res = await fetch(`/api/kv/${key}`);
          if (res.ok) {
            const data = await res.json();
            if (data.value) {
              const parsed = JSON.parse(data.value);
              setter(parsed);
              if (key === 'smm_users') loadedUsers = parsed;
            }
          }
        } catch { /* server unavailable, use initial defaults */ }
      }

      // Load announcement text
      try {
        const annRes = await fetch('/api/kv/smm_announcement');
        if (annRes.ok) {
          const annData = await annRes.json();
          if (annData.value) setAnnouncementText(JSON.parse(annData.value));
        }
      } catch {}

      // Load SMTP config
      try {
        const smtpRes = await fetch('/api/kv/smm_smtp_config');
        if (smtpRes.ok) {
          const smtpData = await smtpRes.json();
          if (smtpData.value) setSmtpConfig(JSON.parse(smtpData.value));
        }
      } catch {}

      // Load admin notifications from KV
      try {
        const notifRes = await fetch('/api/kv/smm_notifications');
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          if (notifData.value) setNotifications(JSON.parse(notifData.value));
        }
      } catch {}

      // Restore client session: try from KV users, fallback to sessionStorage cache
      const storedUserId = sessionStorage.getItem('smm_client_user_id');
      if (storedUserId) {
        const usersToSearch: User[] = loadedUsers ?? initialUsers;
        let user = usersToSearch.find(u => u.id === storedUserId);
        if (!user) {
          // Fallback to locally cached user object if KV load failed
          try {
            const cached = sessionStorage.getItem('smm_client_user_cache');
            if (cached) user = JSON.parse(cached) as User;
          } catch {}
        }
        if (user && user.status !== 'suspended') {
          setCurrentClientUser(user);
          setClientLoggedIn(true);
          setPortalMode('client');
          // Refresh cache with latest server data
          if (loadedUsers) sessionStorage.setItem('smm_client_user_cache', JSON.stringify(user));
        } else {
          sessionStorage.removeItem('smm_client_user_id');
          sessionStorage.removeItem('smm_client_user_cache');
        }
      }

      // Restore admin session (overrides client if admin was logged in)
      try {
        const raw = sessionStorage.getItem('bm_admin_session');
        if (raw) {
          const session = JSON.parse(raw);
          if (session.expiry > Date.now()) {
            if (session.isLoggedIn) {
              setIsLoggedIn(true);
              setPortalMode('admin');
            }
            if (session.is2FAVerified) {
              setIs2FAVerified(true);
            }
          } else {
            sessionStorage.removeItem('bm_admin_session');
          }
        }
      } catch { sessionStorage.removeItem('bm_admin_session'); }

      syncDoneRef.current = true;
      setIsServerSynced(true);
    };
    syncFromServer();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 5-minute inactivity auto-logout
  useEffect(() => {
    const INACTIVITY_MS = 5 * 60 * 1000;
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (clientLoggedInRef.current) {
          sessionStorage.removeItem('smm_client_user_id');
          sessionStorage.removeItem('smm_client_user_cache');
          setClientLoggedIn(false);
          setCurrentClientUser(null);
          setPortalMode('landing');
        }
        if (isLoggedIn) {
          sessionStorage.removeItem('bm_admin_session');
          setIsLoggedIn(false);
          setIs2FAVerified(false);
          setPortalMode('landing');
        }
      }, INACTIVITY_MS);
    };
    const events = ['click', 'keydown', 'mousemove', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach(e => window.removeEventListener(e, reset));
    };
  }, [isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  // Helper: fully log out client and clear session
  const logoutClient = (showBanMessage = false) => {
    sessionStorage.removeItem('smm_client_user_id');
    sessionStorage.removeItem('smm_client_user_cache');
    setClientLoggedIn(false);
    setCurrentClientUser(null);
    setPortalMode('landing');
    if (showBanMessage) {
      showToast('Hesabınız askıya alındı. Lütfen destek ekibiyle iletişime geçin.', 'error');
    }
  };

  // After server sync: refresh currentClientUser with latest DB data & enforce ban
  useEffect(() => {
    if (!isServerSynced || !clientLoggedIn || !currentClientUser) return;
    const freshUser = users.find(u => u.id === currentClientUser.id);
    if (!freshUser) { logoutClient(); return; }
    if (freshUser.status === 'suspended') { logoutClient(true); return; }
    if (JSON.stringify(freshUser) !== JSON.stringify(currentClientUser)) {
      setCurrentClientUser(freshUser);
    }
  }, [isServerSynced, users]); // eslint-disable-line react-hooks/exhaustive-deps

  // Poll every 60s: enforce live ban for active client sessions
  useEffect(() => {
    if (!isServerSynced) return;
    const interval = setInterval(async () => {
      if (!clientLoggedInRef.current || !currentClientUserRef.current) return;
      try {
        const res = await fetch('/api/kv/smm_users');
        if (!res.ok) return;
        const data = await res.json();
        if (!data.value) return;
        const freshUsers: User[] = JSON.parse(data.value);
        const freshUser = freshUsers.find(u => u.id === currentClientUserRef.current!.id);
        if (!freshUser || freshUser.status === 'suspended') {
          logoutClient(true);
          return;
        }
        if (JSON.stringify(freshUser) !== JSON.stringify(currentClientUserRef.current)) {
          setCurrentClientUser(freshUser);
        }
      } catch { /* network error, skip */ }
    }, 60_000);
    return () => clearInterval(interval);
  }, [isServerSynced]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Toast and notifications states
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [notifications, setNotifications] = useState<{ id: string; text: string; time: string; read: boolean; type: string }[]>([]);
  useEffect(() => { saveToApi('smm_notifications', notifications); }, [notifications]);
  
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
    // Find ticket before state update so we can use it for side effects
    const ticket = tickets.find(t => t.id === ticketId);

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

    // Admin reply side-effects: in-app user notification + email
    if (sender === 'admin' && ticket) {
      const notifText = `Destek talebiniz "${ticket.subject}" cevaplandı. Yanıt: ${text.substring(0, 80)}${text.length > 80 ? '...' : ''}`;
      const notifDate = new Date().toISOString();

      // In-app notification saved to user object
      setUsers(prev => prev.map(u => {
        if (u.id === ticket.userId) {
          const newNotif: UserNotification = {
            id: Math.random().toString(36).substr(2, 9),
            text: notifText,
            date: notifDate,
            read: false,
          };
          return { ...u, notifications: [newNotif, ...(u.notifications ?? [])] };
        }
        return u;
      }));

      // Also update currentClientUser if they are currently logged in
      if (currentClientUser?.id === ticket.userId) {
        const newNotif: UserNotification = {
          id: Math.random().toString(36).substr(2, 9),
          text: notifText,
          date: notifDate,
          read: false,
        };
        setCurrentClientUser(prev => prev
          ? { ...prev, notifications: [newNotif, ...(prev.notifications ?? [])] }
          : prev
        );
      }

      // Email notification to client (fire-and-forget, only if SMTP configured)
      const user = users.find(u => u.id === ticket.userId);
      if (user?.email && smtpConfig.host && smtpConfig.user && smtpConfig.pass) {
        const emailHtml = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0F0F1A;color:#eeeeff;padding:30px;border-radius:12px;">
            <div style="text-align:center;margin-bottom:24px;">
              <h1 style="color:#00D4FF;font-size:22px;margin:0;">Bor Media</h1>
              <p style="color:#666;font-size:12px;margin:4px 0 0;">SMM Panel</p>
            </div>
            <h2 style="color:#eeeeff;font-size:18px;border-bottom:1px solid #2A2A4A;padding-bottom:12px;">
              ✅ Destek Talebiniz Cevaplandı
            </h2>
            <p style="color:#aaa;">Merhaba <strong style="color:#eeeeff;">${user.fullName}</strong>,</p>
            <p style="color:#aaa;">
              <strong>#${ticket.id}</strong> numaralı "<strong style="color:#eeeeff;">${ticket.subject}</strong>"
              konulu destek talebiniz ekibimiz tarafından yanıtlandı.
            </p>
            <div style="background:#1A1A2E;border-left:4px solid #7B2FFF;padding:16px 20px;border-radius:8px;margin:20px 0;">
              <p style="color:#aaa;font-size:12px;margin:0 0 8px;">Ekip yanıtı:</p>
              <p style="color:#eeeeff;margin:0;white-space:pre-wrap;">${text.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>
            </div>
            <p style="color:#aaa;font-size:13px;">
              Yanıtlamak veya talebi görüntülemek için panele giriş yapabilirsiniz.
            </p>
            <hr style="border:none;border-top:1px solid #2A2A4A;margin:24px 0;">
            <p style="color:#555;font-size:11px;text-align:center;">
              Bu e-posta Bor Media SMM Panel tarafından otomatik olarak gönderilmiştir.
            </p>
          </div>
        `;
        fetch('/api/mail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: user.email,
            subject: `Destek Talebiniz Cevaplandı: ${ticket.subject} [#${ticket.id}]`,
            body: emailHtml,
            smtp_host: smtpConfig.host,
            smtp_port: smtpConfig.port,
            smtp_user: smtpConfig.user,
            smtp_pass: smtpConfig.pass,
            from_name: smtpConfig.fromName || 'Bor Media',
          }),
        }).catch(() => {});
      }
    }
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

  const updatePaymentMethodDetails = (id: string, updates: { name?: string; commission?: number; minAmount?: number; instructions?: string }) => {
    setPaymentMethods(prev => prev.map(p => {
      if (p.id === id) {
        showToast(`${p.name} ödeme yöntemi güncellendi.`, "success");
        return { ...p, ...updates };
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

  const ordersRef = useRef(orders);
  useEffect(() => { ordersRef.current = orders; }, [orders]);
  const apiProvidersRef = useRef(apiProviders);
  useEffect(() => { apiProvidersRef.current = apiProviders; }, [apiProviders]);
  const currentLanguageRef = useRef(currentLanguage);
  useEffect(() => { currentLanguageRef.current = currentLanguage; }, [currentLanguage]);

  const syncProviderOrders = async (silent = false): Promise<void> => {
    const currentOrders = ordersRef.current;
    const currentProviders = apiProvidersRef.current;
    const lang = currentLanguageRef.current;

    const activeOrders = currentOrders.filter(o => o.status === 'İşlemde' && o.providerOrderId && o.providerApiId);
    if (activeOrders.length === 0) {
      if (!silent) {
        showToast(
          lang === 'TR' ? 'Senkronize edilecek aktif sipariş yok.' : 'No active orders to sync.',
          'info'
        );
      }
      return;
    }

    let updatedCount = 0;
    let completedCount = 0;

    for (const order of activeOrders) {
      const provider = currentProviders.find(p => p.id === order.providerApiId && p.status && p.key && p.key.trim() !== '');
      if (!provider) continue;

      try {
        const result = await callProviderApi(provider, {
          key: provider.key,
          action: 'status',
          order: order.providerOrderId!,
        });

        if (!result || !result.status) continue;

        const rawStatus: string = (result.status ?? '').toString().toLowerCase();
        let newStatus: Order['status'] | null = null;

        if (rawStatus === 'completed' || rawStatus === 'partial') {
          newStatus = 'Tamamlandı';
          completedCount++;
        } else if (rawStatus === 'cancelled' || rawStatus === 'canceled') {
          newStatus = 'İptal';
        } else if (rawStatus === 'in progress' || rawStatus === 'processing') {
          newStatus = 'İşlemde';
        } else if (rawStatus === 'pending') {
          newStatus = 'Bekliyor';
        }

        if (newStatus && newStatus !== order.status) {
          const logText = newStatus === 'Tamamlandı'
            ? `✅ Sipariş tamamlandı. (${result.status})`
            : newStatus === 'İptal'
            ? `❌ Sipariş iptal edildi. (${result.status})`
            : `🔄 Sipariş durumu güncellendi: ${result.status}`;

          setOrders(prev => prev.map(o => {
            if (o.id === order.id) {
              return {
                ...o,
                status: newStatus!,
                logs: [...o.logs, {
                  time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                  text: logText,
                }],
              };
            }
            return o;
          }));
          updatedCount++;
        }
      } catch {
        // Network error for this specific order — skip it
      }
    }

    if (updatedCount > 0) {
      showToast(
        lang === 'TR'
          ? `✅ ${updatedCount} sipariş senkronize edildi. ${completedCount > 0 ? `${completedCount} sipariş tamamlandı!` : ''}`
          : `✅ ${updatedCount} orders synced. ${completedCount > 0 ? `${completedCount} completed!` : ''}`,
        'success'
      );
      if (completedCount > 0) {
        addNotification(
          lang === 'TR'
            ? `${completedCount} sipariş başarıyla tamamlandı.`
            : `${completedCount} orders completed.`,
          'info'
        );
      }
    } else if (!silent) {
      showToast(
        lang === 'TR' ? 'Tüm siparişler güncel durumda.' : 'All orders are up to date.',
        'info'
      );
    }
  };

  // Auto-poll: every 90 seconds, silently check status of "İşlemde" orders
  useEffect(() => {
    const interval = setInterval(() => {
      const hasActive = ordersRef.current.some(
        o => o.status === 'İşlemde' && o.providerOrderId && o.providerApiId
      );
      if (hasActive) {
        syncProviderOrders(true);
      }
    }, 90_000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const detectPlatformFromName = (name: string, category: string): Service['platform'] => {
    const combined = `${name} ${category}`.toLowerCase();
    if (combined.includes('tiktok') || combined.includes('tik tok')) return 'TikTok';
    if (combined.includes('youtube') || combined.includes('yt ')) return 'YouTube';
    if (combined.includes('twitter') || combined.includes('tweet') || combined.includes(' x ')) return 'Twitter';
    if (combined.includes('spotify')) return 'Spotify';
    if (combined.includes('telegram')) return 'Telegram';
    if (combined.includes('kick')) return 'Kick';
    if (combined.includes('twitch')) return 'Twitch';
    if (combined.includes('linkedin')) return 'LinkedIn';
    if (combined.includes('reddit')) return 'Reddit';
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

      // Speed keywords for "fastest" detection
      const speedKeywords = ['hızlı', 'hizli', 'fast', 'instant', 'süper', 'super', 'express', 'anlık', 'anlik', 'speed', 'hız', 'hiz'];
      const isSpeedService = (name: string) => {
        const lower = name.toLowerCase();
        return speedKeywords.some(kw => lower.includes(kw));
      };

      // Group all valid items by category
      type RawItem = { service?: any; id?: any; name?: any; category?: any; type?: any; rate?: any; min?: any; max?: any };
      const byCategory = new Map<string, RawItem[]>();
      (payload as RawItem[]).forEach(item => {
        const category = String(item.category ?? item.type ?? 'Genel');
        if (!byCategory.has(category)) byCategory.set(category, []);
        byCategory.get(category)!.push(item);
      });

      // For each category: pick the cheapest + the fastest (if different)
      const selectedItems: RawItem[] = [];
      byCategory.forEach(items => {
        if (items.length === 0) return;
        // Cheapest = lowest rate
        const cheapest = items.reduce((best, cur) =>
          parseFloat(cur.rate ?? '999999') < parseFloat(best.rate ?? '999999') ? cur : best
        );
        selectedItems.push(cheapest);
        // Fastest = speed keyword in name, lowest rate among those
        const speedItems = items.filter(i => isSpeedService(String(i.name ?? '')));
        if (speedItems.length > 0) {
          const fastest = speedItems.reduce((best, cur) =>
            parseFloat(cur.rate ?? '999999') < parseFloat(best.rate ?? '999999') ? cur : best
          );
          const cheapestId = String(cheapest.service ?? cheapest.id ?? '');
          const fastestId = String(fastest.service ?? fastest.id ?? '');
          if (fastestId !== cheapestId) selectedItems.push(fastest);
        }
      });

      let addedCount = 0;
      const newServices: Service[] = [];
      const platformFixes: { id: string; platform: Service['platform'] }[] = [];

      selectedItems.forEach(item => {
        const serviceId = String(item.service ?? item.id ?? '');
        const name = String(item.name ?? '');
        const category = String(item.category ?? item.type ?? 'Genel');
        const platform = detectPlatformFromName(name, category);

        // Check if already imported but with wrong platform — fix it silently
        const existingService = services.find(s => s.providerServiceId === Number(serviceId) && s.providerApiId === providerId);
        if (existingService) {
          if (existingService.platform !== platform) {
            platformFixes.push({ id: existingService.id, platform });
          }
          return;
        }

        const rate = parseFloat(item.rate ?? '0');
        const min = parseInt(item.min ?? '100', 10);
        const max = parseInt(item.max ?? '10000', 10);

        const markup = 1.3;
        const pricePer1000 = parseFloat((rate * markup).toFixed(2));

        // Delivery speed: average_time (minutes) → human readable
        let deliverySpeed: string | undefined;
        const avgTime = item.average_time !== undefined ? parseFloat(String(item.average_time)) : NaN;
        if (!isNaN(avgTime) && avgTime > 0) {
          if (avgTime < 60) {
            deliverySpeed = `~${Math.round(avgTime)} dk`;
          } else if (avgTime < 1440) {
            deliverySpeed = `~${Math.round(avgTime / 60)} saat`;
          } else {
            deliverySpeed = `~${Math.round(avgTime / 1440)} gün`;
          }
        }

        // Interval: drip-feed delivery interval in minutes
        let deliveryInterval: string | undefined;
        const intervalMin = item.interval !== undefined ? parseFloat(String(item.interval)) : NaN;
        if (!isNaN(intervalMin) && intervalMin > 0) {
          if (intervalMin < 60) {
            deliveryInterval = `${Math.round(intervalMin)} dk/adet`;
          } else if (intervalMin < 1440) {
            deliveryInterval = `${Math.round(intervalMin / 60)} saat/adet`;
          } else {
            deliveryInterval = `${Math.round(intervalMin / 1440)} gün/adet`;
          }
        }

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
          providerApiId: providerId,
          deliverySpeed,
          deliveryInterval
        };
        newServices.push(newService);
        addedCount++;
      });

      // Apply platform fixes for already-imported services with wrong platform
      if (platformFixes.length > 0) {
        setServices(prev => prev.map(s => {
          const fix = platformFixes.find(f => f.id === s.id);
          return fix ? { ...s, platform: fix.platform } : s;
        }));
      }

      if (addedCount > 0 || platformFixes.length > 0) {
        if (addedCount > 0) {
          setServices(prev => [...prev, ...newServices]);
        }
        const fixMsg = platformFixes.length > 0
          ? (currentLanguage === 'TR'
              ? ` (${platformFixes.length} servisin platformu düzeltildi)`
              : ` (${platformFixes.length} service platforms corrected)`)
          : '';
        addNotification(
          currentLanguage === 'TR'
            ? `${provider.name} kaynağından ${addedCount} yeni servis aktarıldı.${fixMsg}`
            : `${addedCount} services imported from ${provider.name}.${fixMsg}`,
          "service"
        );
        showToast(
          currentLanguage === 'TR'
            ? `✅ ${addedCount} servis içe aktarıldı!${fixMsg}`
            : `✅ ${addedCount} services imported!${fixMsg}`,
          "success"
        );
      } else {
        showToast(
          currentLanguage === 'TR'
            ? 'Tüm seçili servisler zaten mevcut, yeni servis eklenmedi.'
            : 'All selected services already imported. Nothing new to add.',
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

  const registerClient = (fullName: string, email: string, password?: string): boolean => {
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
      password: password || undefined,
      balance: 0,
      totalOrders: 0,
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'active' as const
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentClientUser(newUser);
    setClientLoggedIn(true);
    sessionStorage.setItem('smm_client_user_id', newId);
    showToast(currentLanguage === 'TR' ? 'Hesabınız oluşturuldu! Bakiye yükleyerek sipariş verebilirsiniz.' : 'Account created! Add funds to start placing orders.', 'success');
    addNotification(`Yeni bayilik kaydı yapıldı: ${fullName} (${email})`, 'user');
    return true;
  };

  const placeClientOrder = async (serviceId: string, quantity: number, link: string, username: string): Promise<string | null> => {
    if (!currentClientUser) {
      showToast(currentLanguage === 'TR' ? 'Lütfen giriş yapın.' : 'Please log in.', 'error');
      return null;
    }
    const service = services.find(s => s.id === serviceId);
    if (!service) {
      showToast(currentLanguage === 'TR' ? 'Geçersiz servis.' : 'Invalid service.', 'error');
      return null;
    }
    const cost = parseFloat(((service.pricePer1000 * quantity) / 1000).toFixed(2));
    if (currentClientUser.balance < cost) {
      showToast(
        currentLanguage === 'TR'
          ? `Yetersiz bakiye! Bu sipariş ${cost} TL tutuyor, mevcut bakiyeniz ${currentClientUser.balance} TL.`
          : `Insufficient funds! This costs ${cost} TL, your balance is ${currentClientUser.balance} TL.`,
        'error'
      );
      return null;
    }

    const nowTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const nowDate = new Date().toISOString();
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
      const provider = apiProviders.find(p => p.id === service.providerApiId && p.status && p.key && p.key.trim() !== '');
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
            // Check if the provider ran out of balance (not a user error)
            const errStr = String(apiResult.error).toLowerCase();
            const isProviderBalanceError = errStr.includes('insufficient') || errStr.includes('balance') || errStr.includes('funds') || errStr.includes('credit') || errStr.includes('bakiye');

            // Refund the user in all error cases
            orderLogs.push({ time: nowTime, text: isProviderBalanceError ? '⚠️ Servis geçici olarak kullanılamıyor. Bakiyeniz iade edildi.' : `❌ Sipariş işlenemedi. Bakiyeniz iade edildi.` });
            finalStatus = 'İptal';
            setUsers(prev => prev.map(u => {
              if (u.id === currentClientUser.id) {
                const refunded = { ...u, balance: parseFloat((u.balance + cost).toFixed(2)), totalOrders: u.totalOrders - 1 };
                setCurrentClientUser(refunded);
                return refunded;
              }
              return u;
            }));

            if (isProviderBalanceError) {
              // Hide provider's internal balance issue — show maintenance message
              showToast(
                currentLanguage === 'TR'
                  ? '⚠️ Bu servis şu an bakımda. Bakiyeniz iade edildi, lütfen daha sonra tekrar deneyiniz.'
                  : '⚠️ This service is temporarily unavailable. Your balance has been refunded. Please try again later.',
                'error'
              );
            } else {
              showToast(
                currentLanguage === 'TR'
                  ? 'Sipariş işlenemedi. Bakiyeniz iade edildi.'
                  : 'Order could not be processed. Your balance has been refunded.',
                'error'
              );
            }

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
            addNotification(
              isProviderBalanceError
                ? `Servis geçici kullanım dışı: ${service.name.substring(0, 20)} — lütfen daha sonra tekrar deneyin`
                : `Sipariş başarısız: ${service.name.substring(0, 20)}`,
              'error'
            );
            return null;
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
    return newOrderId;
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
      date: new Date().toISOString()
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
      date: new Date().toISOString().split('T')[0],
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

  const sendUserNotification = (userId: string, text: string) => {
    const newNotif: UserNotification = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      date: new Date().toISOString(),
      read: false,
    };
    setUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, notifications: [newNotif, ...(u.notifications ?? [])] } : u
    ));
  };

  const sendBroadcastNotification = (text: string) => {
    const date = new Date().toISOString();
    setUsers(prev => prev.map(u => {
      const newNotif: UserNotification = { id: Math.random().toString(36).substr(2, 9), text, date, read: false };
      return { ...u, notifications: [newNotif, ...(u.notifications ?? [])] };
    }));
    if (currentClientUser) {
      const newNotif: UserNotification = { id: Math.random().toString(36).substr(2, 9), text, date, read: false };
      setCurrentClientUser({ ...currentClientUser, notifications: [newNotif, ...(currentClientUser.notifications ?? [])] });
    }
  };

  const markUserNotificationsRead = (userId: string) => {
    setUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, notifications: (u.notifications ?? []).map(n => ({ ...n, read: true })) } : u
    ));
    if (currentClientUser?.id === userId) {
      setCurrentClientUser({ ...currentClientUser, notifications: (currentClientUser.notifications ?? []).map(n => ({ ...n, read: true })) });
    }
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
      approvePaymentRequest, rejectPaymentRequest, togglePaymentMethod, updatePaymentMethodCommission, updatePaymentMethodDetails,
      updateApiProviderStatus, updateApiProvider, testApiProvider, importServicesFromApi, syncProviderOrders,
      toastMsg, showToast,

      // Expose newly created client variables and methods
      portalMode, setPortalMode,
      currentClientUser, setCurrentClientUser,
      clientLoggedIn, setClientLoggedIn,
      registerClient,
      placeClientOrder,
      submitClientPaymentRequest,
      submitClientTicket,
      sendUserNotification,
      sendBroadcastNotification,
      markUserNotificationsRead,
      announcementText, setAnnouncementText,
      smtpConfig, setSmtpConfig,
      isServerSynced
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
