import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Bell } from "lucide-react";
import { getUserFromLocalStorage } from "../../redux/reducers/userReducer";
import {
	getNotifications,
	getUnreadNotificationCount,
	markNotificationAsRead,
	markAllNotificationsAsRead,
} from "../../services/notificationService";
import NotificationDropdown from "./NotificationDropdown";

const NotificationBell = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [unreadCount, setUnreadCount] = useState(0);
	const [notifications, setNotifications] = useState([]);
	const [loading, setLoading] = useState(false);
	const dropdownRef = useRef(null);
	const location = useLocation();

	const user = useSelector((state) => state.userState?.user);
	const currentUser = getUserFromLocalStorage() || user;

	// Determine role context from active path first, then fall back to user role
	const pathname = location.pathname.toLowerCase();
	let userRole = "admin";
	if (pathname.startsWith("/reviewer")) {
		userRole = "reviewer";
	} else if (pathname.startsWith("/tagger")) {
		userRole = "tagger";
	} else if (pathname.startsWith("/admin")) {
		userRole = "admin";
	} else if (currentUser?.role) {
		const rawRole = String(currentUser.role).toLowerCase();
		userRole = ["admin", "superadmin"].includes(rawRole) ? "admin" : rawRole;
	}

	const fetchUnread = async () => {
		try {
			const res = await getUnreadNotificationCount();
			const count =
				res?.data?.unreadCount ??
				(typeof res?.count === "number" ? res.count : 0);
			setUnreadCount(count);
		} catch (error) {
			console.error("Error fetching unread notification count:", error);
		}
	};

	const fetchDropdownNotifications = async () => {
		setLoading(true);
		try {
			const res = await getNotifications({ page: 1, limit: 10 });
			const list =
				res?.data?.notifications ||
				(Array.isArray(res?.data) ? res.data : []);
			setNotifications(list);
		} catch (error) {
			console.error("Error fetching notifications:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUnread();
		// Poll every 15 seconds for new notifications
		const interval = setInterval(() => {
			fetchUnread();
		}, 15000);

		return () => clearInterval(interval);
	}, []);

	const handleToggle = () => {
		if (!isOpen) {
			fetchDropdownNotifications();
		}
		setIsOpen(!isOpen);
	};

	const handleMarkAsRead = async (id) => {
		try {
			await markNotificationAsRead(id);
			setNotifications((prev) =>
				prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
			);
			setUnreadCount((prev) => Math.max(0, prev - 1));
		} catch (error) {
			console.error("Error marking notification as read:", error);
		}
	};

	const handleMarkAllAsRead = async () => {
		try {
			await markAllNotificationsAsRead();
			setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
			setUnreadCount(0);
		} catch (error) {
			console.error("Error marking all notifications as read:", error);
		}
	};

	// Close on click outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				onClick={handleToggle}
				className="relative p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-primary transition-all duration-200 focus:outline-none border border-gray-200 shadow-sm"
				title="Notifications"
				id="notification-bell-btn"
			>
				<Bell className="w-5 h-5" />
				{unreadCount > 0 && (
					<span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md animate-pulse">
						{unreadCount > 99 ? "99+" : unreadCount}
					</span>
				)}
			</button>

			{isOpen && (
				<NotificationDropdown
					notifications={notifications}
					loading={loading}
					unreadCount={unreadCount}
					onMarkAsRead={handleMarkAsRead}
					onMarkAllAsRead={handleMarkAllAsRead}
					onClose={() => setIsOpen(false)}
					userRole={userRole}
				/>
			)}
		</div>
	);
};

export default NotificationBell;
