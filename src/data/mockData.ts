export interface Service {
  id: string;
  name: string;
  platform: 'Instagram' | 'TikTok' | 'YouTube' | 'Twitter' | 'Spotify' | 'Telegram';
  category: string;
  min: number;
  max: number;
  pricePer1000: number;
  status: 'active' | 'passive';
  sortOrder: number;
  description: string;
}

export interface Order {
  id: string;
  username: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  platform: string;
  quantity: number;
  charge: number;
  status: 'Bekliyor' | 'İşlemde' | 'Tamamlandı' | 'İptal';
  date: string;
  link: string;
  logs: { time: string; text: string }[];
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  balance: number;
  totalOrders: number;
  joinedDate: string;
  status: 'active' | 'suspended';
  note?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  status: boolean;
  commission: number;
  minAmount: number;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  method: string;
  status: 'Beklemede' | 'Onaylandı' | 'Reddedildi';
  date: string;
  transactionId?: string;
}

export interface TicketMessage {
  id: string;
  sender: 'user' | 'admin';
  senderName: string;
  message: string;
  time: string;
}

export interface Ticket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  priority: 'Düşük' | 'Orta' | 'Yüksek';
  status: 'Açık' | 'Cevaplandı' | 'Kapalı';
  date: string;
  messages: TicketMessage[];
}

export interface ApiProvider {
  id: string;
  name: string;
  url: string;
  key: string;
  status: boolean;
  balance?: number;
}

export const PLATFORMS = [
  'Instagram',
  'TikTok',
  'YouTube',
  'Twitter',
  'Spotify',
  'Telegram'
] as const;

export const initialServices: Service[] = [
  {
    id: "101",
    name: "Instagram Gerçek Türk Takipçi - Organik / Aktif (Yüksek Kalite)",
    platform: "Instagram",
    category: "Takipçi",
    min: 100,
    max: 15000,
    pricePer1000: 42.50,
    status: "active",
    sortOrder: 1,
    description: "Tamamı aktif ve gerçek Türk kullanıcılardan oluşan organik takipçi paketidir. Düşüş riski oldukça azdır."
  },
  {
    id: "102",
    name: "Instagram Yabancı Bot Takipçi - Hızlı Gönderim [30 Gün Garantili]",
    platform: "Instagram",
    category: "Takipçi",
    min: 500,
    max: 100000,
    pricePer1000: 14.90,
    status: "active",
    sortOrder: 2,
    description: "Global profillerden oluşan, düşüş yaşanması halinde 30 gün boyunca telafi garantisi sunan uygun fiyatlı paket."
  },
  {
    id: "103",
    name: "Instagram Keşfet Etkili Gerçek Beğeni - Max 5k [Süper Hızlı]",
    platform: "Instagram",
    category: "Beğeni",
    min: 50,
    max: 5000,
    pricePer1000: 12.00,
    status: "active",
    sortOrder: 3,
    description: "Paylaşımlarınızı keşfete düşürmek için optimize edilmiş yüksek kaliteli Türk beğeniler. Anında gönderim başlar."
  },
  {
    id: "104",
    name: "TikTok Global Gerçek Takipçi [Max 50k - Karışık]",
    platform: "TikTok",
    category: "Takipçi",
    min: 100,
    max: 50000,
    pricePer1000: 55.00,
    status: "active",
    sortOrder: 4,
    description: "TikTok hesabınızın etkileşimini artıracak global, fotoğraflı ve aktif kullanıcı profilleri."
  },
  {
    id: "105",
    name: "TikTok Keşfet Etkili İzlenme + Paylaşım [Anlık Başlama]",
    platform: "TikTok",
    category: "İzlenme",
    min: 1000,
    max: 1000000,
    pricePer1000: 0.85,
    status: "active",
    sortOrder: 5,
    description: "Videolarınızın izlenmesini ve paylaşılma sayısını artırarak keşfete çıkış oranını katlar."
  },
  {
    id: "106",
    name: "YouTube Organik İzlenme Süresi (4000 Saat Odaklı) [Ömür Boyu Garanti]",
    platform: "YouTube",
    category: "İzlenme Süresi",
    min: 100,
    max: 10000,
    pricePer1000: 240.00,
    status: "active",
    sortOrder: 6,
    description: "Kanalınızın para kazanmasını açmak için ideal uzun süreli izlenme paketi. %100 organik trafik."
  },
  {
    id: "107",
    name: "YouTube Gerçek Abone [Düşmeyen Organik] - Günlük Max 200 Hız",
    platform: "YouTube",
    category: "Abone",
    min: 50,
    max: 5000,
    pricePer1000: 185.00,
    status: "active",
    sortOrder: 7,
    description: "Sıkı denetimlerden geçebilen, spama düşmeyen ve kalıcı organik YouTube aboneleridir."
  },
  {
    id: "108",
    name: "Twitter (X) Gerçek Türk Takipçi - Yüksek Etkileşimli En İyi Kalite",
    platform: "Twitter",
    category: "Takipçi",
    min: 100,
    max: 10000,
    pricePer1000: 120.00,
    status: "active",
    sortOrder: 8,
    description: "Twitter (X) platformunda gerçek Türk profillerin takip etmesini sağlar, organik görünüm katar."
  },
  {
    id: "109",
    name: "Twitter (X) Premium Beğeni + Retweet Paketi [NFT Profil Odaklı]",
    platform: "Twitter",
    category: "Etkileşim",
    min: 50,
    max: 2000,
    pricePer1000: 75.00,
    status: "active",
    sortOrder: 9,
    description: "Gönderilerinizi ön plana çıkaran yüksek kaliteli global beğeniler ve otomatik retweetler."
  },
  {
    id: "110",
    name: "Spotify Sanatçı / Çalma Listesi Takipçisi - Kesintisiz Akış",
    platform: "Spotify",
    category: "Takipçi",
    min: 100,
    max: 20000,
    pricePer1000: 18.00,
    status: "active",
    sortOrder: 10,
    description: "Spotify profilinizi veya çalma listenizi büyütmenize yardımcı olan güvenli takipçi servisi."
  },
  {
    id: "111",
    name: "Telegram Kanal / Grup Üyesi - Türk Gerçek Karışık [Düşüşsüz]",
    platform: "Telegram",
    category: "Üye",
    min: 50,
    max: 50000,
    pricePer1000: 25.00,
    status: "active",
    sortOrder: 11,
    description: "Telegram kanallarınıza veya gruplarınıza katılan, ses kısıtlaması olmayan organik üyeler."
  }
];

export const initialOrders: Order[] = [
  {
    id: "S-87910",
    username: "mehmet_can",
    userId: "U001",
    serviceId: "101",
    serviceName: "Instagram Gerçek Türk Takipçi - Organik / Aktif",
    platform: "Instagram",
    quantity: 1000,
    charge: 42.50,
    status: "Tamamlandı",
    date: "2026-06-03T18:30:00Z",
    link: "https://instagram.com/mehmet_can",
    logs: [
      { time: "18:30", text: "Sipariş oluşturuldu ve API kuyruğuna alındı." },
      { time: "18:32", text: "Sağlayıcı API bağlantısı kuruldu. Başlangıç sayımı: 1420" },
      { time: "18:45", text: "Gönderim tamamlandı. Bitiş sayımı: 2420." }
    ]
  },
  {
    id: "S-87911",
    username: "ezgisen",
    userId: "U002",
    serviceId: "103",
    serviceName: "Instagram Keşfet Etkili Gerçek Beğeni - Max 5k",
    platform: "Instagram",
    quantity: 1500,
    charge: 18.00,
    status: "İşlemde",
    date: "2026-06-03T21:10:00Z",
    link: "https://instagram.com/p/C_m24sOPd",
    logs: [
      { time: "21:10", text: "Sipariş oluşturuldu." },
      { time: "21:12", text: "Başlangıç beğenisi: 236. Gönderim aşamalı olarak başlatıldı." }
    ]
  },
  {
    id: "S-87912",
    username: "kerem_tas",
    userId: "U003",
    serviceId: "105",
    serviceName: "TikTok Keşfet Etkili İzlenme + Paylaşım",
    platform: "TikTok",
    quantity: 10000,
    charge: 8.50,
    status: "İşlemde",
    date: "2026-06-03T22:45:00Z",
    link: "https://tiktok.com/@kerem_tas/video/8276182",
    logs: [
      { time: "22:45", text: "Sipariş provizyon alındı." },
      { time: "22:47", text: "İzlenme gönderimi kuyruğa yüklendi." }
    ]
  },
  {
    id: "S-87913",
    username: "selin_avci",
    userId: "U004",
    serviceId: "111",
    serviceName: "Telegram Kanal / Grup Üyesi - Türk Gerçek Karışık",
    platform: "Telegram",
    quantity: 500,
    charge: 12.50,
    status: "Bekliyor",
    date: "2026-06-03T23:15:00Z",
    link: "https://t.me/kripto_sohbet_tr",
    logs: [
      { time: "23:15", text: "Sipariş oluşturuldu, admin onayı bekleniyor." }
    ]
  },
  {
    id: "S-87914",
    username: "ahmet_bursa",
    userId: "U005",
    serviceId: "107",
    serviceName: "YouTube Gerçek Abone [Düşmeyen Organik]",
    platform: "YouTube",
    quantity: 200,
    charge: 37.00,
    status: "İptal",
    date: "2026-06-02T10:15:00Z",
    link: "https://youtube.com/c/ahmetbursa_gaming",
    logs: [
      { time: "10:15", text: "Talep oluşturuldu." },
      { time: "10:30", text: "Hata: Kanal gizli modda olduğu için abone tespit edilemedi. Sipariş iptal edildi ve bakiye iade edildi." }
    ]
  },
  {
    id: "S-87915",
    username: "ayca_guzel",
    userId: "U006",
    serviceId: "108",
    serviceName: "Twitter (X) Gerçek Türk Takipçi - Yüksek Etkileşimli",
    platform: "Twitter",
    quantity: 1000,
    charge: 120.00,
    status: "Tamamlandı",
    date: "2026-06-02T15:20:00Z",
    link: "https://x.com/ayca_guzel",
    logs: [
      { time: "15:20", text: "Sipariş alındı." },
      { time: "15:22", text: "Başlangıç takipçisi: 852." },
      { time: "16:40", text: "Tamamlandı. Bitiş: 1855." }
    ]
  },
  {
    id: "S-87916",
    username: "mehmet_can",
    userId: "U001",
    serviceId: "103",
    serviceName: "Instagram Keşfet Etkili Gerçek Beğeni",
    platform: "Instagram",
    quantity: 500,
    charge: 6.00,
    status: "Tamamlandı",
    date: "2026-06-01T20:10:00Z",
    link: "https://instagram.com/p/Cs917H",
    logs: [
      { time: "20:10", text: "Sipariş girildi." },
      { time: "20:18", text: "Gönderim tamamlandı." }
    ]
  },
  {
    id: "S-87917",
    username: "gamer_pro",
    userId: "U007",
    serviceId: "105",
    serviceName: "TikTok Keşfet Etkili İzlenme + Paylaşım",
    platform: "TikTok",
    quantity: 50000,
    charge: 42.50,
    status: "Tamamlandı",
    date: "2026-06-01T11:00:00Z",
    link: "https://tiktok.com/@gamer_pro/video/92817",
    logs: [
      { time: "11:00", text: "Sipariş başlatıldı." },
      { time: "11:15", text: "50 bin izlenme tamamlandı." }
    ]
  },
  {
    id: "S-87918",
    username: "spotify_music",
    userId: "U008",
    serviceId: "110",
    serviceName: "Spotify Sanatçı / Çalma Listesi Takipçisi",
    platform: "Spotify",
    quantity: 2000,
    charge: 36.00,
    status: "Tamamlandı",
    date: "2026-05-31T09:40:00Z",
    link: "https://open.spotify.com/playlist/37i9dQZF1DXcBW",
    logs: [
      { time: "09:40", text: "Sipariş işleme alındı." },
      { time: "10:10", text: "Yükleme bitti ve kontrol edildi." }
    ]
  },
  {
    id: "S-87919",
    username: "ezgisen",
    userId: "U002",
    serviceId: "102",
    serviceName: "Instagram Yabancı Bot Takipçi",
    platform: "Instagram",
    quantity: 5000,
    charge: 74.50,
    status: "Tamamlandı",
    date: "2026-05-30T14:15:00Z",
    link: "https://instagram.com/ezgisen",
    logs: [
      { time: "14:15", text: "Sipariş girildi." },
      { time: "15:05", text: "5,000 takipçi başarıyla eklendi." }
    ]
  }
];

export const initialUsers: User[] = [
  {
    id: "U001",
    fullName: "Mehmet Can Öztürk",
    email: "mehmetcan@gmail.com",
    balance: 1450.50,
    totalOrders: 42,
    joinedDate: "2026-01-15",
    status: "active",
    note: "Sık sipariş veren VIP kullanıcı. Ödemeleri düzenli."
  },
  {
    id: "U002",
    fullName: "Ezgi Şen",
    email: "ezgi.sen@outlook.com",
    balance: 120.00,
    totalOrders: 18,
    joinedDate: "2026-02-10",
    status: "active",
    note: "Instagram hesapları için toplu alım yapıyor."
  },
  {
    id: "U003",
    fullName: "Kerem Taş",
    email: "keremtas98@gmail.com",
    balance: 12.40,
    totalOrders: 9,
    joinedDate: "2026-03-01",
    status: "active"
  },
  {
    id: "U004",
    fullName: "Selin Avcı",
    email: "selin_avci@gmail.com",
    balance: 245.00,
    totalOrders: 15,
    joinedDate: "2026-03-22",
    status: "active"
  },
  {
    id: "U005",
    fullName: "Ahmet Akın",
    email: "ahmetakin_bursa@gmail.com",
    balance: 0.00,
    totalOrders: 3,
    joinedDate: "2026-04-05",
    status: "suspended",
    note: "Kart dolandırıcılığı süphesinden dolayı askıya alındı."
  },
  {
    id: "U006",
    fullName: "Ayça Güzel",
    email: "aycaguzell@gmail.com",
    balance: 780.00,
    totalOrders: 31,
    joinedDate: "2026-04-12",
    status: "active"
  },
  {
    id: "U007",
    fullName: "Pro Gamer TR",
    email: "gamerprotr@gmail.com",
    balance: 45.10,
    totalOrders: 8,
    joinedDate: "2026-04-29",
    status: "active"
  },
  {
    id: "U008",
    fullName: "Spotify Music Curator",
    email: "curatorspotify@outlook.com",
    balance: 512.60,
    totalOrders: 22,
    joinedDate: "2026-05-02",
    status: "active"
  }
];

export const initialPaymentMethods: PaymentMethod[] = [
  { id: "cc", name: "Kredi / Banka Kartı (PayTR)", status: true, commission: 2.5, minAmount: 50 },
  { id: "eft", name: "Havale / EFT (Manuel onay)", status: true, commission: 0, minAmount: 100 },
  { id: "crypto", name: "Kripto Ödeme (BTC, ETH, USDT)", status: true, commission: 1.0, minAmount: 250 },
  { id: "papara", name: "Papara ile Cüzdan Transferi", status: true, commission: 1.5, minAmount: 20 },
  { id: "stripe", name: "Stripe Global Pay (USD/EUR)", status: false, commission: 3.9, minAmount: 200 }
];

export const initialPaymentRequests: PaymentRequest[] = [
  {
    id: "P-401",
    userId: "U001",
    userName: "Mehmet Can Öztürk",
    amount: 1000,
    method: "Kredi / Banka Kartı (PayTR)",
    status: "Onaylandı",
    date: "2026-06-03T15:24:00Z",
    transactionId: "TR_82761823"
  },
  {
    id: "P-402",
    userId: "U003",
    userName: "Kerem Taş",
    amount: 250,
    method: "Havale / EFT (Garanti Bankası)",
    status: "Beklemede",
    date: "2026-06-03T20:45:00Z"
  },
  {
    id: "P-403",
    userId: "U006",
    userName: "Ayça Güzel",
    amount: 500,
    method: "Papara",
    status: "Onaylandı",
    date: "2026-06-02T11:20:00Z",
    transactionId: "PAP_901237"
  },
  {
    id: "P-404",
    userId: "U004",
    userName: "Selin Avcı",
    amount: 200,
    method: "Kredi / Banka Kartı (PayTR)",
    status: "Onaylandı",
    date: "2026-06-01T17:40:00Z",
    transactionId: "TR_81923712"
  },
  {
    id: "P-405",
    userId: "U008",
    userName: "Spotify Music Curator",
    amount: 600,
    method: "Kripto Ödeme (USDT)",
    status: "Onaylandı",
    date: "2026-05-31T22:15:00Z",
    transactionId: "TX_0x712a8398b1ec"
  },
  {
    id: "P-406",
    userId: "U003",
    userName: "Kerem Taş",
    amount: 150,
    method: "Havale / EFT",
    status: "Reddedildi",
    date: "2026-05-30T09:12:00Z"
  }
];

export const initialTickets: Ticket[] = [
  {
    id: "T-501",
    userId: "U001",
    userName: "Mehmet Can Öztürk",
    subject: "Instagram Takipçide Aşırı Düşüş Yaşadım",
    priority: "Yüksek",
    status: "Açık",
    date: "2026-06-03T19:22:00Z",
    messages: [
      {
        id: "m1",
        sender: "user",
        senderName: "Mehmet Can Öztürk",
        message: "Merhaba, dün sipariş verdiğim S-87910 nolu siparişimdeki takipçilerde bugün yaklaşık 400 adet düşüş oldu. Telafi edilmesini veya kontrol edilmesini talep ediyorum. Teşekkürler.",
        time: "19:22"
      }
    ]
  },
  {
    id: "T-502",
    userId: "U003",
    userName: "Kerem Taş",
    subject: "Bakiye yüklemem neden halen onaylanmadı?",
    priority: "Orta",
    status: "Cevaplandı",
    date: "2026-06-03T21:00:00Z",
    messages: [
      {
        id: "m2",
        sender: "user",
        senderName: "Kerem Taş",
        message: "Garanti Bankası üzerinden EFT gerçekleştirdim ve ödeme bildirimi yaptım (P-402). Yaklaşık 1 saattir bakiyem yüklenmedi, ilgilenebilir misiniz?",
        time: "21:00"
      },
      {
        id: "m3",
        sender: "admin",
        senderName: "Sistem Admin",
        message: "Merhaba Kerem Bey, Havale/EFT işlemlerinde açıklamaya yazdığınız kullanıcı adınız ve tutarın eşleşmesi manuel olarak kontrol edilmektedir. Maksimum 30 dakika içerisinde finans birimimiz işlemi onaylayacaktır.",
        time: "21:15"
      }
    ]
  },
  {
    id: "T-503",
    userId: "U002",
    userName: "Ezgi Şen",
    subject: "Özel Fiyat Teklifi / Bayilik",
    priority: "Düşük",
    status: "Açık",
    date: "2026-06-03T22:50:00Z",
    messages: [
      {
        id: "m4",
        sender: "user",
        senderName: "Ezgi Şen",
        message: "Merhaba, aylık yaklaşık 50.000 adet üzerinde Instagram takipçi siparişi veriyorum. Servis ID 101 için bana özel bir indirim tanımlamanız mümkün mü acaba? Eğer anlaşırsak tüm hacmimizi buraya kaydıracağız.",
        time: "22:50"
      }
    ]
  },
  {
    id: "T-504",
    userId: "U006",
    userName: "Ayça Güzel",
    subject: "TikTok Beğeni Link Hatası",
    priority: "Orta",
    status: "Kapalı",
    date: "2026-06-02T13:40:00Z",
    messages: [
      {
        id: "m5",
        sender: "user",
        senderName: "Ayça Güzel",
        message: "TikTok izlenmesinde yanlışlıkla profil linki verdim, video linki yerine. Düzeltebilir miyiz?",
        time: "13:40"
      },
      {
        id: "m6",
        sender: "admin",
        senderName: "Sistem Admin",
        message: "Merhaba, siparişiniz henüz gönderilmeye başlanmadığından ötürü iptal edilip bakiye cüzdanınıza iade edildi. Lütfen video bağlantısı ile siparişi tekrarlayın.",
        time: "14:02"
      }
    ]
  }
];

export const initialApiProviders: ApiProvider[] = [
  {
    id: "API_TURKPANELI",
    name: "TurkPaneli.com SMM Dağıtıcı API",
    url: "https://turkpaneli.com/api/v2",
    key: "sk_tp_8219x0fd83120ff9a3c",
    status: true,
    balance: 5420.50
  }
];

export const quickReplies = [
  "Merhaba, talebiniz ilgili teknik birime aktarıldı. En kısa sürede geri dönüş sağlanacaktır.",
  "Merhaba, siparişiniz kontrol edildiğinde gönderimin devam ettiği görülmüştür. Tam süresi sağlayıcı yoğunluğuna göre değişebilmektedir.",
  "Merhaba, verdiğiniz link hatalı veya gizli konumdadır. Lütfen gizlilik ayarlarını kontrol edip siparişi yeniden açınız.",
  "Merhaba, ödemeniz kontrol edilerek bakiye cüzdanınıza yansıtılmıştır. Keyifli alışverişler dileriz.",
  "Merhaba, düşen takipçiler için telafi butonu aktif edilerek siparişiniz tekrar gönderime alınmıştır."
];

export const auditLogs = [
  { time: "23:25", admin: "Super Admin (Salih)", action: "Servis ID 101 fiyatını güncelledi (40.00 TL -> 42.50 TL)" },
  { time: "22:15", admin: "Moderator (Ayşe)", action: "Ticket T-502'ye yanıt verdi" },
  { time: "21:40", admin: "Super Admin (Salih)", action: "P-403 ödeme bildirimini onayladı (500 TL)" },
  { time: "20:10", admin: "System Auto-API", action: "S-87910 siparişini 'Tamamlandı' olarak güncelledi" },
  { time: "19:05", admin: "Super Admin (Salih)", action: "Yeni bir servis ekledi (Service ID: 111)" }
];

export const thirtyDaysIncomeData = [
  { date: "05/05", income: 3200, users: 12 },
  { date: "07/05", income: 4500, users: 15 },
  { date: "09/05", income: 2800, users: 8 },
  { date: "11/05", income: 5120, users: 20 },
  { date: "13/05", income: 6400, users: 25 },
  { date: "15/05", income: 4800, users: 14 },
  { date: "17/05", income: 7200, users: 30 },
  { date: "19/05", income: 5900, users: 18 },
  { date: "21/05", income: 8300, users: 35 },
  { date: "23/05", income: 6100, users: 22 },
  { date: "25/05", income: 9400, users: 44 },
  { date: "27/05", income: 7800, users: 29 },
  { date: "29/05", income: 11200, users: 50 },
  { date: "31/05", income: 10500, users: 41 },
  { date: "02/06", income: 12450, users: 55 },
  { date: "03/06", income: 14320, users: 62 }
];

export const platformStats = [
  { name: "Instagram", value: 45, color: "#E1306C" },
  { name: "TikTok", value: 25, color: "#00F2FE" },
  { name: "YouTube", value: 15, color: "#FF0000" },
  { name: "Twitter", value: 8, color: "#1DA1F2" },
  { name: "Telegram", value: 5, color: "#0088cc" },
  { name: "Spotify", value: 2, color: "#1DB954" }
];
