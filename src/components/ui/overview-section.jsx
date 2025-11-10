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

				{/* Filters removed as requested */}
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
