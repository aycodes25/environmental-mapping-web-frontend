import React, { useMemo, useState, useEffect } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import WebIcon from "../custom/WebIcons";
import MessageModal from "./modal.jsx";

/* ---------------- Colors ---------------- */
const COLORS = {
  bacteria: "#7E45D3",
  fungi: "#412461",
  virus: "#D1B1F4",
  parasite: "#F472B6",
  others: "#FCE7F3",
};

/* ---------------- Sample Data ---------------- */
const sampleData = [
  { id: 1, month: "Jan", day: 15, value: 2, organism: "fungi", y: 25 },
  { id: 2, month: "Jan", day: 15, value: 2, organism: "bacteria", y: 22 },
  { id: 3, month: "Feb", day: 35, value: 300, organism: "parasite", y: 0 },
  { id: 4, month: "Feb", day: 42, value: 50, organism: "bacteria", y: 15 },
  { id: 5, month: "Feb", day: 50, value: 5000, organism: "fungi", y: 25 },
  { id: 6, month: "Feb", day: 55, value: 7000, organism: "bacteria", y: 35 },
  { id: 7, month: "Feb", day: 55, value: 5000, organism: "fungi", y: 45 },
  { id: 8, month: "Feb", day: 55, value: 3000, organism: "virus", y: 50 },
  { id: 9, month: "Feb", day: 55, value: 2, organism: "fungi", y: 55 },
  { id: 10, month: "Feb", day: 55, value: 2, organism: "virus", y: 65 },
  { id: 11, month: "Feb", day: 55, value: 400, organism: "virus", y: 80 },
  { id: 12, month: "Mar", day: 70, value: 300, organism: "parasite", y: 10 },
  { id: 13, month: "Mar", day: 75, value: 5000, organism: "bacteria", y: 20 },
  { id: 14, month: "Mar", day: 80, value: 400, organism: "fungi", y: 40 },
  { id: 15, month: "Mar", day: 85, value: 5000, organism: "bacteria", y: 60 },
  { id: 16, month: "Apr", day: 20, value: 500, organism: "parasite", y: 10 },
  { id: 17, month: "Apr", day: 45, value: 3000, organism: "fungi", y: 30 },
  { id: 18, month: "Apr", day: 50, value: 500, organism: "parasite", y: 40 },
  { id: 19, month: "Apr", day: 55, value: 400, organism: "parasite", y: 55 },
  { id: 20, month: "May", day: 55, value: 300, organism: "parasite", y: 5 },
  { id: 21, month: "May", day: 55, value: 5000, organism: "parasite", y: 25 },
  { id: 22, month: "May", day: 55, value: 400, organism: "parasite", y: 45 },
  { id: 23, month: "May", day: 55, value: 400, organism: "parasite", y: 50 },
  { id: 24, month: "May", day: 55, value: 400, organism: "parasite", y: 80 },
  { id: 25, month: "Jun", day: 55, value: 400, organism: "others", y: 5 },
  { id: 26, month: "Jun", day: 55, value: 4000, organism: "fungi", y: 25 },
  { id: 27, month: "Jun", day: 55, value: 400, organism: "parasite", y: 45 },
  { id: 28, month: "Jul", day: 55, value: 400, organism: "bacteria", y: 20 },
  { id: 29, month: "Jul", day: 55, value: 3000, organism: "virus", y: 40 },
  { id: 30, month: "Jul", day: 55, value: 400, organism: "parasite", y: 50 },
  { id: 31, month: "Jul", day: 55, value: 400, organism: "parasite", y: 70 },
  { id: 32, month: "Jul", day: 55, value: 50, organism: "fungi", y: 80 },
  { id: 33, month: "Aug", day: 55, value: 2, organism: "fungi", y: 10 },
  { id: 34, month: "Aug", day: 55, value: 5, organism: "parasite", y: 80 },
  { id: 35, month: "Sep", day: 55, value: 525, organism: "virus", y: 5 },
  { id: 36, month: "Sep", day: 55, value: 5000, organism: "virus", y: 20 },
  { id: 37, month: "Sep", day: 55, value: 10000, organism: "bacteria", y: 40 },
  { id: 38, month: "Sep", day: 55, value: 300, organism: "virus", y: 55 },
  { id: 39, month: "Sep", day: 55, value: 400, organism: "parasite", y: 60 },
  { id: 40, month: "Sep", day: 55, value: 200, organism: "parasite", y: 80 },
  { id: 41, month: "Oct", day: 55, value: 5000, organism: "bacteria", y: 8 },
  { id: 42, month: "Oct", day: 55, value: 2, organism: "parasite", y: 40 },
  { id: 43, month: "Oct", day: 55, value: 2, organism: "parasite", y: 50 },
  { id: 44, month: "Oct", day: 55, value: 400, organism: "parasite", y: 65 },
  { id: 45, month: "Nov", day: 55, value: 30, organism: "parasite", y: 80 },
  { id: 46, month: "Nov", day: 55, value: 5, organism: "virus", y: 5 },
  { id: 47, month: "Nov", day: 55, value: 5000, organism: "others", y: 40 },
  { id: 48, month: "Nov", day: 55, value: 3000, organism: "parasite", y: 80 },
  { id: 49, month: "Dec", day: 15, value: 2, organism: "virus", y: 45 },
  { id: 50, month: "Dec", day: 20, value: 2, organism: "fungi", y: 50 },


  // ... (I will keep my full dataset here)
];

/* ---------------- Donut Data ---------------- */
const donutData = [
  { name: "Bacteria", value: 1, color: COLORS.bacteria },
  { name: "Fungi", value: 1, color: COLORS.fungi },
  { name: "Virus", value: 1, color: COLORS.virus },
  { name: "Parasite", value: 1, color: COLORS.parasite },
  { name: "Others", value: 1, color: COLORS.others },
];

const legendData = [
  { name: "Bacteria", value: 24, color: COLORS.bacteria, percentage: "+05%", trendColor: "red" },
  { name: "Fungi", value: 234, color: COLORS.fungi, percentage: "+35%", trendColor: "green" },
  { name: "Virus", value: 2, color: COLORS.virus, percentage: "+0.5%", trendColor: "red" },
  { name: "Parasite", value: 34, color: COLORS.parasite, percentage: "+20%", trendColor: "red" },
  { name: "Others", value: 5, color: COLORS.others, percentage: "+0.2%", trendColor: "red" },
];

/* ---------------- Helpers ---------------- */
const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthTicks = Array.from({ length: 12 }, (_, i) => (i + 1) * 4);

const formatNumberLabel = (n) => (n >= 1000 ? n.toLocaleString() : n);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const computeRadius = (value) => {
  if (value >= 100000) return 28;
  if (value >= 7000) return 22;
  if (value >= 5000) return 18;
  if (value >= 1000) return 14;
  if (value >= 500) return 12;
  if (value >= 100) return 10;
  if (value >= 50) return 8;
  return 6;
};

/* ---------------- Custom Scatter Point ---------------- */
const CustomScatterPoint = ({ cx, cy, payload }) => {
  const value = payload.value;
  const organism = payload.organism;
  const color = COLORS[organism] || payload.color || "#8884d8";
  const r = computeRadius(value);

  if (!value) return null;

  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={color} opacity={0.95} />
      <text
        x={cx}
        y={cy}
        dy={4}
        textAnchor="middle"
        fill="#ffffff"
        fontSize={Math.max(9, Math.round(r / 3.2))}
        fontWeight="700"
        style={{ pointerEvents: "none" }}
      >
        {formatNumberLabel(value)}
      </text>
    </g>
  );
};

/* ---------------- Custom Tooltip ---------------- */
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100 text-xs" style={{ minWidth: 180 }}>
      <div className="text-xs font-semibold text-gray-800">{p.date || p.month}</div>
      <div className="mt-2 flex items-center gap-2">
        <div style={{ width: 10, height: 10, borderRadius: 6, background: COLORS[p.organism] }} />
        <div className="text-sm font-semibold text-gray-700">{p.organism}</div>
      </div>
      <div className="text-gray-500 mt-2">{formatNumberLabel(p.value)} Samples</div>
      <div className="text-gray-500">Facilities: 30</div>
    </div>
  );
};

/* ---------------- Donut Tooltip ---------------- */
const DonutTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload; // { name, value, color }
    return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100 text-xs" style={{ minWidth: 160 }}>
            <div className="flex items-center gap-2">
                <div style={{ width: 10, height: 10, borderRadius: 6, background: p.color }} />
                <div className="text-sm font-semibold text-gray-800">{p.name}</div>
            </div>
            <div className="text-gray-600 mt-2">Value: <span className="font-semibold">{formatNumberLabel(p.value)}</span></div>
        </div>
    );
};

/* ---------------- FullDashboard ---------------- */
const FullDashboard = () => {
  const [startDate, setStartDate] = useState('10/02/2023');
  const [endDate, setEndDate] = useState('End Date');
  const [timePeriod, setTimePeriod] = useState('Monthly');
  const [filterType, setFilterType] = useState('All');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showTimePeriodDropdown, setShowTimePeriodDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  // Right side (Donut chart) states
  const [rightStartDate, setRightStartDate] = useState('Start Date');
  const [rightEndDate, setRightEndDate] = useState('End Date');
  const [rightTimePeriod, setRightTimePeriod] = useState('Monthly');
  const [rightFilterType, setRightFilterType] = useState('All');
  const [showRightStartDatePicker, setShowRightStartDatePicker] = useState(false);
  const [showRightEndDatePicker, setShowRightEndDatePicker] = useState(false);
  const [showRightTimePeriodDropdown, setShowRightTimePeriodDropdown] = useState(false);
  const [showRightFilterDropdown, setShowRightFilterDropdown] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [downloadSuccess, setDownloadSuccess] = useState(true);

  const scatterData = useMemo(() => {
    return sampleData.map((s) => {
      const mi = monthLabels.indexOf(s.month);
      const baseX = monthTicks[mi] ?? monthTicks[0];
      const isLarge = s.value >= 5000;
      const jitter = isLarge ? 0 : ((s.id % 5) - 2) * 0.36;
      const x = baseX + jitter;
      const y = clamp(s.y, 8, 62);
      const color = COLORS[s.organism];
      return { ...s, x, y, color };
    });
  }, []);

  const donutTotal = useMemo(() => donutData.reduce((s, d) => s + d.value, 0), []);

  // Calculate responsive donut radii based on container size
  const getDonutRadii = () => {
    // For different screen sizes, use different radii
    const innerRadius = window.innerWidth < 640 ? 80 : window.innerWidth < 768 ? 90 : 100;
    const outerRadius = window.innerWidth < 640 ? 112 : window.innerWidth < 768 ? 126 : 140;
    return { innerRadius, outerRadius };
  };

  const [donutRadii, setDonutRadii] = useState(getDonutRadii());

  // Update radii on resize
  useEffect(() => {
    const handleResize = () => setDonutRadii(getDonutRadii());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowStartDatePicker(false);
        setShowEndDatePicker(false);
        setShowTimePeriodDropdown(false);
        setShowFilterDropdown(false);
        setShowRightStartDatePicker(false);
        setShowRightEndDatePicker(false);
        setShowRightTimePeriodDropdown(false);
        setShowRightFilterDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="grid mx-2 sm:mx-4 lg:mx-5 grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-10">
          <MessageModal
              isOpen={showDownloadModal}
              onClose={() => setShowDownloadModal(false)}
              variant={downloadSuccess ? "success" : "error"}
              reportId="I-0125"
              onRetry={() => { setDownloadSuccess(true); setShowDownloadModal(false); }}
              onCancel={() => setShowDownloadModal(false)}
          />
      {/* LEFT: Scatter */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl p-4 md:p-6">
        {/* Header Section */}
        <div className="mb-6">
          {/* Title with dropdown chevron */}
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="flex items-center gap-1 md:gap-2">
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">Sample Positivity Rates</h1>
                          <WebIcon icon="chevron_down" className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            </div>
            {/* Action icons */}
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              <WebIcon icon="printer" className="w-6 h-6 text-gray-700" />
              </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => { setDownloadSuccess(false); setShowDownloadModal(true); }}>
                              <WebIcon icon="download" className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Filter and Control Section */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            {/* Trend Indicator */}
            <div className="flex items-center gap-2">
                          <WebIcon icon="trend_up_green" className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-600">+10.05% to last year</span>
            </div>

            {/* Date Picker 1 */}
            <div className="relative dropdown-container">
              <button 
                onClick={() => setShowStartDatePicker(!showStartDatePicker)}
                className="flex items-center gap-2 px-3 py-2  rounded-lg bg-white hover:bg-gray-50 transition-colors"
              >
                              <WebIcon icon="calendar" className="w-3.5 h-3.5 text-gray-600" />
                <span className="text-sm text-gray-700">{startDate}</span>
                              <WebIcon icon="chevron_down" className="w-4 h-4 text-gray-600" />
              </button>
              {showStartDatePicker && (
                <input 
                  type="date" 
                  className="absolute top-full mt-1 z-50 border border-gray-300 rounded-lg p-2"
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    setStartDate(`${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`);
                    setShowStartDatePicker(false);
                  }}
                  autoFocus
                />
              )}
            </div>

            {/* Date Picker 2 */}
            <div className="relative dropdown-container">
              <button 
                onClick={() => setShowEndDatePicker(!showEndDatePicker)}
                className="flex items-center gap-2 px-3 py-2 border-l border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
              >
                              <WebIcon icon="calendar" className="w-3.5 h-3.5 text-gray-600" />
                <span className="text-sm text-gray-700">{endDate}</span>
                              <WebIcon icon="chevron_down" className="w-4 h-4 text-gray-600" />
              </button>
              {showEndDatePicker && (
                <input 
                  type="date" 
                  className="absolute top-full mt-1 z-50 border border-gray-300 rounded-lg p-2"
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    setEndDate(`${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`);
                    setShowEndDatePicker(false);
                  }}
                  autoFocus
                />
              )}
            </div>

            {/* Time Period Dropdown */}
            <div className="relative dropdown-container">
              <button 
                onClick={() => setShowTimePeriodDropdown(!showTimePeriodDropdown)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm text-gray-700">{timePeriod}</span>
                              <WebIcon icon="chevron_down" className="w-4 h-4 text-gray-600" />
              </button>
              {showTimePeriodDropdown && (
                <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[120px]">
                  {['Monthly', 'Weekly', 'Daily'].map((period) => (
                    <button
                      key={period}
                      onClick={() => {
                        setTimePeriod(period);
                        setShowTimePeriodDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {period}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-5 mb-4">
          {Object.entries(COLORS).map(([key, color]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-sm text-gray-700 capitalize">{key}</span>
            </div>
          ))}
        </div>
        <div className="h-48 sm:h-56 md:h-64 lg:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 10, bottom: 28, left: 10 }}>
              <CartesianGrid horizontal={false} vertical={false} />
              {monthTicks.map((tick, idx) => (
                <ReferenceLine key={`ref-${idx}`} x={tick} stroke="#F3F4F6" strokeWidth={1} />
              ))}
              <XAxis
                type="number"
                dataKey="x"
                domain={[0.5, monthTicks[monthTicks.length - 1] + 4]}
                ticks={monthTicks}
                tickFormatter={(value) => monthLabels[monthTicks.indexOf(Math.round(value))] || ""}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                interval={0}
                height={30}
              />
              <YAxis type="number" dataKey="y" domain={[0, 70]} axisLine={false} tickLine={false} tick={false} width={0} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#eef2ff", strokeWidth: 1 }} />
                          <Scatter
                              data={scatterData}
                              shape={<CustomScatterPoint />}
                              isAnimationActive={true}
                              animationBegin={200}
                              animationDuration={900}
                              animationEasing="ease-out"
                          />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RIGHT: Donut */}
      <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl md:shadow-2xl flex flex-col">
        {/* Header with Title and Icons */}
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex items-center gap-1 md:gap-2">
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">Positive Samples detected</h1>
                      <WebIcon icon="chevron_down" className="hidden sm:block text-gray-600 w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <WebIcon icon="printer" className="w-6 h-6 text-gray-700" />
            </button>
                      <button className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors" onClick={() => { setDownloadSuccess(true); setShowDownloadModal(true); }}>
                          <WebIcon icon="download" className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4 md:mb-6">
          {/* Start Date Picker */}
          <div className="relative dropdown-container">
            <button 
              onClick={() => setShowRightStartDatePicker(!showRightStartDatePicker)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-gray-50 transition-colors"
            >
                          <WebIcon icon="calendar" className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-xs text-gray-600">{rightStartDate}</span>
                          <WebIcon icon="chevron_down" className="w-4 h-4 text-gray-600" />
            </button>
            {showRightStartDatePicker && (
              <input 
                type="date" 
                className="absolute top-full mt-1 z-50 border border-gray-300 rounded-lg p-2"
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  setRightStartDate(`${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`);
                  setShowRightStartDatePicker(false);
                }}
                autoFocus
              />
            )}
          </div>
          
          {/* End Date Picker */}
          <div className="relative dropdown-container">
            <button 
              onClick={() => setShowRightEndDatePicker(!showRightEndDatePicker)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-gray-50 transition-colors"
            >
                          <WebIcon icon="calendar" className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-xs text-gray-600">{rightEndDate}</span>
                          <WebIcon icon="chevron_down" className="w-4 h-4 text-gray-600" />
            </button>
            {showRightEndDatePicker && (
              <input 
                type="date" 
                className="absolute top-full mt-1 z-50 border border-gray-300 rounded-lg p-2"
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  setRightEndDate(`${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`);
                  setShowRightEndDatePicker(false);
                }}
                autoFocus
              />
            )}
          </div>

          {/* Time Period Dropdown */}
          <div className="relative dropdown-container">
            <button 
              onClick={() => setShowRightTimePeriodDropdown(!showRightTimePeriodDropdown)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-gray-50 transition-colors"
            >
              <span className="text-xs text-gray-600">{rightTimePeriod}</span>
                          <WebIcon icon="chevron_down" className="w-4 h-4 text-gray-600" />
            </button>
            {showRightTimePeriodDropdown && (
              <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[120px]">
                {['Monthly', 'Weekly', 'Daily'].map((period) => (
                  <button
                    key={period}
                    onClick={() => {
                      setRightTimePeriod(period);
                      setShowRightTimePeriodDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {period}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter Type Dropdown */}
          <div className="relative dropdown-container">
            <button 
              onClick={() => setShowRightFilterDropdown(!showRightFilterDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#412461] text-white rounded-full hover:bg-[#7C3AED] transition-colors"
            >
              <span className="text-xs font-medium">{rightFilterType}</span>
                          <WebIcon icon="chevron_down" className="w-4 h-4 text-white" />
            </button>
            {showRightFilterDropdown && (
              <div className="absolute top-full mt-1 bg-[#6B21A8] rounded-lg shadow-lg z-50 min-w-[100px]">
                {['All', 'Bacteria', 'Fungi', 'Virus', 'Parasite', 'Others'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setRightFilterType(filter);
                      setShowRightFilterDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-white hover:bg-[#7C3AED] first:rounded-t-lg last:rounded-b-lg"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Donut Chart Container */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={donutRadii.innerRadius}
                  outerRadius={donutRadii.outerRadius}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={8}
                >
                  {donutData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                              <Tooltip content={<DonutTooltip />} cursor={false} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Content inside Donut */}
            <div className="absolute inset-[15%] flex shadow-lg rounded-full flex-col items-center justify-center pointer-events-none">
              <div className="flex flex-col gap-1 mb-1 md:mb-2">
                {legendData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between gap-2 md:gap-3 min-w-[120px] md:min-w-[140px]">
                    <div className="flex items-center gap-1 md:gap-2">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full" style={{ background: item.color }} />
                      <span className="text-[10px] md:text-xs font-semibold text-gray-900">{item.value}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp size={10} className={`hidden sm:block md:w-3 md:h-3 ${item.trendColor === "green" ? "text-green-500" : "text-red-500"}`} />
                      <span className="text-[10px] md:text-xs text-gray-600">{item.percentage}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-sm md:text-base font-bold text-gray-900">Total: {donutTotal}</div>
              <div className="text-[10px] md:text-xs text-purple-600">Facilities: 30</div>
            </div>
          </div>
        </div>

        {/* Bottom Legend */}
        <div className="flex flex-wrap items-center gap-4 justify-center pt-4 border-t border-gray-100">
          {legendData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
              <span className="text-sm text-gray-700">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default FullDashboard;