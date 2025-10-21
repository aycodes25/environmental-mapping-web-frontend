import React from "react";
import { useNavigate } from "react-router-dom";
import StatsCard from "../../components/ui/stats-card";

const DashboardOverview = ({ dashboardData }) => {
	const navigate = useNavigate();

	const {
		totalTagsThisMonth = 0,
		totalModels = 0,
		totalReviewers = 0,
		totalTaggers = 0,
		todaysModels = 0,
	} = dashboardData;

	// Mock chart data for trend visualization
	const generateMockChartData = (baseValue) => {
		const data = [];
		for (let i = 0; i < 7; i++) {
			data.push(baseValue + Math.random() * 20 - 10);
		}
		return data;
	};

	const statsCards = [
		{
			icon: "activity",
			title: "Total Samples",
			count: totalTagsThisMonth,
			trend: "+1",
			trendLabel: "to last month",
			chartData: generateMockChartData(totalTagsThisMonth),
			iconBgColor: "bg-purple-100",
			iconColor: "text-purple-600",
			trendColor: "text-red-500",
		},
		{
			icon: "facility",
			title: "Total Facilities",
			count: totalModels,
			trend: "+34",
			trendLabel: "to last month",
			chartData: generateMockChartData(totalModels),
			iconBgColor: "bg-blue-100",
			iconColor: "text-blue-600",
			trendColor: "text-green-500",
			onClick: () => navigate("models"),
			isClickable: true,
		},
		{
			icon: "activity",
			title: "Total Reviewers",
			count: totalReviewers,
			trend: "+200",
			trendLabel: "to last month",
			chartData: generateMockChartData(totalReviewers),
			iconBgColor: "bg-green-100",
			iconColor: "text-green-600",
			trendColor: "text-green-500",
			onClick: () => navigate("users"),
			isClickable: true,
		},
		{
			icon: "activity",
			title: "Total Samplers",
			count: totalTaggers,
			trend: "+0",
			trendLabel: "to last month",
			chartData: generateMockChartData(totalTaggers),
			iconBgColor: "bg-orange-100",
			iconColor: "text-orange-600",
			trendColor: "text-red-500",
			onClick: () => navigate("users"),
			isClickable: true,
		},
	];

	return (
		<div className="flex flex-col gap-8 p-6">
			{/* Welcome Section */}
			<div className="mb-6">
				<h1 className="heading-regular font-semibold text-primary mb-2">
					Welcome back!
				</h1>
				<p className="text-bold text-black font-normal">
					Here's a quick look at your recent activity and ongoing tasks.
				</p>
			</div>

			{/* Overview Heading */}
			<div className="flex items-center justify-between">
				<h2 className="text-bold font-bold text-primary">Overview</h2>

				{/* Date Filter Controls */}
				<div className="flex items-center gap-3">
					<button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
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
								d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
						Start Date
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
					</button>

					<button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
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
								d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
						End Date
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
					</button>

					<button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
						Monthly
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
					</button>
				</div>
			</div>

			{/* Stats Cards Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{statsCards.map((card, index) => (
					<StatsCard key={index} {...card} />
				))}
			</div>
		</div>
	);
};

export default DashboardOverview;
