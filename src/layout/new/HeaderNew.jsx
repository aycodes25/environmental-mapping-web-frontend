import React from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { getUserFromLocalStorage } from "../../redux/reducers/userReducer";
import WebIcon from "../../components/custom/WebIcons";

const HeaderNew = () => {
	const user = useSelector((s) => s.userState.user);
	const currentUser = getUserFromLocalStorage() || user;
	const location = useLocation();

	// Get the current page title based on the route
	const getPageTitle = () => {
		const pathname = location.pathname;
		if (pathname.includes("/admin")) return "Facilities";
		if (pathname.includes("/tagger")) return "Facilities";
		if (pathname.includes("/reviewer")) return "Facilities";
		if (pathname.includes("/models")) return "Facility Sections";
		if (pathname.includes("/users")) return "Users";
		if (pathname.includes("/location")) return "Facility";
		if (pathname.includes("/report")) return "Report";
		if (pathname.includes("/trash")) return "Recycle Bin";
		return "Facilities"; // Default title
	};

	return (
		<div
			className="h-20 flex items-center px-6 border-b-2 border-lightGrey bg-surface"
			style={{ boxShadow: "0 6px 24px rgba(0, 0, 0, 0.5)" }}
		>
			<div className="text-xl font-bold text-primary">{getPageTitle()}</div>
		</div>
	);
};

export default HeaderNew;
