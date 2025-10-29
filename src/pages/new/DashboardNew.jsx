import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { customFetch, formatDate, formatTime } from "../../utils";
import { toast } from "react-toastify";
import DashboardOverview from "./DashboardOverview";
import { FullDashboard } from "../../components";
import TanstackTable from "../../components/TanstackTable";
import WebIcon from "../../components/custom/WebIcons";
import MessageModal from "../../components/admin-dashboard/modal.jsx";

const url = "/user/dashboard";

function OptionsDropdown({ row, navigate }) {
	const [isOpen, setIsOpen] = useState(false);
	return (
		<div className="relative">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="p-1 hover:bg-gray-100 rounded transition-colors"
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
					<circle cx="12" cy="6" r="2" fill="currentColor" />
					<circle cx="12" cy="12" r="2" fill="currentColor" />
					<circle cx="12" cy="18" r="2" fill="currentColor" />
				</svg>
			</button>
			{isOpen && (
				<div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px]">
					<div className="py-1">
						<button
							onClick={() => {
								setIsOpen(false);
								navigate(`/view-model/${row._id}`);
							}}
							className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
						>
							View Model
						</button>
					</div>
				</div>
			)}
			{isOpen && (
				<div
					className="fixed inset-0 z-40"
					onClick={() => setIsOpen(false)}
				/>
			)}
		</div>
	);
}

const DashboardNew = () => {
	const navigate = useNavigate();
	const [dashboardData, setDashboardData] = useState({});
	const [search, setSearch] = useState("");
	const [showStartDatePicker, setShowStartDatePicker] = useState(false);
	const [showEndDatePicker, setShowEndDatePicker] = useState(false);
	const [showTimePeriodDropdown, setShowTimePeriodDropdown] = useState(false);
	const [startDate, setStartDate] = useState("Start Date");
	const [endDate, setEndDate] = useState("End Date");
	const [timePeriod, setTimePeriod] = useState("Monthly");
	const [showDownloadModal, setShowDownloadModal] = useState(false);
	const [downloadSuccess, setDownloadSuccess] = useState(true);
	const [loading, setLoading] = useState(true);

	const fetchData = async () => {
		setLoading(true);
		try {
			const response = await customFetch(url);
			if (response.data.status !== "error") {
				setDashboardData(response.data);
			} else {
				toast.error(response.data.message);
			}
		} catch (error) {
			toast.error("Failed to load dashboard data");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (!event.target.closest(".dropdown-container")) {
				setShowStartDatePicker(false);
				setShowEndDatePicker(false);
				setShowTimePeriodDropdown(false);
			}
		};
		document.addEventListener("click", handleClickOutside);
		return () => document.removeEventListener("click", handleClickOutside);
	}, []);

	const safeRecentModels = Array.isArray(dashboardData?.recentlyViewedModels)
		? dashboardData.recentlyViewedModels
		: [];

	const columns = useMemo(
		() => [
			{
				accessorKey: "slug",
				header: () => <span>Facility ID</span>,
				cell: ({ row }) => (
					<span className="text-gray-800">
						{row.original.slug || "N/A"}
					</span>
				),
			},
			{
				accessorKey: "modelName",
				header: () => <span>Facility Name</span>,
				cell: ({ row }) => (
					<span className="text-gray-800">
						{row.original.modelName || "N/A"}
					</span>
				),
			},
			{
				id: "locationName",
				accessorFn: (row) => row?.location?.name || "N/A",
				header: () => <span>Location</span>,
				cell: ({ row }) => (
					<span className="text-gray-800">
						{row.original.location?.name || "N/A"}
					</span>
				),
			},
			{
				id: "uploadedBy",
				accessorFn: (row) => row?.user?.username || "N/A",
				header: () => <span>Uploaded By</span>,
				cell: ({ row }) => (
					<span className="text-gray-800">
						{row.original.user?.username || "N/A"}
					</span>
				),
			},
			{
				id: "timeStr",
				accessorFn: (row) =>
					row?.createdAt ? formatTime(row.createdAt) : "N/A",
				header: () => <span>Time</span>,
				cell: ({ row }) => (
					<span className="text-gray-800">
						{row.original.createdAt
							? formatTime(row.original.createdAt)
							: "N/A"}
					</span>
				),
			},
			{
				id: "dateStr",
				accessorFn: (row) =>
					row?.createdAt ? formatDate(row.createdAt) : "N/A",
				header: () => <span>Date</span>,
				cell: ({ row }) => (
					<span className="text-gray-800">
						{row.original.createdAt
							? formatDate(row.original.createdAt)
							: "N/A"}
					</span>
				),
			},
			{
				accessorKey: "isComplete",
				header: () => <span>Status</span>,
				cell: ({ row }) => {
					const isComplete = row.original.isComplete;
					return (
						<span
							className={`font-medium ${
								isComplete ? "text-green-600" : "text-yellow-500"
							}`}
						>
							{isComplete ? "Completed" : "In Progress"}
						</span>
					);
				},
			},
			{
				accessorKey: "action",
				header: () => <span>Action</span>,
				cell: ({ row }) => (
					<OptionsDropdown row={row.original} navigate={navigate} />
				),
			},
		],
		[navigate]
	);

	const filteredModels = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return safeRecentModels;
		return safeRecentModels.filter((model) => {
			const values = [
				model?.slug,
				model?.modelName,
				model?.location?.name,
				model?.location?.location,
				model?.user?.username,
				formatDate(model?.createdAt),
				formatTime(model?.createdAt),
			]
				.filter(Boolean)
				.join(" ")
				.toLowerCase();
			return values.includes(q);
		});
	}, [search, safeRecentModels]);

	return (
		<div className="flex flex-col flex-grow w-auto">
			<DashboardOverview dashboardData={dashboardData} />
			<FullDashboard dashboardData={dashboardData} />
			<div className="bg-white rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl p-4 sm:p-5 md:p-6 mx-2 sm:mx-4 lg:mx-5">
				{/* Header and Filters */}
				<div className="flex items-center justify-between mb-3 md:mb-4 gap-2 sm:gap-3">
					<h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
						Activities Log
					</h2>
					<div className="flex items-center flex-wrap gap-2 sm:gap-3">
						{/* Start Date */}
						<div className="relative dropdown-container">
							<button
								onClick={() =>
									setShowStartDatePicker(!showStartDatePicker)
								}
								className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-gray-50 transition-colors"
							>
								<WebIcon
									icon="calendar"
									className="w-3.5 h-3.5 sm:w-4 sm:h-4"
								/>
								<span className="text-sm text-gray-700 whitespace-nowrap">
									{startDate}
								</span>
								<WebIcon
									icon="chevron_down"
									className="w-3.5 h-3.5 sm:w-4 sm:h-4"
								/>
							</button>
							{showStartDatePicker && (
								<input
									type="date"
									className="absolute top-full mt-1 z-50 border border-gray-300 rounded-lg p-2"
									onChange={(e) => {
										const d = new Date(e.target.value);
										setStartDate(
											`${
												d.getMonth() + 1
											}/${d.getDate()}/${d.getFullYear()}`
										);
										setShowStartDatePicker(false);
									}}
									autoFocus
								/>
							)}
						</div>

						{/* End Date */}
						<div className="relative dropdown-container">
							<button
								onClick={() => setShowEndDatePicker(!showEndDatePicker)}
								className="flex items-center gap-2 px-3 py-2 border-l border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
							>
								<WebIcon
									icon="calendar"
									className="w-3.5 h-3.5 sm:w-4 sm:h-4"
								/>
								<span className="text-sm text-gray-700 whitespace-nowrap">
									{endDate}
								</span>
								<WebIcon
									icon="chevron_down"
									className="w-3.5 h-3.5 sm:w-4 sm:h-4"
								/>
							</button>
							{showEndDatePicker && (
								<input
									type="date"
									className="absolute top-full mt-1 z-50 border border-gray-300 rounded-lg p-2"
									onChange={(e) => {
										const d = new Date(e.target.value);
										setEndDate(
											`${
												d.getMonth() + 1
											}/${d.getDate()}/${d.getFullYear()}`
										);
										setShowEndDatePicker(false);
									}}
									autoFocus
								/>
							)}
						</div>

						{/* Time Period */}
						<div className="relative dropdown-container">
							<button
								onClick={() =>
									setShowTimePeriodDropdown(!showTimePeriodDropdown)
								}
								className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-gray-50 transition-colors"
							>
								<span className="text-sm text-gray-700">
									{timePeriod}
								</span>
								<WebIcon
									icon="chevron_down"
									className="w-3.5 h-3.5 sm:w-4 sm:h-4"
								/>
							</button>
							{showTimePeriodDropdown && (
								<div className="absolute top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[120px]">
									{["Monthly", "Weekly", "Daily"].map((period) => (
										<button
											key={period}
											onClick={() => {
												setTimePeriod(period);
												setShowTimePeriodDropdown(false);
											}}
											className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
										>
											{period}
										</button>
									))}
								</div>
							)}
						</div>
						<button className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#412461] text-white rounded-full hover:bg-[#7C3AED]">
							<span className="text-xs font-medium">All</span>
							<WebIcon
								icon="chevron_down"
								className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white"
							/>
						</button>
					</div>
				</div>

				{/* Search and Actions */}
				<div className="flex flex-col sm:flex-row items-center my-8 justify-end gap-3">
					<div className="relative flex-1 w-full max-w-full sm:max-w-xl">
						<input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full rounded-full border border-gray-200 pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
							placeholder="Search by location, user, date, time...."
						/>
						<WebIcon
							icon="search"
							className="absolute left-3 top-2.5 w-4 h-4 text-gray-500"
						/>
						{search && (
							<button
								onClick={() => setSearch("")}
								className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
								aria-label="Clear search"
							>
								×
							</button>
						)}
					</div>
					<div className="flex justify-between items-center gap-2">
						<button
							onClick={() => {
								setDownloadSuccess(true);
								setShowDownloadModal(true);
							}}
							className="p-1 rounded hover:bg-gray-100"
						>
							<WebIcon icon="download" className="w-6 h-6" />
						</button>
						<WebIcon icon="printer" className="w-6 h-6" />
					</div>
				</div>

				{/* Download modal */}
				<MessageModal
					isOpen={showDownloadModal}
					onClose={() => setShowDownloadModal(false)}
					variant={downloadSuccess ? "success" : "error"}
					reportId="I-0125"
					onRetry={() => {
						setDownloadSuccess(true);
						setShowDownloadModal(false);
					}}
					onCancel={() => setShowDownloadModal(false)}
				/>

				{/* Table */}
				<div className="mt-4 overflow-x-auto border border-gray-200 rounded-xl">
					{loading ? (
						<div className="w-full py-10 text-center text-gray-500">
							Loading...
						</div>
					) : (
						<TanstackTable columns={columns} tableData={filteredModels} />
					)}
				</div>
			</div>
		</div>
	);
};

export default DashboardNew;
