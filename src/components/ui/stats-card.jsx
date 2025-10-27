import React from "react";
import PropTypes from "prop-types";
import WebIcon from "../custom/WebIcons";

const StatsCard = ({
	icon,
	title,
	count,
	trend,
	trendLabel = "to last month",
	chartData = [],
	iconBgColor = "bg-purple-100",
	iconColor = "text-purple-600",
	trendColor = "text-red-500",
	onClick,
	isClickable = false,
}) => {
	const max = Math.max(...chartData);
	const min = Math.min(...chartData);
	const range = max - min || 1;

	const points = chartData
		.map((value, index) => {
			const x = (index / (chartData.length - 1)) * 100;
			const y = 100 - ((value - min) / range) * 100;
			return `${x},${y}`;
		})
		.join(" ");

	const CardContent = () => (
		<div className="bg-white rounded-2xl p-4 w-[262px] shadow-md flex flex-col gap-5">
			{/* Top Section: Title & More Icon */}
			<div className="flex justify-between items-center">
				<div className="flex items-center gap-3">
					<div className={`bg-purple-100 p-2 rounded-full`}>
						<WebIcon icon={icon} className={`w-5 h-5 ${iconColor}`} />
					</div>
					<h3 className="text-bold text-primary font-normal">{title}</h3>
				</div>
				<button className="text-black hover:text-gray-700">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
						<circle cx="12" cy="6" r="1.5" fill="currentColor" />
						<circle cx="12" cy="12" r="1.5" fill="currentColor" />
						<circle cx="12" cy="18" r="1.5" fill="currentColor" />
					</svg>
				</button>
			</div>

			{/* Middle & Bottom Section */}
			<div className="flex justify-between items-end">
				{/* Left Side: Count and Trend */}
				<div className="flex flex-col gap-5">
					<div className="heading-large-x font-bold text-primary">
						{count}
					</div>
					<div className="flex items-center gap-1 text-sm">
						<svg
							className={`w-4 h-4 ${trendColor}`}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
							/>
						</svg>
						<span className={`font-medium ${trendColor}`}>{trend}</span>
						<span className="text-regular text-primary whitespace-nowrap">
							{trendLabel}
						</span>
					</div>
				</div>

				{/* Right Side: Chart */}
				<div className="relative w-28 h-16">
					<svg
						viewBox="0 0 100 100"
						className="w-full h-full"
						preserveAspectRatio="none"
					>
						<defs>
							<linearGradient
								id="chartGradient"
								x1="0"
								y1="0"
								x2="0"
								y2="1"
							>
								<stop
									offset="0%"
									stopColor="#ef4444"
									stopOpacity="0.4"
								/>
								<stop
									offset="100%"
									stopColor="#ef4444"
									stopOpacity="0"
								/>
							</linearGradient>
						</defs>
						<path
							d={`M0,100 ${points} L100,100 Z`}
							fill="url(#chartGradient)"
						/>
						<polyline
							points={points}
							fill="none"
							stroke="#ef4444"
							strokeWidth="3"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<circle
							cx={
								chartData.length > 1
									? ((chartData.length - 1) / (chartData.length - 1)) *
									  100
									: 100
							}
							cy={
								chartData.length > 0
									? 100 -
									  ((chartData[chartData.length - 1] - min) / range) *
											100
									: 50
							}
							r="4"
							fill="#ef4444"
						/>
					</svg>
				</div>
			</div>
		</div>
	);

	if (isClickable && onClick) {
		return (
			<button onClick={onClick} className="text-left">
				<CardContent />
			</button>
		);
	}

	return <CardContent />;
};

StatsCard.propTypes = {
	icon: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	trend: PropTypes.string.isRequired,
	trendLabel: PropTypes.string,
	chartData: PropTypes.arrayOf(PropTypes.number),
	iconBgColor: PropTypes.string,
	iconColor: PropTypes.string,
	trendColor: PropTypes.string,
	onClick: PropTypes.func,
	isClickable: PropTypes.bool,
};

export default StatsCard;
