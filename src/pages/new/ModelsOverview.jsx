import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import OverviewSection from "../../components/ui/overview-section";

const ModelsOverview = ({ data }) => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const isCompletedView = searchParams.get("type") === "completed";

	const {
		totalModels = 0,
		activeModels = 0,
		completedModels = 0,
		deletedModels = 0,
	} = data || {};

	const generateMockChartData = (baseValue) => {
		const points = [];
		for (let i = 0; i < 7; i++) {
			points.push(baseValue + Math.random() * 20 - 10);
		}
		return points;
	};

	const statsCards = [
		{
			icon: "activity",
			title: "Total Facilities",
			count: totalModels,
			trend: "+34",
			trendLabel: "to last month",
			chartData: generateMockChartData(totalModels),
			iconBgColor: "bg-purple-100",
			iconColor: "text-purple-600",
			trendColor: "text-green-500",
		},
		{
			icon: "check_clipboard",
			title: "Completed Facilities",
			count: completedModels,
			trend: "+1",
			trendLabel: "to last month",
			chartData: generateMockChartData(completedModels),
			iconBgColor: "bg-red-100",
			iconColor: "text-red-600",
			trendColor: "text-red-500",
			onClick: () => navigate("/admin/models?type=completed"),
			isClickable: !isCompletedView,
		},
		{
			icon: "activity",
			title: "Active Facilities",
			count: activeModels,
			trend: "+200",
			trendLabel: "to last month",
			chartData: generateMockChartData(activeModels),
			iconBgColor: "bg-green-100",
			iconColor: "text-green-600",
			trendColor: "text-green-500",
			onClick: () => navigate("/admin/models"),
			isClickable: isCompletedView,
		},
		{
			icon: "Trash",
			title: "Deleted Facilities",
			count: deletedModels,
			trend: "+0",
			trendLabel: "to last month",
			chartData: generateMockChartData(deletedModels),
			iconBgColor: "bg-orange-100",
			iconColor: "text-orange-600",
			trendColor: "text-red-500",
			onClick: () => navigate("/admin/trash"),
			isClickable: true,
		},
	];

	const filters = [
		{ label: "Start Date", showDropdown: true, onClick: () => {} },
		{ label: "End Date", showDropdown: true, onClick: () => {} },
		{ label: "Monthly", showDropdown: true, onClick: () => {} },
	];

	return (
		<OverviewSection
			title="Overview"
			welcomeMessage="Here's a quick look at all your activities across facilities."
			filters={filters}
			statsCards={statsCards}
		/>
	);
};

export default ModelsOverview;
