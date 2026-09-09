import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { getUserFromLocalStorage, getAccessTokenFromLocalStorage } from "../redux/reducers/userReducer";

const RoleGuard = ({ allowedRoles = [] }) => {
	const user = useSelector((state) => state.userState?.user);
	const localUser = getUserFromLocalStorage();
	const token = getAccessTokenFromLocalStorage();
	const currentUser = localUser?.role ? localUser : user;

	if (!token || !currentUser?.role) {
		return <Navigate to="/login" replace />;
	}

	const userRole = String(currentUser.role).toLowerCase();
	const normalizedAllowed = allowedRoles.map((r) => String(r).toLowerCase());

	if (!normalizedAllowed.includes(userRole)) {
		if (["superadmin", "admin"].includes(userRole)) {
			return <Navigate to="/admin" replace />;
		}
		if (userRole === "reviewer") {
			return <Navigate to="/reviewer" replace />;
		}
		if (userRole === "tagger" || userRole === "sampler") {
			return <Navigate to="/tagger/models" replace />;
		}
		return <Navigate to="/login" replace />;
	}

	return <Outlet />;
};

export default RoleGuard;
