import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { customFetch } from "../../utils";
import { toast } from "react-toastify";
import DashboardOverview from "./DashboardOverview";
import { FullDashboard, ActivitiesLog } from "../../components";

const url = "/user/dashboard";

const DashboardNew = () => {
	const navigate = useNavigate();
	const [dashboardData, setDashboardData] = useState({});


	const fetchData = async () => {
		try {
			const response = await customFetch(url);
			if (response.data.status !== "error") {
				setDashboardData(response.data);
			} else {
				toast.error(response.data.message);
			}
		} catch (error) {
			console.error("Error fetching dashboard data:", error);
			toast.error("Failed to load dashboard data");
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	return (
		<div className="flex flex-col flex-grow w-auto">
			<DashboardOverview dashboardData={dashboardData} />
			<FullDashboard />
			<ActivitiesLog />
		</div>
	);
};

export default DashboardNew;
