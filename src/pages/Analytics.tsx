import React, { useState, useMemo } from 'react';
import { useAppState } from '../context/AppContext';
import { BarChart, Wallet, Calendar, Download, TrendingUp, Compass, Award, Activity } from 'lucide-react';

// Parse both ISO ("2026-06-01T...") and legacy Turkish locale ("01.06.2026 14:30") formats
const parseFlexDate = (d: string): Date => {
  const iso = new Date(d);
  if (!isNaN(iso.getTime())) return iso;
  const m = d.match(/^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0));
  return new Date(NaN);
};

export const Analytics: React.FC = () => {
  const { currentLanguage, showToast, orders, users } = useAppState();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('30d');

  const MONTHS = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];

  // Compute income data from real orders (robust date parsing)
  const thirtyDaysIncomeData = useMemo(() => {
    const map: Record<string, { income: number }> = {};
    const cutoff = dateRange === '7d' ? Date.now() - 7 * 86400000
      : dateRange === '30d' ? Date.now() - 30 * 86400000 : 0;
    orders.forEach(o => {
      const d = parseFlexDate(o.date);
      if (isNaN(d.getTime()) || d.getTime() < cutoff) return;
      const label = `${d.getDate().toString().padStart(2,'0')} ${MONTHS[d.getMonth()]}`;
      if (!map[label]) map[label] = { income: 0 };
      map[label].income += o.charge;
    });
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const label = `${d.getDate().toString().padStart(2,'0')} ${MONTHS[d.getMonth()]}`;
      result.push({ date: label, income: map[label]?.income || 0 });
    }
    return result;
  }, [orders, dateRange]);

  // Real user registration data from users.joinedDate
  const registrationData = useMemo(() => {
    const map: Record<string, number> = {};
    const cutoff = dateRange === '7d' ? Date.now() - 7 * 86400000
      : dateRange === '30d' ? Date.now() - 30 * 86400000 : 0;
    users.forEach(u => {
      const d = parseFlexDate(u.joinedDate);
      if (isNaN(d.getTime()) || d.getTime() < cutoff) return;
      const label = `${d.getDate().toString().padStart(2,'0')} ${MONTHS[d.getMonth()]}`;
      map[label] = (map[label] || 0) + 1;
    });
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const label = `${d.getDate().toString().padStart(2,'0')} ${MONTHS[d.getMonth()]}`;
      result.push({ date: label, registrations: map[label] || 0 });
    }
    return result;
  }, [users, dateRange]);

  // Platform profitability from real orders
  const platformProfitStats = useMemo(() => {
    const cutoff = dateRange === '7d' ? Date.now() - 7 * 86400000
      : dateRange === '30d' ? Date.now() - 30 * 86400000 : 0;
    const stats: Record<string, { revenue: number; count: number }> = {};
    orders.forEach(o => {
      const d = parseFlexDate(o.date);
      if (isNaN(d.getTime()) || d.getTime() < cutoff) return;
      if (!stats[o.platform]) stats[o.platform] = { revenue: 0, count: 0 };
      stats[o.platform].revenue += o.charge;
      stats[o.platform].count++;
    });
    return Object.entries(stats)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 3)
      .map(([name, data]) => ({
        tag: name,
        profit: `${data.revenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`,
        margin: `${orders.length > 0 ? Math.round((data.count / orders.length) * 100) : 0}%`,
        count: `${data.count} sipariş`
      }));
  }, [orders, dateRange]);

  // Simulated export to CSV
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Tarih,Gelir (TL),Yeni Kayıt\n";
    thirtyDaysIncomeData.forEach((row, i) => {
      csvContent += `${row.date},${row.income},${registrationData[i]?.registrations ?? 0}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `smm_panel_finans_rapor_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(currentLanguage === 'TR' ? 'CSV Raporu başarıyla üretildi ve indirildi!' : 'CSV financial ledger exported successfully!', 'success');
  };

  const handleExportPDF = () => {
    showToast(currentLanguage === 'TR' ? 'PDF Export motoru hazırlandı. Yazıcı penceresi simüle ediliyor...' : 'PDF printing ledger mockup started.', 'info');
    window.print();
  };

  // Bar Chart calculations of revenue comparisons (Gelir Raporu Bar Chart)
  const barChartHeight = 160;
  const barChartWidth = 600;
  const items = thirtyDaysIncomeData.slice(-8); // compare last 8 records
  const maxVal = Math.max(...items.map(d => d.income));

  // Area Chart Calculations — real user registrations by day
  const areaHeight = 150;
  const areaWidth = 600;
  const maxUsersVal = Math.max(...registrationData.map(d => d.registrations), 1);
  const userPoints = registrationData.map((d, idx) => {
    const x = registrationData.length > 1 ? (idx / (registrationData.length - 1)) * areaWidth : areaWidth / 2;
    const y = areaHeight - (d.registrations / maxUsersVal) * (areaHeight - 20);
    return { x, y: parseFloat(y.toFixed(1)) };
  });

  const userPath = userPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const userArea = `${userPath} L ${areaWidth} ${areaHeight} L 0 ${areaHeight} Z`;
  const totalNewUsers = registrationData.reduce((s, d) => s + d.registrations, 0);

  return (
    <div className="space-y-6 animate-fade-in text-[#eeeeff]">
      
      {/* Top action date filtering and export tools */}
      <div className="glass-panel p-5 rounded-3xl flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-5 h-5 text-cyan-400" />
          <div className="flex items-center p-1 bg-white/5 border border-white/10 rounded-xl">
            <button
              id="date-filter-7d-btn"
              onClick={() => setDateRange('7d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${dateRange === '7d' ? 'bg-[#181832] text-cyan-400 font-black' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Son 7 Gün
            </button>
            <button
              id="date-filter-30d-btn"
              onClick={() => setDateRange('30d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${dateRange === '30d' ? 'bg-[#181832] text-cyan-400 font-black' : 'text-gray-500 hover:text-gray-300'}`}
            >
              30 Gün
            </button>
            <button
              id="date-filter-all-btn"
              onClick={() => setDateRange('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${dateRange === 'all' ? 'bg-[#181832] text-cyan-400 font-black' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Yıl Geneli
            </button>
          </div>
        </div>

        {/* Dynamic export files triggers */}
        <div className="flex items-center gap-2">
          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition flex items-center gap-1.5 text-gray-300 cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV Excel İndir</span>
          </button>
          <button
            id="export-pdf-btn"
            onClick={handleExportPDF}
            className="px-4 py-2 bg-gradient-to-tr from-cyan-400 to-[#7B2FFF] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
          >
            <BarChart className="w-3.5 h-3.5" />
            <span>PDF Rapor Çıkart</span>
          </button>
        </div>
      </div>

      {/* Grid: Revenue comparing bars + Users curve area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SVG custom Bar Chart: Monthly comparing */}
        <div className="glass-panel p-5 rounded-3xl flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1">Aylık Karşılaştırmalı Gelir Endeksi</h4>
            <span className="text-sm font-bold text-white">SMM Ciro Dağılım Çubukları</span>
          </div>

          <div className="relative pt-2">
            <svg 
              id="monthly-gain-bar-chart"
              viewBox={`0 0 ${barChartWidth} ${barChartHeight}`} 
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D4FF" />
                  <stop offset="100%" stopColor="#7B2FFF" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {items.map((it, i) => {
                const step = barChartWidth / items.length;
                const barWidth = 35;
                const x = i * step + (step - barWidth) / 2;
                const h = (it.income / maxVal) * (barChartHeight - 35);
                const y = barChartHeight - h - 20;

                return (
                  <g key={i}>
                    {/* Shadow compare lines */}
                    <rect
                      x={x}
                      y={10}
                      width={barWidth}
                      height={barChartHeight - 30}
                      fill="rgba(255,255,255,0.015)"
                      rx="4"
                    />

                    {/* Active values bar */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={h}
                      fill="url(#bar-grad)"
                      rx="6"
                      className="transition-all hover:opacity-80"
                    />

                    {/* Top numeric value label */}
                    <text
                      x={x + barWidth / 2}
                      y={y - 6}
                      fill="#888"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {Math.round(it.income / 100) / 10}k
                    </text>

                    {/* Date bottom axis */}
                    <text
                      x={x + barWidth / 2}
                      y={barChartHeight}
                      fill="#555"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {it.date}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* SVG custom Area Chart: Client Growth */}
        <div className="glass-panel p-5 rounded-3xl flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1">Gerçek Kayıt Eğrisi (Area)</h4>
            <span className="text-sm font-bold text-white">Yeni Üye Kayıtları — {totalNewUsers} kişi</span>
          </div>

          <div className="relative pt-2">
            <svg 
              id="user-growth-area-chart"
              viewBox={`0 0 ${areaWidth} ${areaHeight}`} 
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                <linearGradient id="user-area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7B2FFF" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#00D4FF" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <path d={userArea} fill="url(#user-area-grad)" />
              <path d={userPath} fill="none" stroke="#7B2FFF" strokeWidth="2.5" />

              {/* Data points */}
              {userPoints.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  fill="#7B2FFF"
                  stroke="#16162d"
                  strokeWidth="1.5"
                />
              ))}
            </svg>
          </div>
        </div>

      </div>

      {/* Bottom Profitability section */}
      <div className="glass-panel p-5 rounded-3xl">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-yellow-400" />
          <h3 className="text-sm font-bold font-sora text-white tracking-wide uppercase">EN ÇOK KAR BIRAKAN SMM GRUPLARI</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {platformProfitStats.length === 0 ? (
          <p className="text-xs text-gray-500 italic text-center py-4 col-span-3">Henüz veri bulunmamaktadır. Sipariş girildikçe veriler burada görünecek.</p>
        ) : platformProfitStats.map((item, idx) => (
            <div id={`profit-stat-${item.tag}`} key={idx} className="p-4 bg-[#121226]/50 border border-white/5 rounded-2xl space-y-2">
              <span className="text-[10px] bg-cyan-950/20 border border-cyan-800/20 text-cyan-400 px-2 py-0.5 rounded font-black font-mono">
                RANK #{idx + 1}
              </span>
              <h4 className="text-sm font-extrabold text-white">{item.tag} Servis Katmanı</h4>
              
              <div className="pt-2 text-xs text-gray-400 space-y-1">
                <p>Net Gelir: <strong className="text-emerald-400 font-mono">{item.profit}</strong></p>
                <p>Ortalama Marj: <strong className="text-[#00D4FF] font-mono">{item.margin}</strong></p>
                <p>Hacim: <span className="text-white font-mono">{item.count}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
