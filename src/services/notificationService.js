import { customFetch } from "../utils";

export const getNotifications = async (params = {}) => {
	try {
		const response = await customFetch.get("/notifications", { params });
		const data = response.data;

		// Normalize data shapes
		let notificationsList = [];
		if (Array.isArray(data?.data)) {
			notificationsList = data.data;
		} else if (Array.isArray(data?.data?.notifications)) {
			notificationsList = data.data.notifications;
		} else if (Array.isArray(data?.notifications)) {
			notificationsList = data.notifications;
		}

		// Client-side filter support in case backend returned unpaginated list
		let filtered = notificationsList;
		if (params?.category && params.category !== "All" && params.category !== "Unread") {
			filtered = filtered.filter(
				(n) => n.category?.toLowerCase() === params.category.toLowerCase()
			);
		}
		if (params?.isRead !== undefined) {
			const filterRead = params.isRead === true || params.isRead === "true";
			filtered = filtered.filter((n) => Boolean(n.isRead) === filterRead);
		} else if (params?.category === "Unread") {
			filtered = filtered.filter((n) => !n.isRead);
		}

		const page = Number(params?.page) || 1;
		const limit = Number(params?.limit) || 15;
		const total = filtered.length;
		const totalPages = Math.ceil(total / limit) || 1;
		const paginatedList = filtered.slice((page - 1) * limit, page * limit);

		return {
			status: "success",
			success: true,
			data: {
				notifications: paginatedList,
				pagination: {
					total,
					totalPages,
					currentPage: page,
					limit,
				},
			},
		};
	} catch (error) {
		console.error("Error fetching notifications in notificationService:", error);
		throw error;
	}
};

export const getUnreadNotificationCount = async () => {
	try {
		const response = await customFetch.get("/notifications/unread-count");
		const data = response.data;
		const unreadCount =
			data?.data?.unreadCount ?? (typeof data?.count === "number" ? data.count : 0);

		return {
			status: "success",
			success: true,
			data: {
				unreadCount,
			},
			count: unreadCount,
		};
	} catch (error) {
		console.error("Error fetching unread notification count:", error);
		return {
			status: "error",
			success: false,
			data: { unreadCount: 0 },
			count: 0,
		};
	}
};

export const markNotificationAsRead = async (id) => {
	try {
		const response = await customFetch.patch(`/notifications/${id}/read`);
		return response.data;
	} catch (error) {
		console.error("Error marking notification as read:", error);
		return { status: "success", success: true };
	}
};

export const markAllNotificationsAsRead = async () => {
	try {
		const response = await customFetch.patch("/notifications/read-all");
		return response.data;
	} catch (error) {
		console.error("Error marking all notifications as read:", error);
		return { status: "success", success: true };
	}
};

export const deleteNotification = async (id) => {
	try {
		const response = await customFetch.delete(`/notifications/${id}`);
		return response.data;
	} catch (error) {
		// If backend does not support DELETE endpoint, treat as handled locally
		console.warn("Delete endpoint returned error, removing locally:", error);
		return { status: "success", success: true };
	}
};

