import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppState } from '../context/AppContext';
import { 
  Zap, 
  PlusCircle, 
  History, 
  Wallet, 
  MessageSquare, 
  Code, 
  Globe, 
  User, 
  LogOut, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign, 
  Settings, 
  Send,
  Trash2,
  RefreshCw,
  Search,
  MessageCircle,
  HelpCircle,
  Clock,
  ExternalLink,
  Shield,
  Server,
  Terminal,
  List,
  Play,
  ChevronDown,
  ChevronUp,
  Award,
  BarChart3,
  TrendingUp,
  Key,
  Activity,
  ArrowUpRight,
  Menu,
  X,
  Home,
  Copy,
  ClipboardCheck,
  BanknoteIcon,
  Bell,
  Timer,
  Tag,
  ChevronRight
} from 'lucide-react';

// Extract delivery speed from service name (works for already-imported services)
// Priority: specific rate info first (Saatte X, Günde X), then generic keywords
function extractSpeedFromName(name: string): string | null {
  const n = name;

  // Specific rate per hour: "Saatte 10K", "Saatte 5.000"
  const perHour = n.match(/saatte\s+([\d.,]+\s*[Kk]?)/i);
  if (perHour) {
    const rate = perHour[1].trim().toUpperCase();
    return `${rate}/saat`;
  }

  // Specific rate per day: "Günde 50K", "Günde 10.000"
  const perDay = n.match(/günde\s+([\d.,]+\s*[Kk]?)/i);
  if (perDay) {
    const rate = perDay[1].trim().toUpperCase();
    return `${rate}/gün`;
  }

  // Specific rate per minute: "Dakikada 500"
  const perMin = n.match(/dakikada\s+([\d.,]+\s*[Kk]?)/i);
  if (perMin) {
    const rate = perMin[1].trim().toUpperCase();
    return `${rate}/dk`;
  }

  // Specific rate per week: "Haftada 50K"
  const perWeek = n.match(/haftada\s+([\d.,]+\s*[Kk]?)/i);
  if (perWeek) {
    const rate = perWeek[1].trim().toUpperCase();
    return `${rate}/hafta`;
  }

  // Time estimate: "30 Dakika", "2 Saat", "3 Gün"
  const mins = n.match(/(\d+)\s*dakika/i);
  if (mins) return `~${mins[1]} dk`;
  const hours = n.match(/(\d+)\s*saat/i);
  if (hours) return `~${hours[1]} saat`;
  const days = n.match(/(\d+)\s*gün/i);
  if (days) return `~${days[1]} gün`;

  // Generic fast keywords (last resort)
  if (/anlık|instant|express/i.test(n)) return 'Anlık';
  if (/süper hızlı|hızlı tesli/i.test(n)) return 'Hızlı';

  return null;
}

function getServiceSpeed(service: { deliverySpeed?: string; name: string }): string | null {
  return service.deliverySpeed || extractSpeedFromName(service.name);
}

export const ClientDashboard: React.FC = () => {
  const { 
    currentClientUser, 
    setCurrentClientUser,
    setClientLoggedIn,
    setPortalMode,
    services,
    orders,
    paymentMethods,
    paymentRequests,
    tickets,
    replyTicket,
    placeClientOrder,
    submitClientPaymentRequest,
    submitClientTicket,
    markUserNotificationsRead,
    currentLanguage,
    setCurrentLanguage,
    showToast,
    announcementText
  } = useAppState();

  // Unified Tab Management
  const [activeTab, setActiveTab] = useState<'dashboard' | 'new-order' | 'services' | 'my-orders' | 'add-funds' | 'tickets' | 'api-docs' | 'notifications'>('dashboard');

  // Announcement popup — only shown once per unique message (persisted in localStorage)
  const [showAnnouncementPopup, setShowAnnouncementPopup] = useState(false);
  useEffect(() => {
    if (!announcementText) return;
    const seenKey = 'bm_seen_announcement';
    const alreadySeen = localStorage.getItem(seenKey) === announcementText;
    if (!alreadySeen) {
      setShowAnnouncementPopup(true);
    }
  }, [announcementText]);
  const dismissAnnouncement = () => {
    localStorage.setItem('bm_seen_announcement', announcementText);
    setShowAnnouncementPopup(false);
  };

  // ── Client portal tab history sync ───────────────────────────────────────
  // Keeps the browser back/forward buttons working within the client portal.
  // On first render we update (replace) the existing history entry with the
  // client tab so App.tsx's entry also carries tab info.  On every subsequent
  // tab change we push a new entry.  On popstate we restore the tab.
  const clientTabReady = useRef(false);
  const suppressClientPush = useRef(false);

  useEffect(() => {
    if (!clientTabReady.current) {
      clientTabReady.current = true;
      // Enrich the history entry App.tsx just pushed with our tab info
      const cur = window.history.state ?? {};
      window.history.replaceState({ ...cur, clientActiveTab: activeTab }, '');
      return;
    }
    if (suppressClientPush.current) {
      suppressClientPush.current = false;
      return;
    }
    window.history.pushState({ portalMode: 'client', clientActiveTab: activeTab }, '');
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      const s = e.state as { clientActiveTab?: string } | null;
      if (s?.clientActiveTab) {
        suppressClientPush.current = true;
        setActiveTab(s.clientActiveTab as typeof activeTab);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  // ─────────────────────────────────────────────────────────────────────────

  // Mobile navigation drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // New Order Form States
  const [orderPlatform, setOrderPlatform] = useState<string>('Instagram');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [servicePickerOpen, setServicePickerOpen] = useState(false);
  const [servicePickerSearch, setServicePickerSearch] = useState('');
  const [orderQuantity, setOrderQuantity] = useState<number>(1000);
  const [orderLink, setOrderLink] = useState<string>('');
  const [orderUsername, setOrderUsername] = useState<string>('');

  // Add Funds States
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>(paymentMethods[0]?.id || '1');
  const [depositAmount, setDepositAmount] = useState<string>('150');
  const [shopierLoading, setShopierLoading] = useState(false);
  const [depositConfirm, setDepositConfirm] = useState<{ amount: number; methodName: string; instructions: string; methodId: string; confirmed: boolean } | null>(null);
  const [copiedInstructions, setCopiedInstructions] = useState(false);

  // Support Tickets States
  const [ticketSubject, setTicketSubject] = useState<string>('');
  const [ticketMessage, setTicketMessage] = useState<string>('');
  const [ticketPriority, setTicketPriority] = useState<'Düşük' | 'Orta' | 'Yüksek'>('Orta');
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState<string>('');

  // Search, Filters & Expanders
  const [ordersSearch, setOrdersSearch] = useState('');
  const [servicesSearch, setServicesSearch] = useState('');
  const [selectedServicePlatformFilter, setSelectedServicePlatformFilter] = useState<string>('All');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Live API Playground Simulator states
  const [apiPlaygroundMethod, setApiPlaygroundMethod] = useState<'add_order' | 'status' | 'balance'>('add_order');
  const [apiPlaygroundServiceId, setApiPlaygroundServiceId] = useState<string>('101');
  const [apiPlaygroundOrderLink, setApiPlaygroundOrderLink] = useState<string>('https://instagram.com/username/post');
  const [apiPlaygroundQuantity, setApiPlaygroundQuantity] = useState<number>(1000);
  const [apiPlaygroundOrderId, setApiPlaygroundOrderId] = useState<string>('ORD-58291');
  const [apiResponseLoading, setApiResponseLoading] = useState<boolean>(false);
  const [apiPlaygroundResponse, setApiPlaygroundResponse] = useState<any>(null);

  // Profile Security settings simulations
  const [apiIpWhitelist, setApiIpWhitelist] = useState<string>('82.156.91.240, 195.12.80.3');
  const [twoFactorTokenSimulated, setTwoFactorTokenSimulated] = useState<boolean>(false);

  // Calculate filtered services for order tab
  const servicesOfPlatform = useMemo(() => {
    return services.filter(s => s.status === 'active' && s.platform === orderPlatform);
  }, [services, orderPlatform]);

  // Sync service selection when active platform changes
  useEffect(() => {
    if (servicesOfPlatform.length > 0) {
      setSelectedServiceId(servicesOfPlatform[0].id);
    } else {
      setSelectedServiceId('');
    }
  }, [servicesOfPlatform]);

  const activeServiceObj = useMemo(() => {
    return services.find(s => s.id === selectedServiceId);
  }, [services, selectedServiceId]);

  // Real-time cost calculation
  const calculatedCost = useMemo(() => {
    if (!activeServiceObj) return 0;
    return parseFloat(((activeServiceObj.pricePer1000 * orderQuantity) / 1000).toFixed(2));
  }, [activeServiceObj, orderQuantity]);

  // Client notification unread count
  const unreadNotifCount = useMemo(() => {
    if (!currentClientUser) return 0;
    return (currentClientUser.notifications ?? []).filter(n => !n.read).length;
  }, [currentClientUser]);

  // Client specifics
  const clientOrders = useMemo(() => {
    if (!currentClientUser) return [];
    return orders.filter(o => o.userId === currentClientUser.id);
  }, [orders, currentClientUser]);

  const filteredClientOrders = useMemo(() => {
    return clientOrders.filter(o => 
      o.serviceName.toLowerCase().includes(ordersSearch.toLowerCase()) || 
      o.id.toLowerCase().includes(ordersSearch.toLowerCase()) || 
      o.platform.toLowerCase().includes(ordersSearch.toLowerCase())
    );
  }, [clientOrders, ordersSearch]);

  const clientTickets = useMemo(() => {
    if (!currentClientUser) return [];
    return tickets.filter(t => t.userId === currentClientUser.id);
  }, [tickets, currentClientUser]);

  const clientPayments = useMemo(() => {
    if (!currentClientUser) return [];
    return paymentRequests.filter(p => p.userId === currentClientUser.id);
  }, [paymentRequests, currentClientUser]);

  const activeTicketObj = useMemo(() => {
    return tickets.find(t => t.id === activeTicketId);
  }, [tickets, activeTicketId]);

  // Statistics
  const totalSpent = useMemo(() => {
    return clientOrders
      .filter(o => o.status === 'Tamamlandı')
      .reduce((acc, o) => acc + o.charge, 0);
  }, [clientOrders]);

  const activeOrdersCount = useMemo(() => {
    return clientOrders.filter(o => o.status === 'Bekliyor' || o.status === 'İşlemde').length;
  }, [clientOrders]);

  const completedOrdersCount = useMemo(() => {
    return clientOrders.filter(o => o.status === 'Tamamlandı').length;
  }, [clientOrders]);

  // Services catalog pagination
  const CATALOG_PAGE_SIZE = 20;
  const [catalogPage, setCatalogPage] = useState(1);

  const filteredCatalogServices = useMemo(() => {
    return services
      .filter(s => s.status === 'active')
      .filter(s => selectedServicePlatformFilter === 'All' || s.platform === selectedServicePlatformFilter)
      .filter(s => s.name.toLowerCase().includes(servicesSearch.toLowerCase()))
      .sort((a, b) => a.pricePer1000 - b.pricePer1000);
  }, [services, selectedServicePlatformFilter, servicesSearch]);

  // Reset to page 1 when filters change — must NOT be inside useMemo
  useEffect(() => {
    setCatalogPage(1);
  }, [services, selectedServicePlatformFilter, servicesSearch]);

  const catalogTotalPages = Math.ceil(filteredCatalogServices.length / CATALOG_PAGE_SIZE);
  const paginatedCatalogServices = filteredCatalogServices.slice(
    (catalogPage - 1) * CATALOG_PAGE_SIZE,
    catalogPage * CATALOG_PAGE_SIZE
  );

  // Monthly trend data from real orders (last 4 weeks)
  const monthlyTrendData = useMemo(() => {
    // Handles both ISO ("2026-06-01T...") and legacy Turkish format ("01.06.2026 14:30")
    const parseD = (s: string): Date => {
      const iso = new Date(s);
      if (!isNaN(iso.getTime())) return iso;
      const m = s.match(/^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
      return m ? new Date(+m[3], +m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0)) : new Date(NaN);
    };
    const now = new Date();
    const MONTHS = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
    const points = [];
    for (let i = 4; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 86400000);
      const weekEnd   = new Date(now.getTime() - i       * 7 * 86400000);
      const weekOrders = clientOrders.filter(o => {
        const d = parseD(o.date);
        return !isNaN(d.getTime()) && d >= weekStart && d < weekEnd;
      });
      const amount     = weekOrders.reduce((sum, o) => sum + o.charge, 0);
      const orderCount = weekOrders.length;
      const label = `${weekEnd.getDate().toString().padStart(2,'0')} ${MONTHS[weekEnd.getMonth()]}`;
      points.push({ label, amount, orderCount });
    }
    return points;
  }, [clientOrders]);

  const trendSvgPath = useMemo(() => {
    const max = Math.max(...monthlyTrendData.map(d => d.amount), 1);
    const coords = monthlyTrendData.map((d, i) => {
      const x = i * 25;
      const y = 25 - (d.amount / max) * 20;
      return { x, y: parseFloat(y.toFixed(1)) };
    });
    const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x},${c.y}`).join(' ');
    const area = `${line} L 100,30 L 0,30 Z`;
    const dots = coords.filter((_, i) => i > 0 && i < coords.length - 1);
    return { line, area, dots, coords };
  }, [monthlyTrendData]);

  // Smart order field config based on service name
  const getOrderInputConfig = (serviceName: string, platform: string) => {
    const n = serviceName.toLowerCase();
    const isFollower = (n.includes('takipçi') || n.includes('follower') || n.includes('follow') || n.includes('abone')) && !n.includes('reel') && !n.includes('video') && !n.includes('post') && !n.includes('hikaye') && !n.includes('story');
    const isStory = n.includes('hikaye') || n.includes('story');
    const isReels = n.includes('reels') || n.includes('reel') || n.includes('kısa video');
    const isVideo = n.includes('izlenme') || n.includes('view') || n.includes('watch') || (n.includes('video') && !isReels);

    if (isFollower && platform !== 'YouTube') {
      return {
        needsLink: false,
        needsUsername: true,
        linkLabel: '',
        linkPlaceholder: '',
        usernameLabel: currentLanguage === 'TR' ? 'Kullanıcı Adı (@ olmadan)' : 'Username (without @)',
        usernamePlaceholder: platform === 'Telegram' ? 'kanaladi' : 'ornekkullanici',
      };
    }

    let linkLabel = currentLanguage === 'TR' ? 'Gönderi / Paylaşım Linki' : 'Post / Content Link';
    let linkPlaceholder = `https://www.${platform.toLowerCase()}.com/...`;

    if (isStory) {
      linkLabel = currentLanguage === 'TR' ? 'Hikaye Linki' : 'Story Link';
      linkPlaceholder = 'https://www.instagram.com/stories/kullaniciadi/12345/';
    } else if (isReels) {
      linkLabel = currentLanguage === 'TR' ? 'Reels / Kısa Video Linki' : 'Reels Link';
      linkPlaceholder = 'https://www.instagram.com/reel/XXXXXXXXXXX/';
    } else if (platform === 'YouTube' && (isFollower || !isVideo)) {
      linkLabel = currentLanguage === 'TR' ? 'YouTube Kanal Linki' : 'YouTube Channel Link';
      linkPlaceholder = 'https://www.youtube.com/@kanaladi';
    } else if (platform === 'YouTube' && isVideo) {
      linkLabel = currentLanguage === 'TR' ? 'YouTube Video Linki' : 'YouTube Video Link';
      linkPlaceholder = 'https://www.youtube.com/watch?v=XXXXXXXXXXX';
    } else if (platform === 'TikTok' && isVideo) {
      linkLabel = currentLanguage === 'TR' ? 'TikTok Video Linki' : 'TikTok Video Link';
      linkPlaceholder = 'https://www.tiktok.com/@kullanici/video/1234567890';
    } else if (platform === 'Telegram') {
      linkLabel = currentLanguage === 'TR' ? 'Telegram Kanal / Grup Linki' : 'Telegram Channel / Group Link';
      linkPlaceholder = 'https://t.me/kanaladi';
    } else if (platform === 'Spotify') {
      linkLabel = currentLanguage === 'TR' ? 'Spotify Parça / Profil Linki' : 'Spotify Track / Profile Link';
      linkPlaceholder = 'https://open.spotify.com/track/...';
    } else if (platform === 'Instagram') {
      linkLabel = currentLanguage === 'TR' ? 'Instagram Gönderi Linki' : 'Instagram Post Link';
      linkPlaceholder = 'https://www.instagram.com/p/XXXXXXXXXXX/';
    }

    return { needsLink: true, needsUsername: false, linkLabel, linkPlaceholder, usernameLabel: '', usernamePlaceholder: '' };
  };

  const validateOrderLink = (link: string, platform: string): string | null => {
    try {
      const url = new URL(link);
      const domains: Record<string, string[]> = {
        Instagram: ['instagram.com'],
        TikTok: ['tiktok.com'],
        YouTube: ['youtube.com', 'youtu.be'],
        Twitter: ['twitter.com', 'x.com'],
        Telegram: ['t.me', 'telegram.me', 'telegram.org'],
        Spotify: ['spotify.com'],
      };
      const allowed = domains[platform];
      if (allowed && !allowed.some(d => url.hostname.includes(d))) {
        return currentLanguage === 'TR'
          ? `Bu servis ${platform} linki gerektiriyor. (${allowed[0]})`
          : `This service requires a ${platform} link. (${allowed[0]})`;
      }
    } catch {
      return currentLanguage === 'TR' ? 'Geçersiz URL. https:// ile başlamalı.' : 'Invalid URL. Must start with https://';
    }
    return null;
  };

  const orderInputConfig = activeServiceObj ? getOrderInputConfig(activeServiceObj.name, activeServiceObj.platform) : null;

  // Simulation handlers
  const handlePlaceOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cfg = orderInputConfig;
    const needsLink = !cfg || cfg.needsLink;
    const needsUsername = cfg?.needsUsername;

    if (!selectedServiceId || orderQuantity <= 0 || (needsLink && !orderLink) || (needsUsername && !orderUsername)) {
      showToast(currentLanguage === 'TR' ? 'Lütfen form alanlarını eksiksiz doldurun.' : 'Please fully fill in form components.', 'error');
      return;
    }
    if (needsLink && orderLink) {
      const linkErr = validateOrderLink(orderLink, activeServiceObj!.platform);
      if (linkErr) { showToast(linkErr, 'error'); return; }
    }
    if (activeServiceObj && (orderQuantity < activeServiceObj.min || orderQuantity > activeServiceObj.max)) {
      showToast(
        currentLanguage === 'TR'
          ? `Miktar hatası! Bu servis için sınır: ${activeServiceObj.min} - ${activeServiceObj.max}`
          : `Quantity boundary alert! This service supports: ${activeServiceObj.min} - ${activeServiceObj.max}`,
        'error'
      );
      return;
    }

    const targetLink = needsUsername ? `https://profile/${orderUsername}` : orderLink;
    const newOrderId = await placeClientOrder(selectedServiceId, orderQuantity, targetLink, orderUsername);
    if (newOrderId) {
      setOrderLink('');
      setOrderUsername('');
      setActiveTab('my-orders');
      setExpandedOrderId(newOrderId);
    }
  };

  const handleShopierPay = async () => {
    const val = parseFloat(depositAmount);
    if (isNaN(val) || val < 10 || val > 5000) {
      showToast(currentLanguage === 'TR' ? 'Tutar 10 TL ile 5.000 TL arasında olmalıdır.' : 'Amount must be between 10 and 5000 TRY.', 'error');
      return;
    }
    setShopierLoading(true);
    try {
      const resp = await fetch('/api/shopier/create-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: val,
          userId: currentClientUser?.id || currentClientUser?.email || '',
          userName: currentClientUser?.fullName || '',
          userEmail: currentClientUser?.email || '',
        }),
      });
      const data = await resp.json();
      if (data.ok && data.url) {
        // Store ref in localStorage so success page can retrieve it after redirect
        localStorage.setItem('shopier_pending_ref', data.ref);
        localStorage.setItem('shopier_pending_amount', String(val));
        window.location.href = data.url;
      } else {
        showToast(data.message || (currentLanguage === 'TR' ? 'Shopier bağlantısı kurulamadı.' : 'Could not connect to Shopier.'), 'error');
        setShopierLoading(false);
      }
    } catch {
      showToast(currentLanguage === 'TR' ? 'Bağlantı hatası. Lütfen tekrar deneyin.' : 'Connection error. Please try again.', 'error');
      setShopierLoading(false);
    }
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(depositAmount);
    if (isNaN(val) || val < 10) {
      showToast(currentLanguage === 'TR' ? 'Minimum yükleme tutarı 10 TL’dir.' : 'Minimum deposit limit is 10 TRY.', 'error');
      return;
    }
    const method = paymentMethods.find(m => m.id === selectedPaymentMethodId);
    setDepositConfirm({
      amount: val,
      methodName: method?.name || selectedPaymentMethodId,
      instructions: method?.instructions || '',
      methodId: selectedPaymentMethodId,
      confirmed: false,
    });
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) {
      showToast(currentLanguage === 'TR' ? 'Lütfen başlık ve mesaj giriniz.' : 'Please enter subject and message.', 'error');
      return;
    }
    submitClientTicket(ticketSubject, ticketMessage, ticketPriority);
    setTicketSubject('');
    setTicketMessage('');
  };

  const handleSendTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketReplyText.trim() || !activeTicketId) return;
    replyTicket(activeTicketId, ticketReplyText, 'user');
    setTicketReplyText('');
  };

  // One-click order placement quick action
  const triggerSpeedOrder = (serviceId: string) => {
    const s = services.find(x => x.id === serviceId);
    if (s) {
      setOrderPlatform(s.platform);
      setSelectedServiceId(s.id);
      setActiveTab('new-order');
      showToast(
        currentLanguage === 'TR' 
          ? `Sipariş formuna aktarıldı: ${s.name.substring(0, 30)}...` 
          : `Transferred to Order Tab: ${s.name.substring(0, 30)}...`, 
        'info'
      );
    }
  };

  // API Console Simulation Execution Process
  const executeSimulatedApi = () => {
    setApiResponseLoading(true);
    setApiPlaygroundResponse(null);
    setTimeout(async () => {
      setApiResponseLoading(false);
      const randomSuccessToken = `usr_sig_token_p_${Math.random().toString(36).substring(4, 12)}_${currentClientUser?.id || '90'}`;
      
      if (apiPlaygroundMethod === 'balance') {
        setApiPlaygroundResponse({
          status: "success",
          balance: `${currentClientUser?.balance.toFixed(2)} TRY`,
          currency: "TRY",
          profile: {
            fullName: currentClientUser?.fullName,
            email: currentClientUser?.email,
            reseller_level: "SECURE GOLD BAYİ"
          },
          api_key: randomSuccessToken
        });
      } else if (apiPlaygroundMethod === 'status') {
        const orderToQuery = clientOrders[0] || { id: apiPlaygroundOrderId, status: "İşlemde", quantity: 2000, charge: 40 };
        setApiPlaygroundResponse({
          status: "success",
          order_id: orderToQuery.id,
          status_response: orderToQuery.status,
          charge: `${orderToQuery.charge} TRY`,
          initial_count: 0,
          current_stage: orderToQuery.status === 'Tamamlandı' ? orderToQuery.quantity : Math.floor(orderToQuery.quantity * 0.45),
          query_logs: [
            { timestamp: new Date().toISOString(), server_id: "Node_SMM_Cluster_West", action: "Fetched current order state" }
          ]
        });
      } else {
        const pService = services.find(s => s.id === apiPlaygroundServiceId) || services[0];
        const computedCharge = parseFloat(((pService.pricePer1000 * apiPlaygroundQuantity) / 1000).toFixed(2));
        
        if (currentClientUser && currentClientUser.balance < computedCharge) {
          setApiPlaygroundResponse({
            status: "error",
            error_code: "INSUFFICIENT_FUNDS",
            message: "Mevcut cüzdan bakiyeniz bu API siparişi için yetersizdir. Lütfen bakiye yükleyin.",
            required_charge: `${computedCharge} TRY`,
            current_balance: `${currentClientUser.balance} TRY`
          });
        } else {
          // Place real order via provider API
          const orderSuccess = await placeClientOrder(pService.id, apiPlaygroundQuantity, apiPlaygroundOrderLink, "API_Automated_User");
          setApiPlaygroundResponse(orderSuccess ? {
            status: "success",
            order_id: "ORD-" + Math.floor(Math.random() * 89999 + 10000),
            computed_charge: `${computedCharge} TRY`,
            message: "Sipariş başarıyla işleme alındı.",
            sandbox_mode: false
          } : {
            status: "error",
            error_code: "ORDER_FAILED",
            message: "Sipariş işlenemedi. Bakiyeniz iade edildi.",
          });
        }
      }
    }, 900);
  };

  const handleLogout = () => {
    localStorage.removeItem('smm_client_user_id');
    setClientLoggedIn(false);
    setCurrentClientUser(null);
    setPortalMode('landing');
    showToast(currentLanguage === 'TR' ? 'Müşteri oturumu güvenle sonlandırıldı.' : 'Client session logs closed.', 'info');
  };

  if (!currentClientUser) {
    return (
      <div className="min-h-screen bg-[#070714] text-white flex flex-col items-center justify-center p-4">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mb-2 animate-bounce" />
        <p className="font-bold text-sm text-gray-400">Lütfen sisteme giriş yapın.</p>
        <button onClick={() => setPortalMode('landing')} className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-purple-500 text-black mt-4 rounded-xl font-bold cursor-pointer hover:opacity-90">Ana Sayfaya Dön</button>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-[#090918] text-[#e0e0ff] font-sans antialiased relative selection:bg-cyan-500/30 selection:text-white pb-20 lg:pb-0">

      {/* Announcement Modal Popup */}
      {showAnnouncementPopup && announcementText && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backdropFilter: 'blur(6px)', backgroundColor: 'rgba(5,5,20,0.75)' }}
          onClick={dismissAnnouncement}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl border border-purple-500/40 shadow-2xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #13132a 0%, #0e1a2e 100%)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Glow accent */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: 'linear-gradient(90deg, #a855f7, #06b6d4)' }} />

            {/* Close button */}
            <button
              onClick={dismissAnnouncement}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-150"
              aria-label="Kapat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center gap-4">
              {/* Icon */}
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(6,182,212,0.15))', border: '1px solid rgba(168,85,247,0.35)' }}>
                <span className="text-2xl">📢</span>
              </div>

              {/* Title */}
              <div>
                <p className="text-[10px] font-semibold tracking-widest uppercase mb-1" style={{ color: '#a78bfa' }}>Sistem Bildirimi</p>
                <h3 className="text-sm font-semibold text-white leading-snug">{announcementText}</h3>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-white/10" />

              {/* Confirm button */}
              <button
                onClick={dismissAnnouncement}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #0891b2)' }}
              >
                Anladım
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 1. Mobile Sidebar Drawer Overlay & Container */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] lg:hidden animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer Menu Panel */}
          <div className="fixed top-0 left-0 bottom-0 w-[300px] max-w-[85vw] bg-[#0c0c1e] border-r border-white/5 z-[2001] lg:hidden shadow-2xl flex flex-col justify-between py-6 px-4 animate-slide-right overflow-y-auto">
            <div className="space-y-6">
              {/* Header with Title and Close Button */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center font-black text-white text-sm">
                    S
                  </div>
                  <div>
                    <span className="font-black text-xs text-white uppercase tracking-wider block">SMM PORTAL</span>
                    <span className="text-[8px] text-gray-500 font-mono tracking-wider block">NAVIGATION GATE</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Active Balance badge */}
              <div className="bg-gradient-to-tr from-cyan-950/20 to-[#121226] border border-cyan-500/15 rounded-2xl p-4 space-y-2">
                <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest block">{currentLanguage === 'TR' ? 'ANLIK CÜZDAN BAKİYESİ' : 'LIVE BALANCE'}</span>
                <div className="flex items-baseline gap-1.5 text-white">
                  <span className="text-2xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">₺{currentClientUser.balance.toFixed(2)}</span>
                  <span className="text-[10px] font-bold text-gray-400">TRY</span>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('add-funds');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2 bg-gradient-to-r from-cyan-400 to-purple-600 text-[#090915] hover:text-white font-extrabold text-[10px] rounded-lg mt-1 block text-center"
                >
                  {currentLanguage === 'TR' ? 'Bakiye Yükle' : 'Add Funds'}
                </button>
              </div>

              {/* Sidebar Menu items list */}
              <div className="space-y-1">
                {[
                  { id: 'dashboard', labelTR: 'Kullanıcı Özet Paneli', labelEN: 'Account Console', icon: Award },
                  { id: 'new-order', labelTR: 'Yeni Sipariş Gir', labelEN: 'New SMM Order', icon: PlusCircle },
                  { id: 'services', labelTR: 'Hizmet Fiyat Listesi', labelEN: 'Services Catalog', icon: List },
                  { id: 'my-orders', labelTR: 'Sipariş Geçmişi', labelEN: 'My Order Pipeline', icon: History, badge: activeOrdersCount > 0 ? activeOrdersCount : undefined },
                  { id: 'add-funds', labelTR: 'Bakiye Yükle', labelEN: 'Deposit Assets', icon: Wallet },
                  { id: 'tickets', labelTR: 'Destek Masası', labelEN: 'Support Desk', icon: MessageSquare },
                  { id: 'notifications', labelTR: 'Bildirimler', labelEN: 'Notifications', icon: Bell, badge: unreadNotifCount > 0 ? unreadNotifCount : undefined },
                  { id: 'api-docs', labelTR: 'Entegrasyon & API', labelEN: 'API Playground', icon: Code, yakinda: true },
                ].map(tab => {
                  const TabIcon = tab.icon;
                  const isSel = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setActiveTicketId(null);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSel 
                          ? 'bg-gradient-to-r from-cyan-950/30 via-purple-950/15 to-transparent border-l-2 border-cyan-400 text-white' 
                          : 'hover:bg-white/4 text-gray-400 hover:text-white border-l-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <TabIcon className={`w-4 h-4 shrink-0 ${isSel ? 'text-cyan-400' : 'text-gray-500'}`} />
                        <span>{currentLanguage === 'TR' ? tab.labelTR : tab.labelEN}</span>
                        {(tab as any).yakinda && (
                          <span className="px-1.5 py-0.5 bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-[8px] font-bold rounded-full">Yakında</span>
                        )}
                      </div>
                      {tab.badge !== undefined && (
                        <span className="bg-cyan-500 text-black font-extrabold text-[9px] px-2 py-0.5 rounded-full font-mono">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions inside menu drawer */}
            <div className="border-t border-white/5 pt-4 space-y-3">

              <button
                onClick={() => {
                  setCurrentLanguage(currentLanguage === 'TR' ? 'EN' : 'TR');
                }}
                className="w-full py-2 bg-white/3 border border-white/5 text-gray-400 hover:text-white text-[10px] font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>{currentLanguage === 'TR' ? 'Language: EN' : 'Language: TR'}</span>
              </button>

              <div className="flex items-center justify-between bg-white/2 rounded-xl p-3 border border-white/5 animate-fade-in">
                <div className="text-left">
                  <span className="font-extrabold text-white block text-[10px] leading-tight truncate max-w-[140px]">{currentClientUser.fullName}</span>
                  <span className="text-[8px] text-emerald-400 font-bold block uppercase mt-0.5 tracking-wide">★ SECURE VIP</span>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="p-1 px-2.5 bg-rose-950/20 text-rose-400 border border-rose-950/30 rounded-lg text-[9px] font-bold hover:bg-rose-950/40 cursor-pointer"
                >
                  {currentLanguage === 'TR' ? 'Çıkış' : 'Logout'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 2. Floating Mobile Glassmorphism Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#0e0e24]/90 backdrop-blur-md border-t border-white/5 flex items-center justify-around px-4 lg:hidden z-[1000] shadow-[0_-8px_24px_rgba(0,0,0,0.5)]">
        <button
          onClick={() => {
            setActiveTab('dashboard');
            setActiveTicketId(null);
          }}
          className={`flex flex-col items-center gap-1 transition-all duration-200 cursor-pointer ${
            activeTab === 'dashboard' ? 'text-cyan-400 scale-105' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Award className="w-5 h-5 animate-pulse-slow" />
          <span className="text-[9px] font-bold">{currentLanguage === 'TR' ? 'Özet' : 'Summary'}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('new-order');
            setActiveTicketId(null);
          }}
          className="flex flex-col items-center gap-1 transition-all duration-200 cursor-pointer relative -top-3"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-cyan-400 via-[#7B2FFF] to-purple-600 flex items-center justify-center text-black shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all">
            <PlusCircle className="w-6 h-6 text-[#090918]" />
          </div>
          <span className="text-[9px] font-bold text-gray-300 -mt-0.5">{currentLanguage === 'TR' ? 'Sipariş' : 'Order'}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('my-orders');
            setActiveTicketId(null);
          }}
          className={`flex flex-col items-center gap-1 transition-all duration-200 cursor-pointer relative ${
            activeTab === 'my-orders' ? 'text-cyan-400 scale-105' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <History className="w-5 h-5" />
            {activeOrdersCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-extrabold text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-mono">
                {activeOrdersCount}
              </span>
            )}
          </div>
          <span className="text-[9px] font-bold">{currentLanguage === 'TR' ? 'Siparişlerim' : 'My Orders'}</span>
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-all cursor-pointer"
        >
          <Menu className="w-5 h-5 text-purple-400 animate-pulse" />
          <span className="text-[9px] font-bold">{currentLanguage === 'TR' ? 'Menü' : 'Menu'}</span>
        </button>
      </nav>

      {/* Top Banner Control Navigation */}
      <header className="h-16 border-b border-white/5 bg-[#0e0e24] px-4 md:px-8 flex items-center justify-between sticky top-0 z-[1000] w-full shadow-lg">
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Hamburger Menu Trigger for Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 lg:hidden cursor-pointer"
            title="SMM Navigation Menu"
          >
            <Menu className="w-5 h-5 text-cyan-400" />
          </button>

          <div className="w-8 h-8 sm:w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-[#7B2FFF] to-purple-600 flex items-center justify-center font-black text-white shadow-lg text-sm sm:text-base shrink-0">
            S
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs sm:text-sm tracking-wide text-white font-sora block leading-none">MÜŞTERİ PORTALI</span>
              <span className="px-1 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[7px] sm:text-[8px] font-mono font-bold uppercase tracking-wider">v2.4 PRO</span>
            </div>
            <span className="text-[8px] sm:text-[9px] text-gray-500 font-mono tracking-wider mt-0.5 hidden sm:block uppercase">Dynamic API Fulfillment Console</span>
          </div>
        </div>

        {/* Interaction controls */}
        <div className="flex items-center gap-2.5 sm:gap-4 text-xs">
          
          <button
            onClick={() => setCurrentLanguage(currentLanguage === 'TR' ? 'EN' : 'TR')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-xl font-bold cursor-pointer hover:bg-white/10 text-slate-300 text-[10px] sm:text-xs"
          >
            <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
            <span>{currentLanguage}</span>
          </button>


          {/* Connected profile indicator */}
          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-white/5">
            <div className="text-right hidden sm:block">
              <span className="font-extrabold text-white block leading-none text-[11px]">{currentClientUser.fullName}</span>
              <span className="text-[9px] text-emerald-400 font-bold block mt-0.5 uppercase tracking-wide">★ GOLD MEMBERSHIP</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 sm:p-2 border border-rose-950 bg-rose-950/20 text-rose-400 rounded-xl hover:text-rose-300 cursor-pointer hover:bg-rose-950/40 shrink-0"
              title="Logout session"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Primary grid container */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* Left column visual cards / navigation map */}
        <div className="col-span-1 lg:col-span-3 space-y-6 order-2 lg:order-1">
          
          {/* Cyber Wallet Card layout */}
          <div className="bg-[#121226] border border-cyan-500/15 rounded-3xl p-5 space-y-4 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-400/10 via-purple-500/5 to-transparent rounded-bl-full" />
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{currentLanguage === 'TR' ? 'Cüzdan Bakiyem' : 'Secure Cash Balance'}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="flex items-baseline gap-1.5 text-white">
                <span className="text-3xl font-extrabold font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">₺{currentClientUser.balance.toFixed(2)}</span>
                <span className="text-xs font-bold text-gray-400">TRY</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-white/2 p-2 rounded-xl border border-white/5">
                <span className="text-gray-500 block">{currentLanguage === 'TR' ? 'Hesap Sınıfı' : 'VIP Status'}</span>
                <span className="font-extrabold text-cyan-400 mt-0.5 block uppercase tracking-wide">SECURE VIP</span>
              </div>
              <div className="bg-white/2 p-2 rounded-xl border border-white/5">
                <span className="text-gray-500 block">{currentLanguage === 'TR' ? 'Sipariş Sayısı' : 'Total Orders'}</span>
                <span className="font-extrabold text-white mt-0.5 block font-mono">{clientOrders.length} Adet</span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('add-funds')}
              className="w-full py-3 bg-gradient-to-r from-cyan-400 to-purple-600 text-[#090915] hover:text-white font-extrabold text-xs rounded-xl shadow-lg hover:shadow-cyan-400/20 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Wallet className="w-4 h-4 shrink-0" />
              <span>{currentLanguage === 'TR' ? 'PayTR ile Bakiye Ekle' : 'Deposit Funds'}</span>
            </button>
          </div>

          {/* Quick Stats banner widget */}
          <div className="bg-[#121226]/40 border border-white/5 rounded-3xl p-4 space-y-3.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{currentLanguage === 'TR' ? 'Hızlı Sistem Bilgisi' : 'Live Gateway Metrics'}</span>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-1"><Server className="w-3.5 h-3.5 text-cyan-500" /> API Bağlantısı:</span>
                <span className="font-mono text-emerald-400 font-bold uppercase text-[10px]">Aktif (SSL %100)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-purple-400" /> Güvenlik Modu:</span>
                <span className="font-mono text-cyan-400 font-bold uppercase text-[10px]">AES-256</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-yellow-500" /> Ortl. Gönderim:</span>
                <span className="font-mono text-white text-[10px]">&lt; 3.2 Saniye</span>
              </div>
            </div>
          </div>

          {/* Tab buttons sidebar layout - Hidden on mobile, sticky bar utilized instead */}
          <div className="bg-[#121226]/50 border border-white/5 rounded-3xl p-3 space-y-1.5 shadow-md hidden lg:block">
            {[
              { id: 'dashboard', labelTR: 'Kullanıcı Özet Paneli', labelEN: 'Account Console', icon: Award },
              { id: 'new-order', labelTR: 'Yeni Sipariş Gir', labelEN: 'New SMM Order', icon: PlusCircle },
              { id: 'services', labelTR: 'Hizmet Fiyat Listesi', labelEN: 'Services Catalog', icon: List },
              { id: 'my-orders', labelTR: 'Sipariş Geçmişi', labelEN: 'My Order Pipeline', icon: History, badge: activeOrdersCount > 0 ? activeOrdersCount : undefined },
              { id: 'add-funds', labelTR: 'Bakiye Yükle', labelEN: 'Deposit Assets', icon: Wallet },
              { id: 'tickets', labelTR: 'Destek Masası', labelEN: 'Support Desk', icon: MessageSquare },
              { id: 'notifications', labelTR: 'Bildirimler', labelEN: 'Notifications', icon: Bell, badge: unreadNotifCount > 0 ? unreadNotifCount : undefined },
              { id: 'api-docs', labelTR: 'Entegrasyon & API', labelEN: 'API Playground', icon: Code, yakinda: true },
            ].map(tab => {
              const TabIcon = tab.icon;
              const isSel = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setActiveTicketId(null);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-250 group cursor-pointer ${
                    isSel 
                      ? 'bg-gradient-to-r from-cyan-950/40 via-purple-950/20 to-transparent border-l-2 border-cyan-400 text-white shadow shadow-cyan-950/10' 
                      : 'hover:bg-white/4 text-gray-400 hover:text-white border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <TabIcon className={`w-4 h-4 shrink-0 transition-transform ${isSel ? 'text-cyan-400 scale-105' : 'text-gray-500 group-hover:text-gray-300 group-hover:scale-105'}`} />
                    <span>{currentLanguage === 'TR' ? tab.labelTR : tab.labelEN}</span>
                    {(tab as any).yakinda && (
                      <span className="px-1.5 py-0.5 bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-[8px] font-bold rounded-full">Yakında</span>
                    )}
                  </div>
                  {tab.badge !== undefined && (
                    <span className="bg-cyan-500 text-black font-extrabold text-[9px] px-2 py-0.5 rounded-full font-mono animate-pulse shrink-0">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Notice Alert box */}
          <div className="bg-yellow-950/10 border border-yellow-700/20 p-4 rounded-3xl text-[11px] text-gray-400 leading-relaxed space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 text-yellow-500 font-extrabold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{currentLanguage === 'TR' ? 'SİSTEM DUYURUSU' : 'AUTO-PROCESS NOTICE'}</span>
            </div>
            <p className="text-[11px]">
              {currentLanguage === 'TR' 
                ? 'Siparişleriniz sistemimiz tarafından tam otomatik olarak alınır, işleme konur ve anlık sonuçlandırılır. Sizin el ile müdahale etmenize gerek yoktur!'
                : 'All orders are instantly processed by our automated system. No manual intervention required.'}
            </p>
          </div>

        </div>

        {/* Right column active panels stream */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* TAB: Premium Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in text-xs">
              
              {/* Profile Card Header */}
              <div className="bg-gradient-to-r from-[#0e0e2e] via-[#151538] to-[#0e0e2e] border border-white/5 rounded-3xl p-6 relative overflow-hidden shadow-xl">
                <div className="absolute -top-16 -right-16 w-36 h-36 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-cyan-400/10 rounded-full blur-3xl" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-lg md:text-xl font-bold font-sora text-white flex items-center gap-2">
                      {currentLanguage === 'TR' ? `Tekrar Hoş Geldiniz, ${currentClientUser.fullName}! 👋` : `Welcome back, ${currentClientUser.fullName}! 👋`}
                    </h2>
                    <p className="text-gray-400 text-xs mt-1">
                      {currentLanguage === 'TR' 
                        ? 'Bayi paneliniz aktif. Sistemimiz üzerinden 7/24 kesintisiz sosyal ağ gönderimi sağlayabilirsiniz.' 
                        : 'Your reseller panel is active. 24/7 seamless social media order processing is enabled.'}
                    </p>
                  </div>
                  <div className="bg-[#090918]/60 p-3 rounded-2xl border border-white/5 flex items-center gap-3 shrink-0">
                    <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-ping" />
                    <div>
                      <span className="text-[10px] text-gray-500 block font-bold">API STATUS:</span>
                      <span className="font-extrabold text-emerald-400 tracking-wide uppercase text-[10px]">ONLINE / SECURED</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stat metric grids */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                
                <div className="bg-[#121226] border border-cyan-500/15 p-4 rounded-2xl relative overflow-hidden group hover:border-cyan-400/40 transition duration-200">
                  <div className="absolute top-2 right-2 p-1.5 bg-cyan-950/50 rounded-lg text-cyan-400">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <span className="text-gray-500 font-extrabold uppercase text-[10px] tracking-wider block">{currentLanguage === 'TR' ? 'Mevcut Bakiye' : 'Asset Wallet'}</span>
                  <div className="mt-2 text-xl font-extrabold font-mono text-cyan-400">₺{currentClientUser.balance.toFixed(2)}</div>
                  <button onClick={() => setActiveTab('add-funds')} className="text-gray-400 hover:text-white mt-2 block font-extrabold hover:underline text-[10px]">
                    {currentLanguage === 'TR' ? 'Hızlı Bakiye Ekle →' : 'Deposit assets →'}
                  </button>
                </div>

                <div className="bg-[#121226] border border-purple-500/15 p-4 rounded-2xl relative overflow-hidden group hover:border-purple-400/40 transition duration-200">
                  <div className="absolute top-2 right-2 p-1.5 bg-purple-950/50 rounded-lg text-purple-400">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <span className="text-gray-500 font-extrabold uppercase text-[10px] tracking-wider block">{currentLanguage === 'TR' ? 'Toplam Harcama' : 'Lifetime Spent'}</span>
                  <div className="mt-2 text-xl font-extrabold font-mono text-purple-400">₺{totalSpent.toFixed(2)}</div>
                  <span className="text-gray-600 font-medium mt-1.5 block text-[10px]">
                    {currentLanguage === 'TR' ? 'Sadece tamamlanan siparişler' : 'Completed orders only'}
                  </span>
                </div>

                <div className="bg-[#121226] border border-yellow-500/15 p-4 rounded-2xl relative overflow-hidden group hover:border-yellow-400/40 transition duration-200">
                  <div className="absolute top-2 right-2 p-1.5 bg-yellow-950/50 rounded-lg text-yellow-500">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="text-gray-500 font-extrabold uppercase text-[10px] tracking-wider block">{currentLanguage === 'TR' ? 'Sıradaki Siparişler' : 'Active Pipeline'}</span>
                  <div className="mt-2 text-xl font-extrabold font-mono text-yellow-500">{activeOrdersCount} Adet</div>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-1.5">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                    <span>{currentLanguage === 'TR' ? 'Otomatik işleniyor' : 'Auto-processing'}</span>
                  </span>
                </div>

                <div className="bg-[#121226] border border-emerald-500/15 p-4 rounded-2xl relative overflow-hidden group hover:border-emerald-400/40 transition duration-200">
                  <div className="absolute top-2 right-2 p-1.5 bg-emerald-950/50 rounded-lg text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <span className="text-gray-500 font-extrabold uppercase text-[10px] tracking-wider block">{currentLanguage === 'TR' ? 'Tamamlananlar' : 'Completed Jobs'}</span>
                  <div className="mt-2 text-xl font-extrabold font-mono text-emerald-400">{completedOrdersCount} Adet</div>
                  <button onClick={() => setActiveTab('my-orders')} className="text-gray-400 hover:text-white mt-1.5 block font-extrabold hover:underline text-[10px]">
                    {currentLanguage === 'TR' ? 'Detayları Listele →' : 'Review lists →'}
                  </button>
                </div>

              </div>

              {/* Double content area: SVG Spending Chart & Live Recent Activity */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Spending Chart Card (6 Cols) */}
                <div className="md:col-span-7 bg-[#121226]/80 border border-white/5 rounded-3xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-[10.5px] font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-cyan-400" />
                      <span>{currentLanguage === 'TR' ? 'Aylık Sipariș & Harcama Trendi' : 'Estimated Wallet Usage Velocity'}</span>
                    </span>
                    <span className="text-[9px] font-mono text-gray-500">REALTIME SYNC</span>
                  </div>

                  <p className="text-gray-400">
                    {currentLanguage === 'TR'
                      ? 'Siparişlerinizin platformlara göre genel dağılımı ve haftalık bakiye tüketiş hızı simülasyonu.'
                      : 'Statistical dispersion of placed actions grouped by communication structures.'}
                  </p>

                  {/* Elegant Simulated SVG Graphic Line Chart */}
                  <div className="w-full bg-[#090918] rounded-2xl p-4 border border-white/5 relative flex flex-col justify-end h-56 group overflow-hidden">
                    
                    {/* SVG Chart Drawing inside box */}
                    <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
                      <div className="border-b border-white/5 w-full h-0" />
                      <div className="border-b border-white/5 w-full h-0" />
                      <div className="border-b border-white/5 w-full h-0" />
                      <div className="border-b border-white/5 w-full h-0" />
                    </div>

                    {clientOrders.length === 0 ? (
                      <div className="w-full flex items-center justify-center h-32 text-center">
                        <p className="text-[10px] text-gray-600 italic">{currentLanguage === 'TR' ? 'Henüz sipariş bulunmuyor.' : 'No orders yet.'}</p>
                      </div>
                    ) : (
                      <svg className="w-full h-32 text-cyan-500 overflow-visible z-10" viewBox="0 0 100 30" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path 
                          d={trendSvgPath.line}
                          fill="none" 
                          stroke="url(#chartGrad)" 
                          strokeWidth="1.5" 
                          strokeLinecap="round" 
                        />
                        <path 
                          d={trendSvgPath.area}
                          fill="url(#chartGrad)" 
                        />
                        {trendSvgPath.dots.map((dot, i) => (
                          <circle key={i} cx={dot.x} cy={dot.y} r="1.2" fill={i % 2 === 0 ? "#7B2FFF" : "#00D4FF"} className="animate-pulse" />
                        ))}
                      </svg>
                    )}

                    <div className="flex justify-between text-[9px] text-gray-500 font-mono mt-3 border-t border-white/5 pt-2 z-10">
                      {monthlyTrendData.map((d, i) => (
                        <span key={i}>{d.label}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] pl-2 font-mono">
                    <span className="flex items-center gap-1.5 text-cyan-400">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      {currentLanguage === 'TR' ? 'Instagram' : 'Instagram'}
                    </span>
                    <span className="flex items-center gap-1.5 text-purple-400">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      {currentLanguage === 'TR' ? 'TikTok' : 'TikTok'}
                    </span>
                    <span className="flex items-center gap-1.5 text-yellow-400">
                      <span className="w-2 h-2 rounded-full bg-yellow-400" />
                      {currentLanguage === 'TR' ? 'Telegram' : 'Telegram'}
                    </span>
                  </div>

                </div>

                {/* Recent Activities pipeline & Actions feed (5 Cols) */}
                <div className="md:col-span-5 bg-[#121226]/80 border border-white/5 rounded-3xl p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <span className="text-[10.5px] font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-4 h-4 text-purple-400" />
                        <span>{currentLanguage === 'TR' ? 'Canlı Aktivite Akışı' : 'Real-time Feed logs'}</span>
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>

                    <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                      {clientOrders.length === 0 && clientPayments.length === 0 ? (
                        <p className="text-gray-600 italic py-8 text-center">{currentLanguage === 'TR' ? 'Henüz hiçbir aktivite bulunmamaktadır.' : 'No recent operations detected.'}</p>
                      ) : (
                        [
                          ...clientOrders.map(o => ({
                            type: 'order',
                            time: o.date.split(' ')[1] || '09:41',
                            title: o.serviceName,
                            desc: `${o.quantity} Qty • ${o.status}`,
                            color: o.status === 'Tamamlandı' ? 'text-emerald-400' : 'text-cyan-400',
                            status: o.status
                          })),
                          ...clientPayments.map(p => ({
                            type: 'payment',
                            time: p.date.split(' ')[1] || '10:15',
                            title: `${p.amount} TL Ödeme Talebi`,
                            desc: `${p.method} • ${p.status}`,
                            color: p.status === 'Onaylandı' ? 'text-emerald-400' : 'text-yellow-400',
                            status: p.status
                          }))
                        ]
                        .slice(0, 5)
                        .map((act, i) => (
                          <div key={i} className="flex gap-3 leading-relaxed border-b border-white/2 pb-2 last:border-b-0">
                            <span className="text-[9.5px] font-mono text-gray-500 mt-1 shrink-0">{act.time}</span>
                            <div className="space-y-0.5">
                              <span className="text-gray-300 font-bold block truncate max-w-[190px]">{act.title}</span>
                              <span className={`text-[10px] font-bold ${act.color}`}>{act.desc}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveTab('my-orders')}
                    className="w-full py-2.5 bg-white/4 rounded-xl border border-white/5 hover:bg-white/7 font-extrabold text-[10px] cursor-pointer text-center"
                  >
                    {currentLanguage === 'TR' ? 'Tüm İşlemleri İncele' : 'Manage Pipeline'}
                  </button>
                </div>

              </div>
              
              {/* Informative Grid detailing automated sync */}
              <div className="bg-gradient-to-tr from-cyan-950/25 via-transparent to-transparent border border-cyan-500/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-950/40 border border-cyan-500/20 rounded-xl text-cyan-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-white font-bold block">{currentLanguage === 'TR' ? 'Süper Hızlı API Dağıtım Motoru Aktif!' : 'Wholesale SMM API Connection Active'}</span>
                    <span className="text-slate-400 block mt-0.5">{currentLanguage === 'TR' ? 'Siparişiniz saniyeler içinde SSL tünellerimizden geçerek otomatik olarak işleme alınır.' : 'Your order is instantly processed through our secured SSL infrastructure.'}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('new-order')}
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-500 text-black font-extrabold rounded-xl shrink-0 transition-transform hover:scale-102 cursor-pointer"
                >
                  {currentLanguage === 'TR' ? 'Hemen Sipariş Ver' : 'Launch Order'}
                </button>
              </div>

            </div>
          )}

          {/* TAB 1: Place a New SMM Order */}
          {activeTab === 'new-order' && (
            <div className="bg-[#121226] border border-white/5 rounded-3xl p-6 space-y-6 shadow-xl animate-fade-in text-xs">
              
              <div className="border-b border-white/5 pb-4">
                <h3 className="text-base font-bold font-sora text-white">{currentLanguage === 'TR' ? 'Canlı Entegre Sipariş Formu' : 'Fast Automated Order Placement'}</h3>
                <p className="text-xs text-gray-500 mt-1">{currentLanguage === 'TR' ? 'Hizmet ağınızı seçin, siparişi girin ve sistemin API ile işleyerek tamamlamasını izleyin.' : 'Fill the forms below to initiate automated API actions.'}</p>
              </div>

              <form onSubmit={handlePlaceOrderSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Form fields selection */}
                <div className="md:col-span-8 space-y-5">
                  
                  {/* Category Grid platform */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{currentLanguage === 'TR' ? 'Ağ Platform Kategorisi' : 'Social Platform Domain'}</label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Spotify', 'Telegram'].map(plat => (
                        <button
                          key={plat}
                          type="button"
                          onClick={() => setOrderPlatform(plat)}
                          className={`py-2 rounded-xl font-bold uppercase text-[9px] border transition cursor-pointer ${
                            orderPlatform === plat 
                              ? 'bg-cyan-950/40 border-cyan-400 text-cyan-400 font-extrabold shadow-sm' 
                              : 'bg-white/2 border-white/5 text-gray-500 hover:text-white'
                          }`}
                        >
                          {plat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Service Picker */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{currentLanguage === 'TR' ? 'Sosyal Ağ Servis Seçimi' : 'Active Wholesale SMM Service'}</label>

                    {servicesOfPlatform.length === 0 ? (
                      <div className="w-full bg-[#0d0d1c] border border-white/10 rounded-xl py-3 px-4 text-gray-500 text-xs">
                        {currentLanguage === 'TR' ? 'Bu platformda aktif servis yok' : 'No active service available'}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setServicePickerOpen(true); setServicePickerSearch(''); }}
                        className="w-full bg-[#0d0d1c] border border-white/10 hover:border-cyan-400/50 rounded-xl py-3 px-4 text-left transition flex items-center justify-between gap-3 group"
                      >
                        {activeServiceObj ? (
                          <div className="flex-1 min-w-0">
                            <span className="text-white font-semibold text-xs block truncate">{activeServiceObj.name}</span>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-cyan-400 font-mono font-bold text-[10px]">₺{activeServiceObj.pricePer1000.toFixed(2)} / 1k</span>
                              {getServiceSpeed(activeServiceObj) && (
                                <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                                  <Timer className="w-2.5 h-2.5" />{getServiceSpeed(activeServiceObj)}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">{currentLanguage === 'TR' ? 'Servis seçin...' : 'Select a service...'}</span>
                        )}
                        <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition shrink-0" />
                      </button>
                    )}

                    {/* Service Picker Modal */}
                    {servicePickerOpen && (
                      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" onClick={() => setServicePickerOpen(false)}>
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                        <div
                          className="relative w-full max-w-lg bg-[#0e0e1e] border border-white/10 rounded-3xl shadow-2xl shadow-black/60 flex flex-col max-h-[80vh] animate-fade-in"
                          onClick={e => e.stopPropagation()}
                        >
                          {/* Modal Header */}
                          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/5">
                            <div>
                              <h3 className="text-sm font-bold text-white">{currentLanguage === 'TR' ? 'Servis Seçin' : 'Select Service'}</h3>
                              <p className="text-[10px] text-gray-500 mt-0.5">{orderPlatform} · {servicesOfPlatform.length} {currentLanguage === 'TR' ? 'aktif servis' : 'active services'}</p>
                            </div>
                            <button type="button" onClick={() => setServicePickerOpen(false)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer">
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Search */}
                          <div className="px-5 py-3 border-b border-white/5">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                              <input
                                autoFocus
                                type="text"
                                placeholder={currentLanguage === 'TR' ? 'Servis ara...' : 'Search services...'}
                                className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition"
                                value={servicePickerSearch}
                                onChange={e => setServicePickerSearch(e.target.value)}
                              />
                            </div>
                          </div>

                          {/* Service Cards List */}
                          <div className="overflow-y-auto flex-1 p-3 space-y-2">
                            {servicesOfPlatform
                              .filter(s => s.name.toLowerCase().includes(servicePickerSearch.toLowerCase()) || s.category.toLowerCase().includes(servicePickerSearch.toLowerCase()))
                              .map((serv, idx) => {
                                const isSelected = serv.id === selectedServiceId;
                                return (
                                  <button
                                    key={serv.id}
                                    type="button"
                                    onClick={() => { setSelectedServiceId(serv.id); setServicePickerOpen(false); }}
                                    className={`w-full text-left p-3.5 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                                      isSelected
                                        ? 'bg-cyan-950/40 border-cyan-400/50 shadow-sm shadow-cyan-400/10'
                                        : 'bg-white/2 border-white/5 hover:bg-white/5 hover:border-white/10'
                                    }`}
                                  >
                                    <div className="flex-1 min-w-0 space-y-1.5">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-cyan-400/20 text-cyan-300' : 'bg-white/5 text-gray-500'}`}>
                                          #{idx + 1}
                                        </span>
                                        <span className="text-[9px] font-bold bg-purple-500/15 text-purple-400 px-1.5 py-0.5 rounded-md">{serv.category}</span>
                                      </div>
                                      <p className={`text-xs font-semibold leading-snug ${isSelected ? 'text-white' : 'text-gray-200'}`}>{serv.name}</p>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[10px] text-gray-500 font-mono">Min {serv.min} — Max {serv.max}</span>
                                        {getServiceSpeed(serv) && (
                                          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                                            <Timer className="w-2.5 h-2.5" />{getServiceSpeed(serv)}
                                          </span>
                                        )}
                                        {serv.deliveryInterval && (
                                          <span className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold">
                                            <RefreshCw className="w-2 h-2" />{serv.deliveryInterval}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span className="text-sm font-extrabold font-mono text-cyan-400 block">₺{serv.pricePer1000.toFixed(2)}</span>
                                      <span className="text-[9px] text-gray-600">/ 1000</span>
                                      {isSelected && (
                                        <div className="mt-1.5 w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center ml-auto">
                                          <CheckCircle className="w-3 h-3 text-black" />
                                        </div>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            {servicesOfPlatform.filter(s => s.name.toLowerCase().includes(servicePickerSearch.toLowerCase()) || s.category.toLowerCase().includes(servicePickerSearch.toLowerCase())).length === 0 && (
                              <p className="text-center text-gray-600 text-xs py-8">{currentLanguage === 'TR' ? 'Sonuç bulunamadı.' : 'No results found.'}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Smart input fields based on service type */}
                  {orderInputConfig?.needsUsername ? (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {orderInputConfig.usernameLabel}
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">@</span>
                        <input
                          id="client-order-username"
                          type="text"
                          required
                          placeholder={orderInputConfig.usernamePlaceholder}
                          className="w-full bg-[#0d0d1c] border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white focus:outline-none focus:border-cyan-400 transition"
                          value={orderUsername}
                          onChange={(e) => setOrderUsername(e.target.value.replace(/^@/, ''))}
                        />
                      </div>
                      <p className="text-[10px] text-gray-600">@ işareti olmadan sadece kullanıcı adını girin.</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {orderInputConfig?.linkLabel || (currentLanguage === 'TR' ? 'İçerik Linki' : 'Content Link')}
                      </label>
                      <input
                        id="client-order-link"
                        type="url"
                        required
                        placeholder={orderInputConfig?.linkPlaceholder || 'https://...'}
                        className="w-full bg-[#0d0d1c] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-400 transition"
                        value={orderLink}
                        onChange={(e) => setOrderLink(e.target.value)}
                      />
                      {orderLink && validateOrderLink(orderLink, activeServiceObj?.platform || '') && (
                        <p className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                          ⚠ {validateOrderLink(orderLink, activeServiceObj?.platform || '')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Quantity input — fixed leading-zero bug */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{currentLanguage === 'TR' ? 'Gönderilecek Miktar' : 'SMM Order Quantity'}</label>
                      {activeServiceObj && (
                        <span className="text-[10px] text-gray-500 font-bold bg-white/2 px-2 py-0.5 rounded border border-white/5">
                          {currentLanguage === 'TR' ? `Min ${activeServiceObj.min} — Max ${activeServiceObj.max}` : `Min ${activeServiceObj.min} — Max ${activeServiceObj.max}`}
                        </span>
                      )}
                    </div>
                    <input
                      id="client-order-quantity"
                      type="text"
                      inputMode="numeric"
                      required
                      className="w-full bg-[#0d0d1c] border border-white/10 rounded-xl py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-cyan-400 transition"
                      value={orderQuantity === 0 ? '' : orderQuantity}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, '');
                        setOrderQuantity(raw === '' ? 0 : parseInt(raw, 10));
                      }}
                      placeholder={activeServiceObj ? String(activeServiceObj.min) : '1000'}
                    />
                  </div>

                </div>

                {/* Receipt and computation ledger block */}
                <div className="md:col-span-4 bg-[#0d0d1c] border border-white/5 rounded-3xl p-5 flex flex-col justify-between space-y-6">
                  
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block border-b border-white/5 pb-2">
                      {currentLanguage === 'TR' ? 'SİPARİŞ HESAP ÖZETİ' : 'RECEIPT LEDGER'}
                    </span>
                    
                    {activeServiceObj ? (
                      <div className="space-y-3.5">
                        <div>
                          <span className="text-gray-500 block leading-none">{currentLanguage === 'TR' ? 'Birim Komisyon Fiyatı (1k)' : 'Price Per 1k'}</span>
                          <span className="font-bold text-white mt-1 block">₺{activeServiceObj.pricePer1000.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block leading-none">{currentLanguage === 'TR' ? 'Seçilen Platform' : 'Network Type'}</span>
                          <span className="font-bold text-cyan-400 font-mono mt-1 block uppercase">{activeServiceObj.platform}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block leading-none">{currentLanguage === 'TR' ? 'İşlem Sistemi' : 'Processing System'}</span>
                          <span className="font-bold text-purple-400 mt-1 block flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 shrink-0" />
                            <span>{currentLanguage === 'TR' ? 'Otomatik SMM Sistemi' : 'Automated SMM System'}</span>
                          </span>
                        </div>
                        {activeServiceObj?.deliverySpeed && (
                          <div>
                            <span className="text-gray-500 block leading-none">{currentLanguage === 'TR' ? 'Tahmini Gönderim Süresi' : 'Est. Delivery Time'}</span>
                            <span className="font-bold text-emerald-400 mt-1 flex items-center gap-1">
                              <Timer className="w-3.5 h-3.5 shrink-0" />
                              {activeServiceObj.deliverySpeed}
                            </span>
                          </div>
                        )}
                        {activeServiceObj?.deliveryInterval && (
                          <div>
                            <span className="text-gray-500 block leading-none">{currentLanguage === 'TR' ? 'Gönderim Aralığı' : 'Delivery Interval'}</span>
                            <span className="font-bold text-amber-400 mt-1 flex items-center gap-1">
                              <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                              {activeServiceObj.deliveryInterval}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500 block leading-none">{currentLanguage === 'TR' ? 'Garanti' : 'Guaranty Status'}</span>
                          <span className="font-bold text-emerald-400 mt-1 block">✓ 30 Gün Telafi Garantili</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600 italic py-4">{currentLanguage === 'TR' ? 'Lütfen yukarıdan servis seçiniz.' : 'Please select an active service package.'}</p>
                    )}
                  </div>

                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-baseline text-white">
                      <span className="text-xs text-gray-400">{currentLanguage === 'TR' ? 'Toplam Tahsilat' : 'Total Price'}</span>
                      <span className="text-2xl font-extrabold font-mono text-cyan-400">₺{calculatedCost.toFixed(2)}</span>
                    </div>

                    <button
                      id="client-submit-order-btn"
                      type="submit"
                      disabled={!activeServiceObj}
                      className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-purple-600 font-extrabold text-black hover:text-white rounded-xl shadow-lg hover:shadow-cyan-400/20 active:scale-95 transition-all duration-200 cursor-pointer text-center text-[11px]"
                    >
                      {currentLanguage === 'TR' ? 'Cüzdan Bakiyesiyle Satın Al' : 'Commit Order Payment'}
                    </button>
                  </div>

                </div>

              </form>
            </div>
          )}

          {/* TAB 2: Complete Services list with Search & Filter */}
          {activeTab === 'services' && (
            <div className="bg-[#121226] border border-white/5 rounded-3xl p-6 space-y-6 shadow-xl animate-fade-in text-xs">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-base font-bold font-sora text-white">{currentLanguage === 'TR' ? 'Hizmet Fiyat ve Kalite Kataloğu' : 'Complete Services & Rates'}</h3>
                  <p className="text-xs text-gray-500 mt-1">{currentLanguage === 'TR' ? 'Portföyümüzdeki tüm sosyal ağ hizmetleri, birim fiyatları ve limit bilgileri' : 'Explore all wholesale packages with instant pricing terms.'}</p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={currentLanguage === 'TR' ? 'Katalogda ara...' : 'Search rates...'}
                    className="w-full bg-[#0d0d1c] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400"
                    value={servicesSearch}
                    onChange={(e) => setServicesSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Platform Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                {['All', 'Instagram', 'TikTok', 'YouTube', 'Twitter', 'Telegram', 'Spotify'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedServicePlatformFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[9px] transition cursor-pointer ${
                      selectedServicePlatformFilter === cat
                        ? 'bg-cyan-500 text-black shadow-md'
                        : 'bg-white/2 border border-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {currentLanguage === 'TR' && cat === 'All' ? 'Tümü' : cat}
                  </button>
                ))}
              </div>

              {/* Services pricing catalog sheet */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/2 border-b border-white/5 text-gray-500 font-bold uppercase tracking-wider text-[9px]">
                      <th className="py-3 px-3">#</th>
                      <th className="py-3 px-3">{currentLanguage === 'TR' ? 'Hizmet Detayları' : 'Specific Package Detail'}</th>
                      <th className="py-3 px-3">{currentLanguage === 'TR' ? 'Min / Max' : 'Min / Max'}</th>
                      <th className="py-3 px-3 text-center hidden sm:table-cell">{currentLanguage === 'TR' ? 'Gönderim Süresi' : 'Est. Speed'}</th>
                      <th className="py-3 px-3 text-right">{currentLanguage === 'TR' ? 'Birim Fiyat' : 'Price /1k'}</th>
                      <th className="py-3 px-3 text-center">{currentLanguage === 'TR' ? 'Sipariş' : 'Order'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300 font-medium leading-relaxed">
                    {paginatedCatalogServices.map((ser, idx) => (
                        <tr key={ser.id} className="hover:bg-white/2 transition-colors group">
                          <td className="py-3 px-3 font-mono text-cyan-400 font-bold text-[10px]">#{(catalogPage - 1) * CATALOG_PAGE_SIZE + idx + 1}</td>
                          <td className="py-3 px-3">
                            <span className="text-white font-semibold block text-[11px] leading-snug">{ser.name}</span>
                            <span className="text-[9px] font-bold text-purple-400/80 mt-0.5 block">{ser.category}</span>
                          </td>
                          <td className="py-3 px-3 font-mono text-gray-500 text-[10px]">
                            {ser.min} — {ser.max}
                          </td>
                          <td className="py-3 px-3 text-center hidden sm:table-cell">
                            <div className="flex flex-col items-center gap-1">
                              {ser.deliverySpeed ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/30 px-2 py-0.5 rounded-lg whitespace-nowrap">
                                  <Timer className="w-2.5 h-2.5 shrink-0" />
                                  {ser.deliverySpeed}
                                </span>
                              ) : null}
                              {ser.deliveryInterval ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-950/30 border border-amber-800/20 px-2 py-0.5 rounded-lg whitespace-nowrap">
                                  <RefreshCw className="w-2 h-2 shrink-0" />
                                  {ser.deliveryInterval}
                                </span>
                              ) : null}
                              {!ser.deliverySpeed && !ser.deliveryInterval && (
                                <span className="text-[10px] text-gray-600">—</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-cyan-400 font-bold text-sm">
                            ₺{ser.pricePer1000.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => triggerSpeedOrder(ser.id)}
                              className="px-3 py-1.5 text-[9.5px] font-black bg-cyan-950/40 text-cyan-400 border border-cyan-400/20 rounded-xl hover:bg-cyan-500 hover:text-black hover:border-transparent transition group-hover:border-cyan-400/40"
                            >
                              {currentLanguage === 'TR' ? 'Sipariş Ver' : 'Order'}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {catalogTotalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <p className="text-[10px] text-gray-500">
                    {filteredCatalogServices.length} {currentLanguage === 'TR' ? 'hizmetten' : 'of'} {(catalogPage - 1) * CATALOG_PAGE_SIZE + 1}–{Math.min(catalogPage * CATALOG_PAGE_SIZE, filteredCatalogServices.length)} {currentLanguage === 'TR' ? 'gösteriliyor' : 'shown'}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCatalogPage(p => Math.max(1, p - 1))}
                      disabled={catalogPage === 1}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold disabled:opacity-30 hover:bg-white/10 transition cursor-pointer"
                    >
                      {currentLanguage === 'TR' ? 'Önceki' : 'Prev'}
                    </button>
                    {Array.from({ length: Math.min(5, catalogTotalPages) }, (_, i) => {
                      const page = catalogPage <= 3 ? i + 1 : catalogPage - 2 + i;
                      if (page > catalogTotalPages) return null;
                      return (
                        <button
                          key={page}
                          onClick={() => setCatalogPage(page)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer ${page === catalogPage ? 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-400' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'}`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCatalogPage(p => Math.min(catalogTotalPages, p + 1))}
                      disabled={catalogPage === catalogTotalPages}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold disabled:opacity-30 hover:bg-white/10 transition cursor-pointer"
                    >
                      {currentLanguage === 'TR' ? 'Sonraki' : 'Next'}
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: Pipeline Orders Historical List with Expandable API Logs Grid */}
          {activeTab === 'my-orders' && (
            <div className="bg-[#121226] border border-white/5 rounded-3xl p-6 space-y-6 shadow-xl animate-fade-in text-xs">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-base font-bold font-sora text-white">{currentLanguage === 'TR' ? 'Harcamalarınız & Sipariş Takip Pipeline' : 'Historical Order Submissions'}</h3>
                  <p className="text-xs text-gray-500 mt-1">{currentLanguage === 'TR' ? 'Siparişinize tıklayarak anlık işlem loglarını takip edebilirsiniz.' : 'Click any order to view live processing logs in realtime.'}</p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={currentLanguage === 'TR' ? 'Sipariş kimliği veya platform ara...' : 'Search specific identifier...'}
                    className="w-full bg-[#0d0d1c] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400"
                    value={ordersSearch}
                    onChange={(e) => setOrdersSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Dynamic instruction badge */}
              <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-2xl flex items-center gap-2.5 text-cyan-400">
                <Terminal className="w-4 h-4 shrink-0" />
                <span className="font-bold">{currentLanguage === 'TR' ? '💡 İPUCU: Gönderim aşamalarını, tünelleri ve API komutlarını görmek için sipariş satırına dokunun!' : '💡 TIP: Expand any order to observe live SSL provisioning codes!'}</span>
              </div>

              {/* Pipeline Grid sheet */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/3 border-b border-white/5 text-gray-500 font-bold uppercase tracking-wider text-[9px]">
                      <th className="py-3 px-4">OrderID</th>
                      <th className="py-3 px-4">{currentLanguage === 'TR' ? 'Hizmet Paket Bilgisi' : 'Requested Packet'}</th>
                      <th className="py-3 px-4">{currentLanguage === 'TR' ? 'Adet' : 'Qty'}</th>
                      <th className="py-3 px-4">{currentLanguage === 'TR' ? 'Tutar' : 'Cost'}</th>
                      <th className="py-3 px-4 text-center">{currentLanguage === 'TR' ? 'Süreç Durumu' : 'API Node Status'}</th>
                      <th className="py-3 px-4 text-center">{currentLanguage === 'TR' ? 'Loglar' : 'Live Data'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300 font-medium">
                    {filteredClientOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-500 italic">
                          {currentLanguage === 'TR' ? 'Aranan ölçütlerde bulunamadı.' : 'No filtered client orders detected.'}
                        </td>
                      </tr>
                    ) : (
                      filteredClientOrders.map(ord => {
                        const isExpanded = expandedOrderId === ord.id;
                        return (
                          <React.Fragment key={ord.id}>
                            <tr 
                              onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                              className="hover:bg-white/2 cursor-pointer transition-colors"
                            >
                              <td className="py-3.5 px-4 font-mono text-cyan-400 font-bold">{ord.id}</td>
                              <td className="py-3.5 px-4">
                                <span className="text-white font-bold block">{ord.serviceName}</span>
                                <span className="text-[10px] text-gray-500 font-mono block mt-0.5 uppercase tracking-wide">{ord.platform} • {ord.username}</span>
                              </td>
                              <td className="py-3.5 px-4 font-mono">{ord.quantity}</td>
                              <td className="py-3.5 px-4 font-mono text-cyan-400">₺{ord.charge.toFixed(2)}</td>
                              <td className="py-3.5 px-4 text-center">
                                <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase ${
                                  ord.status === 'Tamamlandı' ? 'bg-emerald-950/45 text-emerald-400 border border-emerald-500/15' :
                                  ord.status === 'İşlemde' ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/15 animate-pulse' :
                                  ord.status === 'İptal' ? 'bg-rose-950/40 text-rose-400 border border-rose-500/15' :
                                  'bg-yellow-950/40 text-yellow-500 border border-yellow-500/15'
                                }`}>
                                  {ord.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="inline-flex items-center gap-1 text-gray-500 hover:text-white transition">
                                  <span className="font-mono text-[9px] font-bold">{ord.logs.length} Log</span>
                                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </div>
                              </td>
                            </tr>

                            {/* Expanded logs subblock */}
                            {isExpanded && (
                              <tr className="bg-white/[1.5] border-t-0">
                                <td colSpan={6} className="p-4 bg-[#0d0d1e]/80 border border-white/5">
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                      <span className="text-gray-400 font-bold block px-2 uppercase text-[9.5px] tracking-wider flex items-center gap-1">
                                        <Terminal className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                                        <span>Canlı API Provizyon Logları (Wholesale Router Protocols)</span>
                                      </span>
                                      <span className="text-[9.5px] font-mono text-cyan-400 pl-2">SSL AES-256 Connected</span>
                                    </div>

                                    {/* Simulated chronological terminal output */}
                                    <div className="bg-[#05050f] rounded-xl p-3.5 font-mono text-[9.5px] text-gray-300 space-y-2 border border-white/5 max-h-48 overflow-y-auto shadow-inner">
                                      {ord.logs.map((lg, idx) => (
                                        <div key={idx} className="flex gap-2.5 items-start">
                                          <span className="text-cyan-500/70 shrink-0 font-semibold">[{lg.time}]</span>
                                          <span className="text-gray-505 shrink-0 font-bold">&gt;&gt;</span>
                                          <p className="text-gray-200 break-words leading-relaxed">{lg.text}</p>
                                        </div>
                                      ))}
                                      {ord.status === 'İşlemde' && (
                                        <div className="flex gap-2.5 items-center text-cyan-400/90 animate-pulse italic">
                                          <span className="text-cyan-500/70 shrink-0">[{new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}]</span>
                                          <span>&gt;&gt;</span>
                                          <span className="flex items-center gap-1.5 font-bold">
                                            <RefreshCw className="w-3 h-3 animate-spin" />
                                            <span>İşleme alındı, sonuçlar otomatik olarak güncellenir...</span>
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Order detail data parameters */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[10.5px]">
                                      <div className="bg-white/2 p-2.5 rounded-xl border border-white/5">
                                        <span className="text-gray-500 block">Profil Bağlantısı:</span>
                                        <a href={ord.link} target="_blank" rel="noreferrer" className="text-cyan-400 font-bold hover:underline truncate block mt-0.5">{ord.link}</a>
                                      </div>
                                      <div className="bg-white/2 p-2.5 rounded-xl border border-white/5">
                                        <span className="text-gray-500 block">Sipariş Oluşturulma:</span>
                                        <span className="text-gray-300 font-bold block mt-0.5">{ord.date}</span>
                                      </div>
                                      <div className="bg-[#090918] p-2.5 rounded-xl border border-white/5">
                                        <span className="text-gray-400 block font-bold text-[9px] uppercase tracking-wide">Yönetici Müdahalesi Gerekmez:</span>
                                        <span className="text-emerald-400 font-bold block mt-1">✓ Tam Otomatik İptal & İade Desteklemesi</span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 4: Deposit Funds Portal with mock historical records */}
          {activeTab === 'add-funds' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in text-xs">
              
              {/* Payment details panel */}
              <div className="md:col-span-7 bg-[#121226] border border-white/5 rounded-3xl p-6 space-y-5 shadow-xl">
                <div className="border-b border-white/5 pb-4">
                  <h3 className="text-base font-bold font-sora text-white">{currentLanguage === 'TR' ? 'Komisyonsuz Güvenli Bakiye Yükle' : 'Fund My Account'}</h3>
                  <p className="text-xs text-gray-500 mt-1">{currentLanguage === 'TR' ? 'Kredi kartı veya EFT havale yaparak anında 7/24 otomatik bakiye ekleyin.' : 'Top up your primary balance with PayTR security.'}</p>
                </div>

                <form onSubmit={handleDepositSubmit} className="space-y-4">
                  
                  {/* Select Payment gateway */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{currentLanguage === 'TR' ? 'Ödeme Yöntemi Seç' : 'Deposit Method'}</label>
                    <div className="grid grid-cols-1 gap-2">
                      {paymentMethods.map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedPaymentMethodId(m.id)}
                          className={`p-3.5 rounded-2xl flex items-center justify-between font-bold border text-left transition cursor-pointer ${
                            selectedPaymentMethodId === m.id 
                              ? 'bg-cyan-950/40 border-cyan-400 text-white' 
                              : 'bg-white/2 border-white/5 text-gray-400 hover:text-white'
                          }`}
                        >
                          <div>
                            <span className="block font-extrabold text-sm text-slate-100">{m.name}</span>
                            <span className="text-[10px] text-gray-500 font-bold block uppercase mt-0.5">
                              {m.commission > 0 ? `KOMİSYON: %${m.commission} • ` : ''}MİN: {m.minAmount} ₺
                            </span>
                          </div>
                          <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 ${selectedPaymentMethodId === m.id ? 'border-cyan-400' : 'border-gray-700'}`}>
                            {selectedPaymentMethodId === m.id && <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />}
                          </div>
                        </button>
                      ))}
                    </div>
                    {/* Payment instructions box — shown when method has instructions */}
                    {(() => {
                      const selMethod = paymentMethods.find(m => m.id === selectedPaymentMethodId);
                      return selMethod?.instructions ? (
                        <div className="mt-2 p-4 bg-cyan-950/25 border border-cyan-500/20 rounded-2xl space-y-1.5">
                          <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">{currentLanguage === 'TR' ? '📋 Ödeme Bilgileri' : '📋 Payment Details'}</p>
                          <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">{selMethod.instructions}</pre>
                        </div>
                      ) : null;
                    })()}
                  </div>

                  {/* Amount to input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{currentLanguage === 'TR' ? 'Yüklenecek Tutar (TL)' : 'Deposit Value (TRY)'}</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-cyan-400">₺</span>
                      <input
                        id="client-deposit-amount"
                        type="number"
                        required
                        className="w-full bg-[#0d0d1c] border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="150"
                      />
                    </div>
                  </div>

                  <button
                    id="client-deposit-submit-btn"
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-purple-600 text-white hover:text-black font-extrabold rounded-xl shadow-lg hover:shadow-cyan-400/20 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <BanknoteIcon className="w-4 h-4 text-slate-100" />
                    <span>{currentLanguage === 'TR' ? 'Ödeme Talebi Oluştur' : 'Create Payment Request'}</span>
                  </button>

                </form>

                {/* Shopier instant payment separator */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">veya anlık öde</span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>

                {/* Shopier instant pay button */}
                <button
                  type="button"
                  onClick={handleShopierPay}
                  disabled={shopierLoading}
                  className="w-full py-3.5 bg-[#FF6000] hover:bg-[#e55500] disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold rounded-xl shadow-lg hover:shadow-orange-500/20 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  {shopierLoading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      <span>{currentLanguage === 'TR' ? 'Shopier\'e Yönlendiriliyor...' : 'Redirecting to Shopier...'}</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                      </svg>
                      <span>{currentLanguage === 'TR' ? 'Shopier ile Kredi Kartıyla Öde' : 'Pay Instantly with Shopier'}</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-gray-600 text-center">
                  {currentLanguage === 'TR'
                    ? '🔒 Shopier güvenli ödeme altyapısı • Kredi/Banka Kartı • Anlık bakiye yükleme'
                    : '🔒 Secure Shopier payment • Credit/Debit Card • Instant balance top-up'}
                </p>
              </div>

              {/* Deposit transactions logger */}
              <div className="md:col-span-5 bg-[#121226]/50 border border-white/5 rounded-3xl p-5 space-y-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-white/5 pb-2">
                  {currentLanguage === 'TR' ? 'CÜZDAN YÜKLEME GEÇMİŞİ' : 'DEPOSIT REQUESTS LOGS'}
                </span>

                <div className="space-y-2 max-h-[380px] overflow-y-auto">
                  {clientPayments.length === 0 ? (
                    <p className="text-gray-600 italic py-8 text-center">{currentLanguage === 'TR' ? 'Henüz hiçbir yükleme bildirilmedi.' : 'No historic top-ups logged.'}</p>
                  ) : (
                    clientPayments.map(pay => (
                      <div key={pay.id} className="p-3 bg-white/2 rounded-2xl flex items-center justify-between border border-white/5">
                        <div className="space-y-1">
                          <span className="font-extrabold text-white block">₺{pay.amount.toFixed(2)}</span>
                          <span className="text-[10px] text-gray-500 font-semibold block">{pay.method} • {pay.date}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                          pay.status === 'Onaylandı' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/10' :
                          pay.status === 'Reddedildi' ? 'bg-rose-950/40 text-rose-400 border border-rose-500/10' :
                          'bg-yellow-950/40 text-yellow-500 border border-yellow-500/10 animate-pulse'
                        }`}>
                          {pay.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4 p-3 bg-blue-950/20 border border-blue-500/15 rounded-2xl text-[10px] text-blue-300 leading-relaxed">
                  {currentLanguage === 'TR' 
                    ? '📌 Ödeme yaptıktan sonra talebin durumu "Beklemede" olarak gözükür. Admin onayladığında bakiyeniz otomatik yüklenecektir.'
                    : '📌 After you send the payment, your request appears as "Pending". Balance is added once the admin approves it.'}
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: Support Desk chat */}
          {activeTab === 'tickets' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in text-xs">
              
              {activeTicketId && activeTicketObj ? (
                <div className="md:col-span-12 bg-[#121226] border border-white/5 rounded-3xl p-5 md:p-6 space-y-4 shadow-xl">
                  
                  {/* Chat ticket header */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="space-y-1">
                      <button
                        onClick={() => setActiveTicketId(null)}
                        className="text-cyan-400 hover:underline font-extrabold text-[10px] cursor-pointer"
                      >
                        ← {currentLanguage === 'TR' ? 'Taleplerime Dön' : 'Back to Ticket Lists'}
                      </button>
                      <h4 className="text-sm font-bold text-white font-sora mt-1">#{activeTicketObj.id} • {activeTicketObj.subject}</h4>
                    </div>
                    <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase ${
                      activeTicketObj.status === 'Cevaplandı' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/10 animate-pulse' : 'bg-yellow-950 text-yellow-400 border border-yellow-500/10'
                    }`}>
                      {activeTicketObj.status}
                    </span>
                  </div>

                  {/* Messaging chat flow */}
                  <div className="space-y-3.5 max-h-72 overflow-y-auto p-4 bg-[#0d0d1c] border border-white/5 rounded-2xl">
                    {activeTicketObj.messages.map((msg, i) => {
                      const isAdmin = msg.sender === 'admin';
                      return (
                        <div key={i} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                            isAdmin 
                              ? 'bg-[#19193d] text-[#eeeeff] border border-indigo-500/15 rounded-tl-none' 
                              : 'bg-cyan-950/20 text-[#eeeeff] border border-cyan-500/15 rounded-tr-none'
                          }`}>
                            <span className="font-extrabold text-[9.5px] block text-cyan-400 uppercase tracking-widest leading-none mb-2">{msg.senderName}</span>
                            <p className="text-xs font-medium leading-relaxed">{msg.message}</p>
                            <span className="text-[8.5px] text-gray-500 block text-right mt-2 font-mono">{msg.time}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Live chat reply inputs */}
                  <form onSubmit={handleSendTicketReply} className="flex gap-2.5">
                    <input
                      type="text"
                      className="flex-1 bg-[#0d0d1c] border border-white/10 rounded-xl py-3 px-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 transition"
                      placeholder={currentLanguage === 'TR' ? 'Teknik destek birimi için mesaj yazın...' : 'Type feedback...'}
                      value={ticketReplyText}
                      onChange={(e) => setTicketReplyText(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="px-5 bg-cyan-400 hover:bg-cyan-505 text-black font-black rounded-xl active:scale-95 transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Send className="w-4 h-4" />
                      <span>{currentLanguage === 'TR' ? 'Gönder' : 'Send'}</span>
                    </button>
                  </form>

                </div>
              ) : (
                <>
                  {/* Start ticket support */}
                  <div className="md:col-span-5 bg-[#121226] border border-white/5 rounded-3xl p-5 space-y-4 shadow-xl">
                    <div className="border-b border-white/5 pb-2">
                      <h4 className="text-xs font-bold font-sora text-white uppercase tracking-wider">{currentLanguage === 'TR' ? 'Yeni Destek Talebi Aç' : 'Open Ticket'}</h4>
                      <p className="text-[10px] text-gray-500">{currentLanguage === 'TR' ? 'Teknik birimimiz talepleri ortalama 15-20 saniyede cevaplar!' : 'Responses resolve in under minutes.'}</p>
                    </div>

                    <form onSubmit={handleTicketSubmit} className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{currentLanguage === 'TR' ? 'Talep Başlığı konusu' : 'Ticket Subject'}</label>
                        <input
                          id="client-ticket-subject"
                          type="text"
                          required
                          placeholder="örn: Sipariş #10593 gönderilmedi"
                          className="w-full bg-[#0d0d1c] border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-cyan-400"
                          value={ticketSubject}
                          onChange={(e) => setTicketSubject(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{currentLanguage === 'TR' ? 'Öncelik Seviyesi' : 'Priority Rank'}</label>
                        <select
                          id="client-ticket-priority"
                          className="w-full bg-[#0d0d1c] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                          value={ticketPriority}
                          onChange={(e) => setTicketPriority(e.target.value as any)}
                        >
                          <option value="Düşük">{currentLanguage === 'TR' ? 'Düşük Öncelikli' : 'Low'}</option>
                          <option value="Orta">{currentLanguage === 'TR' ? 'Orta Öncelikli (Normal)' : 'Medium'}</option>
                          <option value="Yüksek">{currentLanguage === 'TR' ? 'Yüksek Öncelikli (Acil)' : 'High / Urgent'}</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-550 uppercase tracking-wider">{currentLanguage === 'TR' ? 'Mesaj Detayları' : 'Specific Message'}</label>
                        <textarea
                          id="client-ticket-message"
                          required
                          className="w-full bg-[#0d0d1c] border border-white/10 rounded-xl py-2 px-3 text-white h-24 focus:outline-none focus:border-cyan-400"
                          placeholder={currentLanguage === 'TR' ? 'İlettiğiniz problem veya talebin detaylarını belirtin...' : 'Elaborate issues...'}
                          value={ticketMessage}
                          onChange={(e) => setTicketMessage(e.target.value)}
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-cyan-400 to-[#7B2FFF] text-white font-extrabold rounded-xl active:scale-95 transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{currentLanguage === 'TR' ? 'Destek Talebini İlet' : 'Dispatch Ticket'}</span>
                      </button>

                    </form>
                  </div>

                  {/* Right side list logs */}
                  <div className="md:col-span-7 bg-[#121226]/50 border border-white/5 rounded-3xl p-5 space-y-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block border-b border-white/5 pb-2">
                      {currentLanguage === 'TR' ? 'AKTİF & GEÇMİŞ GÖRÜŞMELERİNİZ' : 'CORRESPONDENCE DEPOSITORIES'}
                    </span>

                    <div className="space-y-2 max-h-[350px] overflow-y-auto">
                      {clientTickets.length === 0 ? (
                        <p className="text-gray-600 italic py-8 text-center">{currentLanguage === 'TR' ? 'Açılmış hiçbir destek bildiriminiz yok.' : 'No available support logs.'}</p>
                      ) : (
                        clientTickets.map(tick => (
                          <button
                            key={tick.id}
                            onClick={() => setActiveTicketId(tick.id)}
                            className="w-full p-4 bg-white/2 hover:bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between text-left transition cursor-pointer"
                          >
                            <div className="space-y-1 pr-3 truncate">
                              <span className="text-[10px] font-bold text-cyan-400 font-mono block">#{tick.id} • {tick.date}</span>
                              <span className="font-extrabold text-white block truncate text-xs">{tick.subject}</span>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded text-[8px] font-extrabold uppercase shrink-0 ${
                              tick.status === 'Cevaplandı' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/10' :
                              tick.status === 'Açık' ? 'bg-yellow-950/40 text-yellow-500 border border-yellow-500/10' :
                              'bg-gray-800 text-gray-400'
                            }`}>
                              {tick.status}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}

            </div>
          )}

          {/* TAB 6: API Reselling console credentials and interactive simulator */}
          {activeTab === 'api-docs' && (
            <div className="space-y-6 text-xs animate-fade-in">
              
              <div className="bg-[#121226] border border-white/5 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="border-b border-white/5 pb-4">
                  <h3 className="text-base font-bold font-sora text-white">{currentLanguage === 'TR' ? 'Bayi Ortaklar & Developer API Belgesi' : 'Developer Connection API Gateway'}</h3>
                  <p className="text-xs text-gray-500 mt-1">{currentLanguage === 'TR' ? 'Kendi SMM bayilik sitelerinizi / yazılımlarınızı saniyeler içinde portalımıza bağlayın.' : 'Connect custom scripts to dispatch balance payloads'}</p>
                </div>

                {/* API Console specifications */}
                <div className="p-4 bg-[#0d0d1c] border border-white/10 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{currentLanguage === 'TR' ? 'SİZE ÖZEL AKTİF API ANAHTARI' : 'INDIVIDUAL LIVE TOKEN KEY'}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono font-bold text-[8.5px] uppercase tracking-wider">★ STABLE KEY</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="text"
                      readOnly
                      className="flex-1 bg-[#121226] border border-white/10 text-cyan-300 font-mono p-2.5 rounded-xl outline-none"
                      value={`smm_pro_partner_key_${currentClientUser.fullName.toLowerCase().replace(/\s/g, '_')}_7b2ffa9`}
                    />
                    <button
                      onClick={() => showToast(currentLanguage === 'TR' ? 'API Token Anahtarı güvenle kopyalandı!' : 'Credentials copied to clipboard.', 'success')}
                      className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-505 text-black font-extrabold rounded-xl transition"
                    >
                      {currentLanguage === 'TR' ? 'Kopyala' : 'Copy Key'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Developer Live Simulator Playground */}
              <div className="bg-[#121226] border border-white/5 rounded-3xl p-6 space-y-5 shadow-xl">
                
                <div className="border-b border-white/5 pb-3">
                  <h4 className="text-sm font-bold font-sora text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span>{currentLanguage === 'TR' ? 'İnteraktif API Playground & Canlı Test Terminali' : 'Interactive Playground & Live Testing Console'}</span>
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">{currentLanguage === 'TR' ? 'API kodunuzun veya yazılımınızın portalımıza nasıl istek atacağını ve dönecek yanıtları tarayıcıda simüle edin!' : 'Verify JSON packets syntax directly in client layout.'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Simulator configuration */}
                  <div className="md:col-span-5 bg-[#0a0a1f] p-4 border border-white/5 rounded-2xl space-y-4">
                    <span className="text-[9.5px] font-bold text-cyan-400 uppercase tracking-widest block">{currentLanguage === 'TR' ? '1. İSTEK PARAMETRELERİ' : '1. CONTEXT ARGS'}</span>
                    
                    <div className="space-y-4">
                      
                      {/* Select Method */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-500 block uppercase font-bold">{currentLanguage === 'TR' ? 'Seçilecek API Metodu' : 'Execute API Method'}</label>
                        <select
                          className="w-full bg-[#121226] border border-white/10 rounded-xl py-2 px-3 text-[11px] text-white focus:outline-none"
                          value={apiPlaygroundMethod}
                          onChange={(e: any) => setApiPlaygroundMethod(e.target.value)}
                        >
                          <option value="add_order">{currentLanguage === 'TR' ? 'add_order (Yeni Sipariş)' : 'add_order (New Order)'}</option>
                          <option value="status">{currentLanguage === 'TR' ? 'status (Sipariş Sorgu)' : 'status (Fetch Status)'}</option>
                          <option value="balance">{currentLanguage === 'TR' ? 'balance (Bakiye Sorgu)' : 'balance (Account Details)'}</option>
                        </select>
                      </div>

                      {apiPlaygroundMethod === 'add_order' && (
                        <>
                          {/* Pick Service */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-gray-500 block uppercase font-bold">{currentLanguage === 'TR' ? 'Portföy Servis ID' : 'Target Service ID'}</label>
                            <select
                              className="w-full bg-[#121226] border border-white/10 rounded-xl py-2 px-3 text-[11px] text-white focus:outline-none"
                              value={apiPlaygroundServiceId}
                              onChange={(e) => setApiPlaygroundServiceId(e.target.value)}
                            >
                              {services.map(s => (
                                <option key={s.id} value={s.id}>#{s.id} - {s.name.substring(0, 25)}...</option>
                              ))}
                            </select>
                          </div>

                          {/* Link payload */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-gray-500 block uppercase font-bold">{currentLanguage === 'TR' ? 'Gönderi Linki (URL)' : 'Link Context'}</label>
                            <input
                              type="text"
                              className="w-full bg-[#121226] border border-white/10 rounded-xl py-2 px-3 text-[11px] text-white font-mono"
                              value={apiPlaygroundOrderLink}
                              onChange={(e) => setApiPlaygroundOrderLink(e.target.value)}
                            />
                          </div>

                          {/* Qty payload */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-gray-500 block uppercase font-bold">{currentLanguage === 'TR' ? 'Arzulanan Miktar' : 'Scale Scope'}</label>
                            <input
                              type="number"
                              className="w-full bg-[#121226] border border-white/10 rounded-xl py-2 px-3 text-[11px] text-white font-mono"
                              value={apiPlaygroundQuantity}
                              onChange={(e) => setApiPlaygroundQuantity(parseInt(e.target.value) || 1200)}
                            />
                          </div>
                        </>
                      )}

                      {apiPlaygroundMethod === 'status' && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-gray-500 block uppercase font-bold">{currentLanguage === 'TR' ? 'Sorgulanacak SiparişID' : 'SMM Order Item ID'}</label>
                          <select
                            className="w-full bg-[#121226] border border-white/10 rounded-xl py-2 px-3 text-[11px] text-white focus:outline-none font-mono"
                            value={apiPlaygroundOrderId}
                            onChange={(e) => setApiPlaygroundOrderId(e.target.value)}
                          >
                            {clientOrders.length === 0 ? (
                              <option value="ORD-92812">ORD-92812 (Sanal Mock)</option>
                            ) : (
                              clientOrders.map(o => (
                                <option key={o.id} value={o.id}>{o.id} - {o.serviceName.substring(0, 15)}...</option>
                              ))
                            )}
                          </select>
                        </div>
                      )}

                    </div>

                    <button
                      onClick={executeSimulatedApi}
                      disabled={apiResponseLoading}
                      className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-purple-600 font-extrabold text-[#090915] text-center rounded-xl hover:text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-black hover:fill-white shrink-0" />
                      <span>{currentLanguage === 'TR' ? 'İSTEĞİ SİMÜLE ET' : 'SEND SIMULATE PACKET'}</span>
                    </button>
                  </div>

                  {/* Terminal stdout output printout */}
                  <div className="md:col-span-7 bg-[#050512] border border-white/5 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-[9.5px] font-bold text-gray-500 uppercase tracking-widest block font-mono">{currentLanguage === 'TR' ? '2. GÖNDERİLEN payload & YANIT' : '2. API RESPONSE OUT'}</span>
                        <div className="flex gap-1.5">
                          <span className="w-2.5 h-1.5 rounded-full bg-rose-500" />
                          <span className="w-2.5 h-1.5 rounded-full bg-yellow-500" />
                          <span className="w-2.5 h-1.5 rounded-full bg-emerald-500" />
                        </div>
                      </div>

                      {/* Request JSON block */}
                      <div className="p-2.5 bg-[#09091b] rounded-lg border border-white/5 font-mono text-[9px] text-gray-400">
                        <span className="text-gray-600 block pl-1 italic font-bold mb-1">// POST Request Header & BodyPayload:</span>
                        <p>{`POST https://api.smmpro.com.tr/v2/action HTTP/1.1`}</p>
                        <p className="mt-1 font-bold text-cyan-400">{`{`}</p>
                        <p className="pl-4">"api_key": <span className="text-emerald-400">"smm_pro_partner_key_...7b2ffa9"</span>,</p>
                        <p className="pl-4">"action": <span className="text-teal-400">"{apiPlaygroundMethod}"</span></p>
                        {apiPlaygroundMethod === 'add_order' && (
                          <>
                            <p className="pl-4">,"service": <span className="text-yellow-400">{apiPlaygroundServiceId}</span></p>
                            <p className="pl-4">,"link": <span className="text-teal-400">"{apiPlaygroundOrderLink}"</span></p>
                            <p className="pl-4">,"quantity": <span className="text-yellow-400">{apiPlaygroundQuantity}</span></p>
                          </>
                        )}
                        {apiPlaygroundMethod === 'status' && (
                          <p className="pl-4">,"order": <span className="text-teal-400">"{apiPlaygroundOrderId}"</span></p>
                        )}
                        <p className="font-bold text-cyan-400">{`}`}</p>
                      </div>
                    </div>

                    {/* Standard simulated response results */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono text-gray-500 block uppercase font-bold tracking-wider">// Simulated Server Response Pipeline:</span>
                      
                      <div className="bg-[#03030c] rounded-lg p-3 border border-white/5 font-mono text-[9px] text-gray-300 min-h-32 flex flex-col justify-center">
                        {apiResponseLoading ? (
                          <div className="flex flex-col items-center justify-center space-y-2 py-4">
                            <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
                            <span className="text-cyan-400 text-[10px] tracking-widest uppercase font-bold animate-pulse">Requesting node...</span>
                          </div>
                        ) : apiPlaygroundResponse ? (
                          <pre className="text-teal-400 leading-relaxed font-bold">
                            {JSON.stringify(apiPlaygroundResponse, null, 2)}
                          </pre>
                        ) : (
                          <p className="text-gray-600 italic text-center text-[10px]">
                            {currentLanguage === 'TR' ? 'Yayımlanan veriler için soldaki butona basın.' : 'Click "SEND SIMULATE PACKET" to fire JSON response.'}
                          </p>
                        )}
                      </div>
                    </div>

                  </div>

                </div>

              </div>

              {/* Whitelist Security section */}
              <div className="bg-[#121226] border border-white/5 rounded-3xl p-6 space-y-4 shadow-xl">
                
                <div className="border-b border-white/5 pb-3">
                  <h4 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5 pl-0.5">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span>{currentLanguage === 'TR' ? 'API Güvenlik & Whitelisted IP Yapılandırması' : 'API Node IP Security Access Controls'}</span>
                  </h4>
                  <p className="text-xs text-slate-400">{currentLanguage === 'TR' ? 'API anahtarınızın güvenliğini artırmak için sadece belirlediğiniz sunucu IP adreslerine erişim izni tanımlayın.' : 'Restrict incoming calls exclusively to whitelisted server nodes.'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-8 space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{currentLanguage === 'TR' ? 'Yetkilendirilmiş Sunucu IP Adresleri (Virgülle Ayırın)' : 'Whitelisted IP Targets'}</label>
                    <input
                      type="text"
                      className="w-full bg-[#0d0d1c] border border-white/10 rounded-xl py-2.5 px-3 text-cyan-300 font-mono"
                      value={apiIpWhitelist}
                      onChange={(e) => setApiIpWhitelist(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-4 flex items-end">
                    <button
                      onClick={() => showToast(currentLanguage === 'TR' ? 'IP Whitelist başarıyla kaydedildi!' : 'IP Whitelist updated successfully.', 'success')}
                      className="w-full py-2.5 bg-purple-950/40 border border-purple-800/45 text-purple-400 hover:text-white font-extrabold rounded-xl transition cursor-pointer"
                    >
                      {currentLanguage === 'TR' ? 'Birimleri Kaydet' : 'Save Whitelist'}
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 7: Notifications inbox */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 text-xs animate-fade-in">

              <div className="bg-[#121226] border border-white/5 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <div>
                    <h3 className="text-base font-bold font-sora text-white flex items-center gap-2">
                      <Bell className="w-4.5 h-4.5 text-purple-400" />
                      <span>{currentLanguage === 'TR' ? 'Sistem Bildirimleri' : 'System Notifications'}</span>
                      {unreadNotifCount > 0 && (
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-bold rounded-full">
                          {unreadNotifCount} {currentLanguage === 'TR' ? 'okunmadı' : 'unread'}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {currentLanguage === 'TR' ? 'Yönetim ekibinden gelen önemli duyurular ve bildirimler.' : 'Important announcements and messages from the admin team.'}
                    </p>
                  </div>
                  {unreadNotifCount > 0 && (
                    <button
                      onClick={() => markUserNotificationsRead(currentClientUser!.id)}
                      className="px-3.5 py-2 bg-purple-950/40 border border-purple-700/30 text-purple-300 hover:text-white font-bold rounded-xl transition text-[10px] cursor-pointer"
                    >
                      {currentLanguage === 'TR' ? '✓ Tümünü Okundu İşaretle' : '✓ Mark All Read'}
                    </button>
                  )}
                </div>

                {(currentClientUser?.notifications ?? []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-white/4 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-gray-600" />
                    </div>
                    <p className="text-gray-500 font-medium">
                      {currentLanguage === 'TR' ? 'Henüz bir bildiriminiz bulunmuyor.' : 'No notifications yet.'}
                    </p>
                    <p className="text-gray-600 text-[10px]">
                      {currentLanguage === 'TR' ? 'Yönetimden gelen duyurular burada görünecek.' : 'Announcements from the admin team will appear here.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {(currentClientUser?.notifications ?? []).map((notif) => (
                      <div
                        key={notif.id}
                        className={`flex gap-3.5 p-4 rounded-2xl border transition-all ${
                          notif.read
                            ? 'bg-white/2 border-white/5'
                            : 'bg-purple-950/20 border-purple-700/25'
                        }`}
                      >
                        <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5 ${
                          notif.read ? 'bg-white/5' : 'bg-purple-500/20'
                        }`}>
                          <Bell className={`w-3.5 h-3.5 ${notif.read ? 'text-gray-500' : 'text-purple-400'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${notif.read ? 'text-gray-500' : 'text-purple-400'}`}>
                              {currentLanguage === 'TR' ? 'Yönetim Bildirimi' : 'Admin Notification'}
                            </span>
                            <span className="text-[10px] text-gray-600 shrink-0 font-mono">{notif.date}</span>
                          </div>
                          <p className={`leading-relaxed ${notif.read ? 'text-gray-400' : 'text-gray-200'}`}>
                            {notif.text}
                          </p>
                        </div>
                        {!notif.read && (
                          <div className="shrink-0 w-2 h-2 rounded-full bg-purple-400 mt-1.5" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

    </div>

    {/* DEPOSIT CONFIRMATION MODAL */}
    
    {depositConfirm && (
      <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#121226] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          
          <div className="p-5 bg-[#171734] border-b border-white/10 flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />
              <span>{currentLanguage === 'TR' ? 'Ödeme Talebi Oluşturuldu' : 'Payment Request Created'}</span>
            </h4>
            <button onClick={() => setDepositConfirm(null)} className="p-1 hover:bg-white/5 rounded text-gray-500 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4 text-sm">

            {/* Amount summary */}
            <div className="flex items-center justify-between p-4 bg-emerald-950/30 border border-emerald-500/20 rounded-2xl">
              <div>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                  {currentLanguage === 'TR' ? 'Yatırılacak Tutar' : 'Amount to Deposit'}
                </p>
                <p className="text-2xl font-black text-white font-mono">₺{depositConfirm.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  {currentLanguage === 'TR' ? 'Yöntem' : 'Method'}
                </p>
                <p className="font-bold text-cyan-400">{depositConfirm.methodName}</p>
              </div>
            </div>

            {/* Payment instructions */}
            {depositConfirm.instructions ? (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ClipboardCheck className="w-3.5 h-3.5 text-cyan-400" />
                  {currentLanguage === 'TR' ? 'Ödeme Bilgileri — Buraya Gönderin' : 'Send Payment To'}
                </p>
                <div className="relative p-4 bg-[#0d0d1c] border border-cyan-500/20 rounded-2xl">
                  <pre className="text-sm text-gray-200 whitespace-pre-wrap font-sans leading-relaxed pr-8">{depositConfirm.instructions}</pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(depositConfirm.instructions);
                      setCopiedInstructions(true);
                      setTimeout(() => setCopiedInstructions(false), 2500);
                    }}
                    className="absolute top-3 right-3 p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition cursor-pointer"
                    title="Kopyala"
                  >
                    {copiedInstructions ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-yellow-950/20 border border-yellow-500/20 rounded-2xl text-yellow-300 text-xs leading-relaxed">
                {currentLanguage === 'TR'
                  ? '⚠️ Bu ödeme yöntemi için henüz hesap bilgisi tanımlanmamış. Lütfen destek ekibiyle iletişime geçin.'
                  : '⚠️ No account details set for this method yet. Please contact support.'}
              </div>
            )}

            {/* Instruction note */}
            <div className="p-3.5 bg-blue-950/20 border border-blue-500/15 rounded-2xl text-[11px] text-blue-300 leading-relaxed">
              {currentLanguage === 'TR'
                ? '📌 Yukarıdaki bilgilere tam tutarı (₺' + depositConfirm.amount.toFixed(2) + ') gönderin. Açıklama/not kısmına kullanıcı adınızı yazmayı unutmayın. Transfer sonrası ekibimiz bakiyenizi onaylayacaktır.'
                : '📌 Send exactly ₺' + depositConfirm.amount.toFixed(2) + ' to the account above. Include your username in the description. Our team will approve your balance after verifying the transfer.'}
            </div>

            {!depositConfirm.confirmed ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setDepositConfirm(null)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 font-bold text-gray-300 rounded-2xl active:scale-95 transition cursor-pointer hover:bg-white/10"
                >
                  {currentLanguage === 'TR' ? 'İptal' : 'Cancel'}
                </button>
                <button
                  onClick={() => {
                    submitClientPaymentRequest(depositConfirm.amount, depositConfirm.methodId);
                    setDepositConfirm(prev => prev ? { ...prev, confirmed: true } : null);
                    setDepositAmount('150');
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 font-bold text-white rounded-2xl active:scale-95 transition cursor-pointer"
                >
                  {currentLanguage === 'TR' ? '✓ Ödeme Talebini Oluştur' : '✓ Create Payment Request'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setDepositConfirm(null)}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 font-bold text-white rounded-2xl active:scale-95 transition cursor-pointer"
              >
                {currentLanguage === 'TR' ? '✓ Tamam, Anladım' : '✓ Got it, I\'ll transfer now'}
              </button>
            )}

          </div>
        </div>
      </div>
    )}

    </>
  );
};
