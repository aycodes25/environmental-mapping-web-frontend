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
		<div className={`flex flex-col gap-4 sm:gap-6 md:gap-8 p-4 sm:p-5 md:p-6 ${className}`}>
			{/* Welcome Section - only show if welcomeMessage is provided */}
			{welcomeMessage && (
				<div className="mb-4 sm:mb-6">
					<h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-primary mb-1 sm:mb-2">
						{title}
					</h1>
					<p className="text-sm sm:text-base text-black font-normal">
						{welcomeMessage}
					</p>
				</div>
			)}

			{/* Overview Heading and Filters */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
				{/* Title - show different title if no welcome message */}
				{!welcomeMessage && (
					<h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary">{title}</h2>
				)}
				{welcomeMessage && (
					<h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary">Overview</h2>
				)}

				{/* Filter Controls */}
				{filters.length > 0 && (
					<div className="flex items-center flex-wrap gap-2 sm:gap-3">
						{filters.map((filter, index) => (
							<button
								key={index}
								onClick={filter.onClick}
								className={`px-3 py-1.5 sm:px-4 sm:py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5 sm:gap-2 ${
									filter.className || ""
								}`}
								disabled={filter.disabled}
							>
								{/* Always show calendar icon for all filters */}
								<WebIcon icon="calendar" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
								<span className="whitespace-nowrap">{filter.label}</span>
								{filter.showDropdown && (
									<svg
										className="w-3.5 h-3.5 sm:w-4 sm:h-4"
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
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
					{statsCards.map((card, index) => (
						<StatsCard key={index} {...card} />
					))}
				</div>
			)}
		</div>
	);
};

export default OverviewSection;
