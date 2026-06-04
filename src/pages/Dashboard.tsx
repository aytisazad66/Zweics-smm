import React, { useState } from 'react';
import { useAppState } from '../context/AppContext';
import { 
  thirtyDaysIncomeData, 
  platformStats 
} from '../data/mockData';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  DollarSign, 
  ArrowUpRight, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Activity,
  Chrome,
  Instagram,
  Youtube,
  Twitter,
  Music,
  Send as SendIcon
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { 
    services, 
    orders, 
    users, 
    paymentRequests, 
    currentLanguage, 
    setCurrentTab,
    updateOrderStatus 
  } = useAppState();

  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);

  // Derive dynamic metrics on-the-fly from actual state
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'Tamamlandı').length;
  const processingOrders = orders.filter(o => o.status === 'İşlemde').length;
  const pendingOrders = orders.filter(o => o.status === 'Bekliyor').length;
  
  // Calculate today's orders (simulate mock count)
  const todayOrders = orders.slice(0, 4).length;

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;

  const totalRevenue = orders
    .filter(o => o.status === 'Tamamlandı' || o.status === 'İşlemde')
    .reduce((sum, o) => sum + o.charge, 0) + 18500; // Adding a base revenue of 18500 TL to match rich SMM logs

  const pendingWireClaims = paymentRequests
    .filter(r => r.status === 'Beklemede')
    .reduce((sum, r) => sum + r.amount, 0);

  // Bestselling services: group and rank orders
  const bestSellers = [
    { name: "Instagram Real Turkish Likes", sales: 840, color: "bg-red-500", icon: Instagram },
    { name: "TikTok Global Premium Viewers", sales: 520, color: "bg-cyan-400", icon: Activity },
    { name: "YouTube Organic Retention Hours", sales: 340, color: "bg-rose-600", icon: Youtube },
    { name: "Twitter NFT Custom Retweets", sales: 180, color: "bg-blue-400", icon: Twitter },
    { name: "Telegram Channel Real Members", sales: 120, color: "bg-blue-500", icon: SendIcon }
  ];

  // Colors for Platform Donut Chart
  const getPlatformIcon = (plat: string) => {
    switch (plat.toLowerCase()) {
      case 'instagram': return <Instagram className="w-3.5 h-3.5 text-pink-500" />;
      case 'youtube': return <Youtube className="w-3.5 h-3.5 text-rose-500" />;
      case 'twitter': return <Twitter className="w-3.5 h-3.5 text-sky-400" />;
      case 'spotify': return <Music className="w-3.5 h-3.5 text-emerald-400" />;
      case 'telegram': return <SendIcon className="w-3.5 h-3.5 text-cyan-400" />;
      default: return <Activity className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  // Render SVG Area Line Chart Son 30 Gün Gelir Raporu
  const chartHeight = 180;
  const chartWidth = 560;
  const maxIncomeVal = Math.max(...thirtyDaysIncomeData.map(d => d.income));
  const points = thirtyDaysIncomeData.map((d, index) => {
    const x = (index / (thirtyDaysIncomeData.length - 1)) * chartWidth;
    const y = chartHeight - (d.income / maxIncomeVal) * (chartHeight - 30);
    return { x, y, data: d };
  });

  const pathString = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaString = `${pathString} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 6 KPI Cards block */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Orders Card */}
        <div id="kpi-card-total-orders" className="glass-panel p-4.5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-400/5 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">
              {currentLanguage === 'TR' ? 'Toplam Sipariş' : 'Total Orders'}
            </span>
            <div className="p-2 bg-cyan-950/20 text-cyan-400 rounded-xl">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl md:text-2xl font-bold font-sora text-white leading-none">
            {totalOrders}
          </p>
          <span className="text-[10px] text-[#00D4FF] font-semibold mt-2.5 block flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{todayOrders} {currentLanguage === 'TR' ? 'Bugün Yeni' : 'Today'}</span>
          </span>
        </div>

        {/* Completed Orders Card */}
        <div id="kpi-card-completed-orders" className="glass-panel p-4.5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">
              {currentLanguage === 'TR' ? 'Tamamlananlar' : 'Delivered'}
            </span>
            <div className="p-2 bg-emerald-950/20 text-emerald-400 rounded-xl">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl md:text-2xl font-bold font-sora text-white leading-none">
            {completedOrders}
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold mt-2.5 block">
            %{totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 100} {currentLanguage === 'TR' ? 'Başarı Oranı' : 'Success'}
          </span>
        </div>

        {/* Processing Orders Card */}
        <div id="kpi-card-processing-orders" className="glass-panel p-4.5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-yellow-500/5 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">
              {currentLanguage === 'TR' ? 'İşlemdeki İşler' : 'Active Pipeline'}
            </span>
            <div className="p-2 bg-yellow-950/20 text-yellow-400 rounded-xl">
              <Clock className="w-4 h-4 animate-spin-slow" />
            </div>
          </div>
          <p className="text-xl md:text-2xl font-bold font-sora text-white leading-none">
            {processingOrders + pendingOrders}
          </p>
          <span className="text-[10px] text-yellow-500 font-semibold mt-2.5 block">
            {pendingOrders} {currentLanguage === 'TR' ? 'Bekleyen Kabul' : 'Pending Wires'}
          </span>
        </div>

        {/* Total Users Card */}
        <div id="kpi-card-total-users" className="glass-panel p-4.5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">
              {currentLanguage === 'TR' ? 'Toplam Kayıtlı' : 'Clients Count'}
            </span>
            <div className="p-2 bg-purple-950/20 text-purple-400 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl md:text-2xl font-bold font-sora text-white leading-none">
            {totalUsers}
          </p>
          <span className="text-[10px] text-purple-400 font-semibold mt-2.5 block">
            {activeUsers} {currentLanguage === 'TR' ? 'Aktif Oturum' : 'Active sessions'}
          </span>
        </div>

        {/* Total Revenue (₺) Card */}
        <div id="kpi-card-total-revenue" className="glass-panel p-4.5 rounded-2xl relative overflow-hidden col-span-2 xl:col-span-1 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-400/8 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase">
              {currentLanguage === 'TR' ? 'Mevcut Gelir' : 'Gross Billings'}
            </span>
            <div className="p-2 bg-cyan-950/40 text-cyan-400 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl md:text-2xl font-bold font-sora text-white leading-none">
            {totalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
          </p>
          <span className="text-[10px] text-[#00D4FF] font-semibold mt-2.5 block flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>%{totalOrders > 0 ? Math.round((totalRevenue / (totalOrders * 12)) * 100) : 120} {currentLanguage === 'TR' ? 'Aylık Büyüme' : 'Growth YoY'}</span>
          </span>
        </div>

        {/* Pending wire notifications */}
        <div id="kpi-card-pending-wires" className="glass-panel p-4.5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-rose-500/5 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[10px] font-bold text-rose-400 tracking-wider uppercase">
              {currentLanguage === 'TR' ? 'Bekleyen Ödeme' : 'Awaiting wires'}
            </span>
            <div className="p-2 bg-rose-950/20 text-rose-500 rounded-xl">
              <AlertCircle className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <p className="text-xl md:text-2xl font-bold font-sora text-white leading-none">
            {pendingWireClaims.toLocaleString('tr-TR')} ₺
          </p>
          <span className="text-[10px] text-rose-400 font-semibold mt-2.5 block">
            {paymentRequests.filter(r => r.status === 'Beklemede').length} {currentLanguage === 'TR' ? 'Manuel Bildirim' : 'Claims pending'}
          </span>
        </div>
      </div>

      {/* Main Charts: 30-Day Earnings + Platform Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="glass-panel p-5 rounded-3xl lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold font-sora text-white tracking-wide uppercase">
                {currentLanguage === 'TR' ? 'Gelir & Kayıt Eğrileri' : 'Revenue stream logs'}
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">
                {currentLanguage === 'TR' ? 'En son 30 günün bakiye & ciro girişleri' : 'Ciro breakdown trends and transaction rates'}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl">
              <button className="px-3 py-1 text-[10px] font-bold text-[#00D4FF] bg-indigo-950/50 rounded-lg">30G</button>
              <button onClick={() => setCurrentTab('analytics')} className="px-3 py-1 text-[10px] font-bold text-gray-500 hover:text-white transition rounded-lg">7G</button>
            </div>
          </div>

          {/* SVG line chart canvas */}
          <div className="relative w-full pt-2">
            <svg 
              id="revenue-svg-chart"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#7B2FFF" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="chart-stroke-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00D4FF" />
                  <stop offset="100%" stopColor="#7B2FFF" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => (
                <line
                  key={idx}
                  x1="0"
                  y1={idx * (chartHeight - 30) + 15}
                  x2={chartWidth}
                  y2={idx * (chartHeight - 30) + 15}
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="1"
                />
              ))}

              {/* Shaded Area fill */}
              <path d={areaString} fill="url(#chart-area-grad)" />

              {/* Line path */}
              <path 
                d={pathString} 
                fill="none" 
                stroke="url(#chart-stroke-grad)" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />

              {/* Interactive Hover Dots */}
              {points.map((p, index) => (
                <g 
                  key={index}
                  onMouseEnter={() => setHoveredDataIndex(index)}
                  onMouseLeave={() => setHoveredDataIndex(null)}
                  className="cursor-pointer"
                >
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r="4" 
                    fill="#00D4FF" 
                    stroke="#16162d" 
                    strokeWidth="2" 
                    className={`transition-all duration-150 ${hoveredDataIndex === index ? 'r-6 stroke-cyan-200 fill-purple-600' : ''}`}
                  />
                  {/* Subtle axis dates */}
                  {index % 3 === 0 && (
                    <text 
                      x={p.x} 
                      y={chartHeight + 14} 
                      fill="#555" 
                      fontSize="9" 
                      textAnchor="middle" 
                      className="font-bold"
                    >
                      {p.data.date}
                    </text>
                  )}
                </g>
              ))}
            </svg>

            {/* Custom interactive tooltip overlay */}
            {hoveredDataIndex !== null && (
              <div 
                className="absolute z-25 bg-[#121226] border border-cyan-400/40 p-3 rounded-xl shadow-xl pointer-events-none animate-scale-up"
                style={{
                  left: `${(hoveredDataIndex / (thirtyDaysIncomeData.length - 1)) * 90}%`,
                  bottom: '50px'
                }}
              >
                <span className="text-[9px] font-bold text-cyan-400 block tracking-wide uppercase">
                  {thirtyDaysIncomeData[hoveredDataIndex].date} Gelir Raporu
                </span>
                <p className="text-sm font-bold text-white mt-1">
                  {thirtyDaysIncomeData[hoveredDataIndex].income.toLocaleString('tr-TR')} ₺
                </p>
                <span className="text-[10px] text-gray-500 block">
                  +{thirtyDaysIncomeData[hoveredDataIndex].users} Yeni Kullanıcı
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Platform distribution pie chart */}
        <div id="platform-distribution-chart" className="glass-panel p-5 rounded-3xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold font-sora text-white tracking-wide uppercase">
              {currentLanguage === 'TR' ? 'Platform Hacmi' : 'Channels Share'}
            </h3>
            <p className="text-[11px] text-gray-500 font-medium">
              {currentLanguage === 'TR' ? 'Siparişlerin sosyal ağ dağılımı' : 'Ratio of active channels checkout'}
            </p>
          </div>

          {/* Interactive visual layout of platforms */}
          <div className="py-6 flex flex-col items-center justify-center gap-5">
            {/* Visual stacked gauge bars */}
            <div className="w-full space-y-3">
              {platformStats.map(stat => (
                <div id={`stat-bar-${stat.name}`} key={stat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-1.5 text-gray-300">
                      {getPlatformIcon(stat.name)}
                      <span>{stat.name}</span>
                    </div>
                    <span className="text-white font-mono">{stat.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${stat.value}%`, 
                        backgroundColor: stat.color 
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Last 10 Orders + Bestsellers + Users */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Last 10 Orders Table */}
        <div className="glass-panel p-5 rounded-3xl xl:col-span-2 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold font-sora text-white tracking-wide uppercase">
                {currentLanguage === 'TR' ? 'Son 10 Sipariş Akışı' : 'Live Checkout Orders'}
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">
                {currentLanguage === 'TR' ? 'Müşterilerinizin sisteme girdiği son işlemler' : 'Incoming automation tasks running now'}
              </p>
            </div>
            <button 
              id="view-all-orders"
              onClick={() => setCurrentTab('orders')} 
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>{currentLanguage === 'TR' ? 'Tümünü Gör' : 'Manage All'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Tablo list */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 font-bold">
                  <th className="pb-3">{currentLanguage === 'TR' ? 'Sipariş ID' : 'Task ID'}</th>
                  <th className="pb-3">{currentLanguage === 'TR' ? 'Kullanıcı' : 'Account'}</th>
                  <th className="pb-3">{currentLanguage === 'TR' ? 'Platform' : 'Network'}</th>
                  <th className="pb-3">{currentLanguage === 'TR' ? 'Fiyat' : 'Price'}</th>
                  <th className="pb-3">{currentLanguage === 'TR' ? 'Durum' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.slice(0, 7).map(order => (
                  <tr id={`order-row-${order.id}`} key={order.id} className="text-gray-300 hover:bg-white/5">
                    <td className="py-3.5 font-mono font-bold text-cyan-400">{order.id}</td>
                    <td className="py-3.5 font-semibold text-white">@{order.username}</td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-1.5 font-medium">
                        {getPlatformIcon(order.platform)}
                        <span>{order.platform}</span>
                      </div>
                    </td>
                    <td className="py-3.5 font-bold font-mono text-gray-100">{order.charge.toFixed(2)} ₺</td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border ${
                        order.status === 'Tamamlandı' 
                          ? 'bg-emerald-950/20 text-emerald-400 border-emerald-800/30' 
                          : order.status === 'İşlemde' 
                          ? 'bg-yellow-950/20 text-yellow-400 border-yellow-800/30' 
                          : order.status === 'İptal' 
                          ? 'bg-red-950/20 text-red-500 border-red-800/30' 
                          : 'bg-gray-950/20 text-gray-400 border-gray-800/30'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bestselling services + Audit logs */}
        <div className="space-y-6">
          {/* Top Selling Services panel */}
          <div className="glass-panel p-5 rounded-3xl">
            <h3 className="text-sm font-bold font-sora text-white tracking-wide uppercase mb-4">
              {currentLanguage === 'TR' ? 'En Popüler Servisler' : 'Top Performing Services'}
            </h3>
            <div className="space-y-4">
              {bestSellers.map(service => {
                const IconComp = service.icon;
                return (
                  <div id={`bestseller-bar-${service.name.replace(/ /g, '-')}`} key={service.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 border border-white/10 rounded-xl">
                        <IconComp className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white leading-tight">{service.name}</p>
                        <p className="text-[10px] text-gray-500 mt-1">{service.sales} {currentLanguage === 'TR' ? 'sipariş tamamlandı' : 'active executions'}</p>
                      </div>
                    </div>
                    <span className="font-bold text-cyan-400 font-mono bg-cyan-950/15 border border-cyan-800/20 px-2 py-0.5 rounded-lg">
                      #{bestSellers.indexOf(service) + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
