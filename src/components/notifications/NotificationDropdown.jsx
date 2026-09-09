import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCheck, Bell, MessageSquare, AlertTriangle, Tag, FileText, UserCheck, Settings } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const getCategoryIcon = (category) => {
	switch (category) {
		case "Incident":
			return <AlertTriangle className="w-4 h-4 text-red-600" />;
		case "Feedback":
			return <MessageSquare className="w-4 h-4 text-blue-600" />;
		case "Tag":
			return <Tag className="w-4 h-4 text-amber-600" />;
		case "Report":
			return <FileText className="w-4 h-4 text-purple-600" />;
		case "Users":
			return <UserCheck className="w-4 h-4 text-emerald-600" />;
		default:
			return <Settings className="w-4 h-4 text-gray-500" />;
	}
};

const getCategoryBadgeClass = (category) => {
	switch (category) {
		case "Incident":
			return "bg-red-50 text-red-700 border-red-200";
		case "Feedback":
			return "bg-blue-50 text-blue-700 border-blue-200";
		case "Tag":
			return "bg-amber-50 text-amber-700 border-amber-200";
		case "Report":
			return "bg-purple-50 text-purple-700 border-purple-200";
		case "Users":
			return "bg-emerald-50 text-emerald-700 border-emerald-200";
		default:
			return "bg-gray-50 text-gray-700 border-gray-200";
	}
};

const NotificationDropdown = ({
	notifications = [],
	loading = false,
	unreadCount = 0,
	onMarkAsRead,
	onMarkAllAsRead,
	onClose,
	userRole = "admin"
}) => {
	const navigate = useNavigate();
	const location = useLocation();

	const pathLower = (location.pathname || "").toLowerCase();
	let safeRole = "admin";
	if (pathLower.startsWith("/reviewer")) {
		safeRole = "reviewer";
	} else if (pathLower.startsWith("/tagger")) {
		safeRole = "tagger";
	} else if (pathLower.startsWith("/admin")) {
		safeRole = "admin";
	} else {
		safeRole = ["admin", "superadmin"].includes(String(userRole).toLowerCase())
			? "admin"
			: String(userRole).toLowerCase();
	}

	const handleNotificationClick = (item) => {
		if (!item.isRead) {
			onMarkAsRead(item._id);
		}
		onClose();
		if (item.category === "Incident" && item.relatedId) {
			navigate(`/${safeRole}/view-incidents/${item.relatedId}`);
		} else if (item.category === "Feedback") {
			navigate(`/${safeRole}/feedback`);
		} else {
			navigate(`/${safeRole}/notifications`);
		}
	};

	const handleViewAll = () => {
		onClose();
		navigate(`/${safeRole}/notifications`);
	};

	return (
		<div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white border border-gray-200 shadow-2xl z-50 overflow-hidden text-gray-800 animate-in fade-in slide-in-from-top-2 duration-200">
			{/* Header */}
			<div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
				<div className="flex items-center gap-2">
					<Bell className="w-4 h-4 text-primary" />
					<h3 className="font-semibold text-sm text-gray-900">Notifications</h3>
					{unreadCount > 0 && (
						<span className="px-2 py-0.5 text-xs font-bold bg-purple-100 text-primary rounded-full">
							{unreadCount} new
						</span>
					)}
				</div>
				{unreadCount > 0 && (
					<button
						onClick={onMarkAllAsRead}
						className="text-xs text-primary hover:underline flex items-center gap-1 font-medium transition-colors"
					>
						<CheckCheck className="w-3.5 h-3.5" />
						Mark all read
					</button>
				)}
			</div>

			{/* List Content */}
			<div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
				{loading ? (
					<div className="p-6 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
						<div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
						Loading notifications...
					</div>
				) : notifications.length === 0 ? (
					<div className="p-8 text-center text-gray-500">
						<Bell className="w-8 h-8 mx-auto mb-2 text-gray-400 opacity-60" />
						<p className="text-sm font-semibold text-gray-800">No notifications yet</p>
						<p className="text-xs text-gray-500 mt-1">You're all caught up!</p>
					</div>
				) : (
					notifications.slice(0, 5).map((item) => (
						<div
							key={item._id}
							onClick={() => handleNotificationClick(item)}
							className={`p-3.5 hover:bg-gray-50 cursor-pointer transition-colors flex gap-3 items-start relative ${
								!item.isRead ? "bg-purple-50/50" : ""
							}`}
						>
							{!item.isRead && (
								<span className="absolute left-1.5 top-4 w-2 h-2 rounded-full bg-primary animate-pulse" />
							)}
							<div className="p-2 rounded-xl bg-gray-100 border border-gray-200 shrink-0 mt-0.5">
								{getCategoryIcon(item.category)}
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center justify-between gap-2 mb-1">
									<span
										className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md border ${getCategoryBadgeClass(
											item.category
										)}`}
									>
										{item.category}
									</span>
									<span className="text-[11px] text-gray-400 shrink-0">
										{dayjs(item.createdAt).fromNow()}
									</span>
								</div>
								<h4 className={`text-xs font-semibold truncate ${!item.isRead ? "text-gray-900" : "text-gray-700"}`}>
									{item.title}
								</h4>
								<p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
									{item.message}
								</p>
							</div>
						</div>
					))
				)}
			</div>

			{/* Footer */}
			<div className="p-3 border-t border-gray-100 bg-gray-50/80 text-center">
				<button
					onClick={handleViewAll}
					className="text-xs font-semibold text-primary hover:text-purple-700 transition-colors"
				>
					View All Notifications
				</button>
			</div>
		</div>
	);
};

export default NotificationDropdown;
