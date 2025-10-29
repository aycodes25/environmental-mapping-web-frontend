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
const BASE_PALETTE = [
	"#7E45D3",
	"#412461",
	"#D1B1F4",
	"#F472B6",
	"#34D399",
	"#60A5FA",
	"#F59E0B",
	"#10B981",
	"#EF4444",
	"#6366F1",
];

const buildPaletteMap = (keys = []) => {
	const map = new Map();
	keys.forEach((k, i) => map.set(k, BASE_PALETTE[i % BASE_PALETTE.length]));
	return map;
};

/* ---------------- Helpers ---------------- */
const monthLabels = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];
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
	const color = payload.color || "#8884d8";
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
		<div
			className="bg-white p-3 rounded-lg shadow-lg border border-gray-100 text-xs"
			style={{ minWidth: 180 }}
		>
			<div className="text-xs font-semibold text-gray-800">
				{p.location || p.category || p.month}
			</div>
			{p.facility && (
				<div className="text-[11px] text-gray-600 mt-1">{p.facility}</div>
			)}
			<div className="text-gray-500 mt-2">
				{formatNumberLabel(p.value)} {p.location ? "Tags" : "Total"}
			</div>
		</div>
	);
};

/* ---------------- Donut Tooltip ---------------- */
const DonutTooltip = ({ active, payload }) => {
	if (!active || !payload?.length) return null;
	const p = payload[0].payload; // { name, value, color }
	return (
		<div
			className="bg-white p-3 rounded-lg shadow-lg border border-gray-100 text-xs"
			style={{ minWidth: 160 }}
		>
			<div className="flex items-center gap-2">
				<div
					style={{
						width: 10,
						height: 10,
						borderRadius: 6,
						background: p.color,
					}}
				/>
				<div className="text-sm font-semibold text-gray-800">{p.name}</div>
			</div>
			<div className="text-gray-600 mt-2">
				Value:{" "}
				<span className="font-semibold">{formatNumberLabel(p.value)}</span>
			</div>
		</div>
	);
};

/* ---------------- FullDashboard ---------------- */
const FullDashboard = ({ dashboardData = {} }) => {
	const [startDate, setStartDate] = useState("10/02/2023");
	const [endDate, setEndDate] = useState("End Date");
	const [timePeriod, setTimePeriod] = useState("Monthly");
	const [filterType, setFilterType] = useState("All"); // All | Sample | Incident
	const [showStartDatePicker, setShowStartDatePicker] = useState(false);
	const [showEndDatePicker, setShowEndDatePicker] = useState(false);
	const [showTimePeriodDropdown, setShowTimePeriodDropdown] = useState(false);
	const [showFilterDropdown, setShowFilterDropdown] = useState(false);

	// Right side (Donut chart) states
	const [rightStartDate, setRightStartDate] = useState("Start Date");
	const [rightEndDate, setRightEndDate] = useState("End Date");
	const [rightTimePeriod, setRightTimePeriod] = useState("Monthly");
	const [rightFilterType, setRightFilterType] = useState("All");
	const [showRightStartDatePicker, setShowRightStartDatePicker] =
		useState(false);
	const [showRightEndDatePicker, setShowRightEndDatePicker] = useState(false);
	const [showRightTimePeriodDropdown, setShowRightTimePeriodDropdown] =
		useState(false);
	const [showRightFilterDropdown, setShowRightFilterDropdown] =
		useState(false);
	const [showDownloadModal, setShowDownloadModal] = useState(false);
	const [downloadSuccess, setDownloadSuccess] = useState(true);

	// Build scatter bubbles based on selected filterType
	const scatterData = useMemo(() => {
		// Overview: use recentlyViewedModels grouped by location → facilities as bubbles
		if (filterType === "All") {
			const rec = dashboardData?.recentlyViewedModels;
			if (Array.isArray(rec) && rec.length > 0) {
				const locationToIndex = new Map();
				let locIdx = 0;
				const points = [];
				rec.forEach((m, idx) => {
					const locationName = m?.location?.name || "Unknown";
					if (!locationToIndex.has(locationName))
						locationToIndex.set(locationName, locIdx++);
					const lane = locationToIndex.get(locationName);
					const createdAt = m?.createdAt ? new Date(m.createdAt) : null;
					const mi = createdAt ? createdAt.getMonth() : idx % 12;
					const baseX = monthTicks[mi] ?? monthTicks[0];
					const jitter = ((idx % 5) - 2) * 0.36;
					const x = baseX + jitter;
					const y = clamp(10 + lane * 10, 8, 62);
					const value = Array.isArray(m?.tags)
						? Math.max(1, m.tags.length)
						: 1;
					const color = BASE_PALETTE[lane % BASE_PALETTE.length];
					points.push({
						id: idx + 1,
						month: monthLabels[mi],
						value,
						y,
						x,
						color,
						location: locationName,
						facility: m?.modelName || m?.slug || "Facility",
					});
				});
				return points;
			}
			return [];
		}

		// Sample: TotalTagsBySampleAndMonth is an object keyed by organism → [{ totalTags, month }]
		if (filterType === "Sample") {
			const bySample = dashboardData?.TotalTagsBySampleAndMonth;
			if (bySample && typeof bySample === "object") {
				const organisms = Object.keys(bySample);
				const palette = buildPaletteMap(organisms);
				const points = [];
				organisms.forEach((org, orgIdx) => {
					const items = Array.isArray(bySample[org]) ? bySample[org] : [];
					items.forEach((it, idx) => {
						const mi =
							typeof it.month === "number"
								? clamp(it.month, 1, 12) - 1
								: idx % 12;
						const baseX = monthTicks[mi] ?? monthTicks[0];
						const jitter = ((idx % 5) - 2) * 0.36;
						const x = baseX + jitter;
						const y = clamp(10 + orgIdx * 10, 8, 62);
						const value = Number(it.totalTags) || 0;
						points.push({
							id: `${org}-${idx}`,
							month: monthLabels[mi],
							value,
							y,
							x,
							color: palette.get(org),
							category: org,
						});
					});
				});
				return points;
			}
			return [];
		}

		// Incident: TotalIncidentsByMonth is an object keyed by incident → [{ totalTags, month }]
		if (filterType === "Incident") {
			const byIncident = dashboardData?.TotalIncidentsByMonth;
			if (byIncident && typeof byIncident === "object") {
				const incidents = Object.keys(byIncident);
				const palette = buildPaletteMap(incidents);
				const points = [];
				incidents.forEach((inc, incIdx) => {
					const items = Array.isArray(byIncident[inc])
						? byIncident[inc]
						: [];
					items.forEach((it, idx) => {
						const mi =
							typeof it.month === "number"
								? clamp(it.month, 1, 12) - 1
								: idx % 12;
						const baseX = monthTicks[mi] ?? monthTicks[0];
						const jitter = ((idx % 5) - 2) * 0.36;
						const x = baseX + jitter;
						const y = clamp(10 + incIdx * 10, 8, 62);
						const value = Number(it.totalTags) || 0;
						points.push({
							id: `${inc}-${idx}`,
							month: monthLabels[mi],
							value,
							y,
							x,
							color: palette.get(inc),
							category: inc,
						});
					});
				});
				return points;
			}
			return [];
		}

		return [];
	}, [dashboardData, filterType]);

	// Donut: switch by rightFilterType (use same semantics: All/Sample/Incident)
	const computedDonut = useMemo(() => {
		const mode = rightFilterType;
		if (mode === "All") {
			const byLocation = dashboardData?.modelsInEachLocation;
			if (Array.isArray(byLocation) && byLocation.length > 0) {
				const names = byLocation.map((l) => l.locationName || "Location");
				const palette = buildPaletteMap(names);
				return byLocation.map((loc) => ({
					name: loc.locationName || "Location",
					value: Number(loc.totalModels) || 0,
					color: palette.get(loc.locationName || "Location"),
				}));
			}
			return [];
		}
		if (mode === "Sample") {
			const bySample = dashboardData?.TotalTagsBySampleAndMonth;
			if (bySample && typeof bySample === "object") {
				const organisms = Object.keys(bySample);
				const totals = organisms.map((org) => ({
					name: org,
					value: (bySample[org] || []).reduce(
						(s, it) => s + (Number(it.totalTags) || 0),
						0
					),
				}));
				const palette = buildPaletteMap(organisms);
				return totals.map((t) => ({ ...t, color: palette.get(t.name) }));
			}
			return [];
		}
		if (mode === "Incident") {
			const byIncident = dashboardData?.TotalIncidentsByMonth;
			if (byIncident && typeof byIncident === "object") {
				const incidents = Object.keys(byIncident);
				const totals = incidents.map((inc) => ({
					name: inc,
					value: (byIncident[inc] || []).reduce(
						(s, it) => s + (Number(it.totalTags) || 0),
						0
					),
				}));
				const palette = buildPaletteMap(incidents);
				return totals.map((t) => ({ ...t, color: palette.get(t.name) }));
			}
			return [];
		}
		return [];
	}, [dashboardData, rightFilterType]);

	const donutTotal = useMemo(
		() => computedDonut.reduce((s, d) => s + (Number(d.value) || 0), 0),
		[computedDonut]
	);

	// Calculate responsive donut radii based on container size
	const getDonutRadii = () => {
		const innerRadius =
			window.innerWidth < 640 ? 80 : window.innerWidth < 768 ? 90 : 100;
		const outerRadius =
			window.innerWidth < 640 ? 112 : window.innerWidth < 768 ? 126 : 140;
		return { innerRadius, outerRadius };
	};

	const [donutRadii, setDonutRadii] = useState(getDonutRadii());

	// Update radii on resize
	useEffect(() => {
		const handleResize = () => setDonutRadii(getDonutRadii());
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Close dropdowns when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (!event.target.closest(".dropdown-container")) {
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
		document.addEventListener("click", handleClickOutside);
		return () => document.removeEventListener("click", handleClickOutside);
	}, []);

	// Helper to render dynamic legend for the left chart
	const renderLeftLegend = () => {
		if (filterType === "All") {
			const rec = Array.isArray(dashboardData?.recentlyViewedModels)
				? dashboardData.recentlyViewedModels
				: [];
			const names = Array.from(
				new Set(rec.map((m) => m?.location?.name || "Unknown"))
			);
			const palette = buildPaletteMap(names);
			return names.map((n) => (
				<div key={n} className="flex items-center gap-2">
					<div
						className="w-4 h-4 rounded-full"
						style={{ backgroundColor: palette.get(n) }}
					/>
					<span className="text-sm text-gray-700 capitalize">{n}</span>
				</div>
			));
		}
		const source =
			filterType === "Sample"
				? dashboardData?.TotalTagsBySampleAndMonth
				: dashboardData?.TotalIncidentsByMonth;
		const keys =
			source && typeof source === "object" ? Object.keys(source) : [];
		const palette = buildPaletteMap(keys);
		return keys.map((k) => (
			<div key={k} className="flex items-center gap-2">
				<div
					className="w-4 h-4 rounded-full"
					style={{ backgroundColor: palette.get(k) }}
				/>
				<span className="text-sm text-gray-700 capitalize">{k}</span>
			</div>
		));
	};

	return (
		<div className="grid mx-2 sm:mx-4 lg:mx-5 grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-10">
			<MessageModal
				isOpen={showDownloadModal}
				onClose={() => setShowDownloadModal(false)}
				variant={downloadSuccess ? "success" : "error"}
				reportId="I-0125"
				onRetry={() => {
					setDownloadSuccess(true);
					setShowDownloadModal(false);
				}}
				onCancel={() => setShowDownloadModal(false)}
			/>
			{/* LEFT: Scatter */}
			<div className="bg-white rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl p-4 md:p-6">
				{/* Header Section */}
				<div className="mb-6">
					{/* Title with dropdown chevron */}
					<div className="flex items-center justify-between mb-3 md:mb-4">
						<div className="flex items-center gap-1 md:gap-2">
							<h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
								{filterType === "All"
									? "Facilities by Location"
									: filterType === "Sample"
									? "Samples by Organism"
									: "Incidents by Type"}
							</h1>
							<WebIcon
								icon="chevron_down"
								className="w-4 h-4 md:w-5 md:h-5 text-gray-600"
							/>
						</div>
						{/* Action icons & FilterType */}
						<div className="flex items-center gap-3">
							<div className="relative dropdown-container">
								<button
									onClick={() =>
										setShowFilterDropdown(!showFilterDropdown)
									}
									className="flex items-center gap-2 px-3 py-1.5 bg-[#412461] text-white rounded-full hover:bg-[#7C3AED]"
								>
									<span className="text-xs font-medium">
										{filterType}
									</span>
									<WebIcon
										icon="chevron_down"
										className="w-4 h-4 text-white"
									/>
								</button>
								{showFilterDropdown && (
									<div className="absolute right-0 top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[120px]">
										{["All", "Sample", "Incident"].map((opt) => (
											<button
												key={opt}
												onClick={() => {
													setFilterType(opt);
													setShowFilterDropdown(false);
												}}
												className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
											>
												{opt}
											</button>
										))}
									</div>
								)}
							</div>
							<button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
								<WebIcon
									icon="printer"
									className="w-6 h-6 text-gray-700"
								/>
							</button>
							<button
								className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
								onClick={() => {
									setDownloadSuccess(false);
									setShowDownloadModal(true);
								}}
							>
								<WebIcon
									icon="download"
									className="w-6 h-6 text-gray-700"
								/>
							</button>
						</div>
					</div>

					{/* Legend */}
					<div className="flex flex-wrap items-center gap-5 mb-4">
						{renderLeftLegend()}
					</div>
				</div>
				<div className="h-48 sm:h-56 md:h-64 lg:h-72">
					<ResponsiveContainer width="100%" height="100%">
						<ScatterChart
							margin={{ top: 8, right: 10, bottom: 28, left: 10 }}
						>
							<CartesianGrid horizontal={false} vertical={false} />
							{monthTicks.map((tick, idx) => (
								<ReferenceLine
									key={`ref-${idx}`}
									x={tick}
									stroke="#F3F4F6"
									strokeWidth={1}
								/>
							))}
							<XAxis
								type="number"
								dataKey="x"
								domain={[0.5, monthTicks[monthTicks.length - 1] + 4]}
								ticks={monthTicks}
								tickFormatter={(value) =>
									monthLabels[monthTicks.indexOf(Math.round(value))] ||
									""
								}
								axisLine={false}
								tickLine={false}
								tick={{ fill: "#9CA3AF", fontSize: 11 }}
								interval={0}
								height={30}
							/>
							<YAxis
								type="number"
								dataKey="y"
								domain={[0, 70]}
								axisLine={false}
								tickLine={false}
								tick={false}
								width={0}
							/>
							<Tooltip
								content={<CustomTooltip />}
								cursor={{ stroke: "#eef2ff", strokeWidth: 1 }}
							/>
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
						<h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
							{rightFilterType === "All"
								? "Positive Samples detected"
								: rightFilterType === "Sample"
								? "Samples by Organism"
								: "Incidents by Type"}
						</h1>
						<WebIcon
							icon="chevron_down"
							className="hidden sm:block text-gray-600 w-4 h-4 md:w-5 md:h-5"
						/>
					</div>
					<div className="flex items-center gap-3">
						<button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
							<WebIcon
								icon="printer"
								className="w-6 h-6 text-gray-700"
							/>
						</button>
						<button
							className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
							onClick={() => {
								setDownloadSuccess(true);
								setShowDownloadModal(true);
							}}
						>
							<WebIcon
								icon="download"
								className="w-5 h-5 text-gray-700"
							/>
						</button>
					</div>
				</div>

				{/* Filter Bar */}
				<div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4 md:mb-6">
					{/* Start/End/Time omitted for brevity, keep existing pickers */}
					<div className="relative dropdown-container">
						<button
							onClick={() =>
								setShowRightFilterDropdown(!showRightFilterDropdown)
							}
							className="flex items-center gap-2 px-3 py-1.5 bg-[#412461] text-white rounded-full hover:bg-[#7C3AED] transition-colors"
						>
							<span className="text-xs font-medium">
								{rightFilterType}
							</span>
							<WebIcon
								icon="chevron_down"
								className="w-4 h-4 text-white"
							/>
						</button>
						{showRightFilterDropdown && (
							<div className="absolute top-full mt-1 bg-[#6B21A8] rounded-lg shadow-lg z-50 min-w-[120px]">
								{["All", "Sample", "Incident"].map((opt) => (
									<button
										key={opt}
										onClick={() => {
											setRightFilterType(opt);
											setShowRightFilterDropdown(false);
										}}
										className="w-full text-left px-3 py-2 text-xs text-white hover:bg-[#7C3AED] first:rounded-t-lg last:rounded-b-lg"
									>
										{opt}
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
									data={computedDonut}
									cx="50%"
									cy="50%"
									innerRadius={donutRadii.innerRadius}
									outerRadius={donutRadii.outerRadius}
									paddingAngle={0}
									dataKey="value"
									stroke="none"
									cornerRadius={8}
								>
									{computedDonut.map((entry, i) => (
										<Cell key={`cell-${i}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip content={<DonutTooltip />} cursor={false} />
							</PieChart>
						</ResponsiveContainer>

						{/* Content inside Donut */}
						<div className="absolute inset-[15%] flex shadow-lg rounded-full flex-col items-center justify-center pointer-events-none">
							<div className="flex flex-col gap-1 mb-1 md:mb-2">
								{computedDonut.map((item) => (
									<div
										key={item.name}
										className="flex items-center justify-between gap-2 md:gap-3 min-w-[120px] md:min-w-[140px]"
									>
										<div className="flex items-center gap-1 md:gap-2">
											<div
												className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full"
												style={{ background: item.color }}
											/>
											<span className="text-[10px] md:text-xs font-semibold text-gray-900">
												{item.value}
											</span>
										</div>
										<div className="flex items-center gap-1" />
									</div>
								))}
							</div>
							<div className="text-sm md:text-base font-bold text-gray-900">
								Total: {donutTotal}
							</div>
							<div className="text-[10px] md:text-xs text-purple-600">
								{rightFilterType}
							</div>
						</div>
					</div>
				</div>

				{/* Bottom Legend */}
				<div className="flex flex-wrap items-center gap-4 justify-center pt-4 border-t border-gray-100">
					{computedDonut.map((item) => (
						<div key={item.name} className="flex items-center gap-2">
							<div
								style={{
									width: 10,
									height: 10,
									borderRadius: "50%",
									background: item.color,
								}}
							/>
							<span className="text-sm text-gray-700">{item.name}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default FullDashboard;
