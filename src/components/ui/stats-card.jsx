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
		<div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 w-full max-w-md">
			<div className="flex items-start justify-between mb-6">
				<div className="flex items-center gap-3">
					<div className={`${iconBgColor} p-3 rounded-2xl`}>
						<WebIcon icon={icon} className={`w-6 h-6 ${iconColor}`} />
					</div>
					<h3 className="text-bold text-primary font-normal">{title}</h3>
				</div>
				<button className="text-gray-400 hover:text-gray-600">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
						<circle cx="12" cy="6" r="1.5" fill="currentColor" />
						<circle cx="12" cy="12" r="1.5" fill="currentColor" />
						<circle cx="12" cy="18" r="1.5" fill="currentColor" />
					</svg>
				</button>
			</div>

			<div className="flex items-end justify-between">
				<div>
					<div className="heading-medium font-normal text-primary mb-2">
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
						<span className="text-small text-primary whitespace-nowrap">
							{trendLabel}
						</span>
					</div>
				</div>

				<div className="relative w-48 h-20">
					<svg
						viewBox="0 0 100 100"
						className="w-full h-full"
						preserveAspectRatio="none"
					>
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
								chartData.length > 0
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
			<button onClick={onClick} className="w-full">
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
