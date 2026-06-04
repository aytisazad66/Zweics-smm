import React, { useState } from 'react';
import { useAppState } from '../context/AppContext';
import { platformStats, thirtyDaysIncomeData } from '../data/mockData';
import { BarChart, Wallet, Calendar, Download, TrendingUp, Compass, Award, Activity } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { currentLanguage, showToast } = useAppState();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('30d');

  // Simulated export to CSV
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Tarih,Gelir (TL),Yeni Kullanıcı\n";
    thirtyDaysIncomeData.forEach(row => {
      csvContent += `${row.date},${row.income},${row.users}\n`;
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

  // Area Chart Calculations (Kullanıcı büyümesi Area)
  const areaHeight = 150;
  const areaWidth = 600;
  const maxUsersVal = Math.max(...thirtyDaysIncomeData.map(d => d.users));
  const userPoints = thirtyDaysIncomeData.map((d, idx) => {
    const x = (idx / (thirtyDaysIncomeData.length - 1)) * areaWidth;
    const y = areaHeight - (d.users / maxUsersVal) * (areaHeight - 20);
    return { x, y };
  });

  const userPath = userPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const userArea = `${userPath} L ${areaWidth} ${areaHeight} L 0 ${areaHeight} Z`;

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
            <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1">Müşteri Büyüme Hacim Eğrisi (Area)</h4>
            <span className="text-sm font-bold text-white">Son 30 Gün Üye Edinme</span>
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
          {[
            { tag: "Instagram", profit: "14,520.00 TL", margin: "45.0%", count: "128 sipariş" },
            { tag: "TikTok", profit: "8,920.00 TL", margin: "40.2%", count: "98 sipariş" },
            { tag: "YouTube", profit: "5,340.00 TL", margin: "38.5%", count: "42 sipariş" }
          ].map((item, idx) => (
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
