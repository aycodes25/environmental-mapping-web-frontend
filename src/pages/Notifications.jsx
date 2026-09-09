import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
	Bell,
	CheckCheck,
	Trash2,
	Filter,
	Search,
	RefreshCw,
	AlertTriangle,
	MessageSquare,
	Tag,
	FileText,
	UserCheck,
	Settings,
	ChevronLeft,
	ChevronRight,
	ExternalLink,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getUserFromLocalStorage } from "../redux/reducers/userReducer";
import {
	getNotifications,
	markNotificationAsRead,
	markAllNotificationsAsRead,
	deleteNotification,
} from "../services/notificationService";

dayjs.extend(relativeTime);

const CATEGORIES = ["All", "Unread", "Incident", "Feedback", "Tag", "Report", "Users", "System"];

const getCategoryIcon = (category) => {
	switch (category) {
		case "Incident":
			return <AlertTriangle className="w-5 h-5 text-red-600" />;
		case "Feedback":
			return <MessageSquare className="w-5 h-5 text-blue-600" />;
		case "Tag":
			return <Tag className="w-5 h-5 text-amber-600" />;
		case "Report":
			return <FileText className="w-5 h-5 text-purple-600" />;
		case "Users":
			return <UserCheck className="w-5 h-5 text-emerald-600" />;
		default:
			return <Settings className="w-5 h-5 text-gray-500" />;
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

const Notifications = () => {
	const [notifications, setNotifications] = useState([]);
	const [activeCategory, setActiveCategory] = useState("All");
	const [searchQuery, setSearchQuery] = useState("");
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalCount, setTotalCount] = useState(0);

	const navigate = useNavigate();
	const location = useLocation();
	const user = useSelector((state) => state.userState?.user);
	const currentUser = getUserFromLocalStorage() || user;

	const pathLower = (location.pathname || "").toLowerCase();
	let userRole = "admin";
	if (pathLower.startsWith("/reviewer")) {
		userRole = "reviewer";
	} else if (pathLower.startsWith("/tagger")) {
		userRole = "tagger";
	} else if (pathLower.startsWith("/admin")) {
		userRole = "admin";
	} else if (currentUser?.role) {
		const rawRole = String(currentUser.role).toLowerCase();
		userRole = ["admin", "superadmin"].includes(rawRole) ? "admin" : rawRole;
	}

	const fetchNotificationsData = async (currentPage = page, category = activeCategory) => {
		setLoading(true);
		try {
			const params = { page: currentPage, limit: 15 };
			if (category === "Unread") {
				params.isRead = false;
			} else if (category !== "All") {
				params.category = category;
			}

			const res = await getNotifications(params);
			if (res && (res.status === "success" || res.success)) {
				const list =
					res.data?.notifications ||
					(Array.isArray(res.data) ? res.data : []);
				setNotifications(list);
				setTotalPages(res.data?.pagination?.totalPages || 1);
				setTotalCount(res.data?.pagination?.total ?? list.length);
			}
		} catch (error) {
			console.error("Error fetching notifications list:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchNotificationsData(page, activeCategory);
	}, [page, activeCategory]);

	const handleCategoryChange = (cat) => {
		setActiveCategory(cat);
		setPage(1);
	};

	const handleMarkRead = async (id) => {
		try {
			await markNotificationAsRead(id);
			setNotifications((prev) =>
				prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
			);
		} catch (error) {
			console.error("Error marking notification as read:", error);
		}
	};

	const handleMarkAllRead = async () => {
		try {
			await markAllNotificationsAsRead();
			setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
		} catch (error) {
			console.error("Error marking all notifications as read:", error);
		}
	};

	const handleDelete = async (id) => {
		try {
			await deleteNotification(id);
			setNotifications((prev) => prev.filter((n) => n._id !== id));
			setTotalCount((prev) => Math.max(0, prev - 1));
		} catch (error) {
			console.error("Error deleting notification:", error);
		}
	};

	const handleNavigateRelated = (item) => {
		if (!item.isRead) {
			handleMarkRead(item._id);
		}
		if (item.category === "Incident" && item.relatedId) {
			navigate(`/${userRole}/view-incidents/${item.relatedId}`);
		} else if (item.category === "Feedback") {
			navigate(`/${userRole}/feedback`);
		} else {
			navigate(`/${userRole}/notifications`);
		}
	};

	const filteredNotifications = notifications.filter((item) => {
		if (!searchQuery) return true;
		const query = searchQuery.toLowerCase();
		return (
			(item.title && item.title.toLowerCase().includes(query)) ||
			(item.message && item.message.toLowerCase().includes(query))
		);
	});

	return (
		<div className="p-6 max-w-7xl mx-auto space-y-6 text-gray-800">
			{/* Top Page Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
				<div className="flex items-center gap-3">
					<div className="p-3 bg-purple-50 border border-purple-100 rounded-2xl">
						<Bell className="w-6 h-6 text-primary" />
					</div>
					<div>
						<h1 className="text-2xl font-bold tracking-tight text-gray-900">Notification Center</h1>
						<p className="text-sm text-gray-500 mt-1">
							Stay updated with system activities, tag reports, feedback, and role alerts.
						</p>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<button
						onClick={() => fetchNotificationsData(page, activeCategory)}
						className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 text-sm font-semibold text-gray-700 transition-all shadow-sm"
						title="Refresh list"
					>
						<RefreshCw className="w-4 h-4 text-gray-500" />
						Refresh
					</button>

					<button
						onClick={handleMarkAllRead}
						className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-secondaryAlt text-white font-semibold text-sm transition-all shadow-md"
					>
						<CheckCheck className="w-4 h-4 text-white" />
						Mark All as Read
					</button>
				</div>
			</div>

			{/* Filters & Search Toolbar */}
			<div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
				{/* Category Tabs */}
				<div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
					{CATEGORIES.map((cat) => (
						<button
							key={cat}
							onClick={() => handleCategoryChange(cat)}
							className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
								activeCategory === cat
									? "bg-primary text-white border-primary shadow-md"
									: "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-gray-200 shadow-sm"
							}`}
						>
							{cat}
						</button>
					))}
				</div>

				{/* Search Bar */}
				<div className="relative min-w-[280px]">
					<Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search notifications..."
						className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all"
					/>
				</div>
			</div>

			{/* Notifications List Container */}
			<div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
				{loading ? (
					<div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
						<div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
						<p className="text-sm font-medium">Loading notifications...</p>
					</div>
				) : filteredNotifications.length === 0 ? (
					<div className="p-16 text-center text-gray-500">
						<Bell className="w-12 h-12 mx-auto mb-3 text-gray-300 opacity-60" />
						<h3 className="text-lg font-semibold text-gray-800">No notifications found</h3>
						<p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
							{activeCategory !== "All"
								? `No notifications in "${activeCategory}" category.`
								: "You have no notifications at this time."}
						</p>
					</div>
				) : (
					<div className="divide-y divide-gray-100">
						{filteredNotifications.map((item) => (
							<div
								key={item._id}
								className={`p-5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/80 ${
									!item.isRead ? "bg-purple-50/40" : ""
								}`}
							>
								<div className="flex items-start gap-4 min-w-0">
									{!item.isRead && (
										<span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shrink-0 mt-2" />
									)}
									<div className="p-2.5 rounded-2xl bg-gray-100 border border-gray-200 shrink-0">
										{getCategoryIcon(item.category)}
									</div>
									<div className="min-w-0 space-y-1">
										<div className="flex items-center gap-2 flex-wrap">
											<span
												className={`px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md border ${getCategoryBadgeClass(
													item.category
												)}`}
											>
												{item.category}
											</span>
											<span className="text-xs text-gray-500 font-medium">
												{dayjs(item.createdAt).format("MMM DD, YYYY • hh:mm A")} ({dayjs(item.createdAt).fromNow()})
											</span>
										</div>
										<h3 className={`text-sm font-semibold ${!item.isRead ? "text-gray-900" : "text-gray-700"}`}>
											{item.title}
										</h3>
										<p className="text-xs text-gray-600 max-w-3xl leading-relaxed">
											{item.message}
										</p>
									</div>
								</div>

								{/* Item Action Buttons */}
								<div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
									{item.relatedId && (
										<button
											onClick={() => handleNavigateRelated(item)}
											className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-xs font-semibold text-primary border border-purple-200 flex items-center gap-1.5 transition-all shadow-xs"
										>
											<ExternalLink className="w-3.5 h-3.5" />
											View Details
										</button>
									)}
									{!item.isRead && (
										<button
											onClick={() => handleMarkRead(item._id)}
											className="p-2 rounded-lg bg-gray-100 hover:bg-purple-100 text-gray-600 hover:text-primary transition-all border border-gray-200"
											title="Mark as Read"
										>
											<CheckCheck className="w-4 h-4" />
										</button>
									)}
									<button
										onClick={() => handleDelete(item._id)}
										className="p-2 rounded-lg bg-gray-100 hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all border border-gray-200"
										title="Delete notification"
									>
										<Trash2 className="w-4 h-4" />
									</button>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Pagination Footer */}
				{totalPages > 1 && (
					<div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
						<p className="text-xs text-gray-500">
							Showing Page <span className="font-semibold text-gray-800">{page}</span> of{" "}
							<span className="font-semibold text-gray-800">{totalPages}</span> ({totalCount} total)
						</p>

						<div className="flex items-center gap-2">
							<button
								disabled={page === 1}
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								className="p-2 rounded-xl bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-200 text-gray-700 shadow-sm transition-all"
							>
								<ChevronLeft className="w-4 h-4" />
							</button>
							<button
								disabled={page >= totalPages}
								onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
								className="p-2 rounded-xl bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-200 text-gray-700 shadow-sm transition-all"
							>
								<ChevronRight className="w-4 h-4" />
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Notifications;
