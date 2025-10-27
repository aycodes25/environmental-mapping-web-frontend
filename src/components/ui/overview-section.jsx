import React from "react";
import StatsCard from "./stats-card";
import WebIcon from "../custom/WebIcons";

const OverviewSection = ({
	// Header content
	title = "Overview",
	subtitle = "",
	welcomeMessage = "",

	// Filter controls
	filters = [],

	// Stats cards
	statsCards = [],

	// Layout options
	className = "",
}) => {
	return (
		<div className={`flex flex-col gap-8 p-6 ${className}`}>
			{/* Welcome Section - only show if welcomeMessage is provided */}
			{welcomeMessage && (
				<div className="mb-6">
					<h1 className="heading-regular font-semibold text-primary mb-2">
						{title}
					</h1>
					<p className="text-bold text-black font-normal">
						{welcomeMessage}
					</p>
				</div>
			)}

			{/* Overview Heading and Filters */}
			<div className="flex items-center justify-between">
				{/* Title - show different title if no welcome message */}
				{!welcomeMessage && (
					<h2 className="text-bold font-bold text-primary">{title}</h2>
				)}
				{welcomeMessage && (
					<h2 className="text-bold font-bold text-primary">Overview</h2>
				)}

				{/* Filter Controls */}
				{filters.length > 0 && (
					<div className="flex items-center gap-3">
						{filters.map((filter, index) => (
							<button
								key={index}
								onClick={filter.onClick}
								className={`px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 ${
									filter.className || ""
								}`}
								disabled={filter.disabled}
							>
								{/* Always show calendar icon for all filters */}
								<WebIcon icon="calendar" className="w-4 h-4" />
								{filter.label}
								{filter.showDropdown && (
									<svg
										className="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								)}
							</button>
						))}
					</div>
				)}
			</div>

			{/* Stats Cards Grid */}
			{statsCards.length > 0 && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{statsCards.map((card, index) => (
						<StatsCard key={index} {...card} />
					))}
				</div>
			)}
		</div>
	);
};

export default OverviewSection;
