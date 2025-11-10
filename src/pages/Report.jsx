// eslint-disable-next-line no-unused-vars
import React, { useEffect, useMemo, useState } from "react";
// import { Table } from '../components';
import {
	customFetch,
	filterDataByDateRange,
	formatTime,
	getRealFileUrl,
	removeCommas,
} from "../utils";
import { toast } from "react-toastify";
import { useLoaderData } from "react-router-dom";
import TanstackTable from "../components/TanstackTable";
import Modal from "../components/ui/modal";
// import ReportOverview from "./new/ReportOverview";
import WebIcon from "../components/custom/WebIcons";
import SearchInput from "../components/ui/search-input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { MoreVertical } from "lucide-react";

export const ReportLoader = () => async () => {
	let tags = [];

	const the_tags = await customFetch.get("/tag/all-tags");
	if (tags.data?.status !== "error") {
		tags = the_tags.data.data.filter((tag) => tag.model && !tag.model.delete);
	} else {
		toast.error(the_tags.data.message);
	}

	return { tags };
};

const Report = () => {
	const { tags } = useLoaderData();
	const [activeFilter, setActiveFilter] = useState("All"); // Changed from activeItem to activeFilter
	const [searchText, setSearchText] = useState("");
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [tagsData, setTagsData] = useState(tags);

	const handleFilterClick = (filter) => {
		if (
			filter === "Start Date" ||
			filter === "End Date" ||
			filter === "Monthly"
		) {
			// These are date filters - you can add date picker logic here
			console.log(`${filter} clicked`);
		} else {
			// This is the data type filter (All, Sample, Incident)
			setActiveFilter(filter);
		}
	};

	// Function to get filtered data based on active filter
	const getFilteredData = () => {
		switch (activeFilter) {
			case "Sample":
				return tagsData.filter((item) => item.type === "sampling");
			case "Incident":
				return tagsData.filter((item) => item.type === "incident");
			case "All":
			default:
				return tagsData;
		}
	};

	// Function to get columns based on active filter
	const getColumns = () => {
		switch (activeFilter) {
			case "Sample":
				return columnSample;
			case "Incident":
				return columnIncident;
			case "All":
			default:
				// For "All", we'll use a combined column set or default to Sample
				return columnSample;
		}
	};

	// Export PDF function
	const handleExportPDF = () => {
		const options = {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: true,
		};

		const unit = "pt";
		const size = "A3";
		const orientation = "landscape";

		const marginLeft = 20;
		const marginRight = 20;
		const marginTop = 40;
		const rowsPerPage = 30;

		const doc = new jsPDF(orientation, unit, size);

		// Get available width for table
		const pageWidth = doc.internal.pageSize.getWidth();
		const availableWidth = pageWidth - marginLeft - marginRight;

		doc.setFontSize(12);

		const title = `Exported Data - ${new Date().toLocaleString(
			"en-US",
			options
		)}`;

		const visibleColumns = getColumns().filter((c) => !c.excludeFromReport);
		const headers = visibleColumns.map((column) => column.header);

		// Calculate column widths proportionally to fill the entire width
		const totalColumns = headers.length;
		const columnWidths = {};

		// Assign proportional width values based on content type
		let totalProportions = 0;
		const proportions = headers.map((header, index) => {
			let proportion;
			if (header === "SN") {
				proportion = 2; // Smallest
			} else if (["Ref", "Group", "Result"].includes(header)) {
				proportion = 4;
			} else if (["Facility", "Location", "Time"].includes(header)) {
				proportion = 5;
			} else if (
				[
					"Object Name",
					"Factory location",
					"Sample Type",
					"Added By",
					"Date",
				].includes(header)
			) {
				proportion = 6;
			} else if (["Note"].includes(header)) {
				proportion = 7;
			} else if (["Corrective Actions", "Evidence"].includes(header)) {
				proportion = 10; // Largest for content-heavy columns
			} else {
				proportion = 5; // Default
			}
			totalProportions += proportion;
			return proportion;
		});

		// Calculate actual width in points for each column
		headers.forEach((header, index) => {
			const widthPercentage = proportions[index] / totalProportions;
			columnWidths[index] = Math.floor(availableWidth * widthPercentage);
		});

		const generateTableRows = (rows) => {
			return rows.map((row, rowIndex) => {
				let currentRow = [];
				for (let i = 0; i < visibleColumns.length; i++) {
					let column = visibleColumns[i];
					if (column.accessorFn) {
						currentRow.push(column.accessorFn(row, rowIndex) || "");
					} else {
						currentRow.push(row[column.accessorKey] || "");
					}
				}
				return currentRow;
			});
		};

		// Clear space for title
		doc.text(title, marginLeft, 25);

		const addTableToPDF = (rows, startY) => {
			const tableRows = generateTableRows(rows);

			doc.autoTable({
				head: [headers],
				body: tableRows,
				startY: startY,
				margin: { left: marginLeft, right: marginRight },
				columnStyles: Object.fromEntries(
					Object.entries(columnWidths).map(([index, width]) => [
						index,
						{ cellWidth: width },
					])
				),
				styles: {
					cellPadding: 5,
					fontSize: 9,
					overflow: "linebreak",
					valign: "middle",
					lineWidth: 0.1,
					lineColor: [0, 0, 0],
				},
				headStyles: {
					fillColor: [173, 216, 230], // Original light blue color
					textColor: [0, 0, 0],
					fontStyle: "bold",
					fontSize: 10,
					halign: "center",
					cellPadding: { top: 5, right: 2, bottom: 5, left: 2 }, // Smaller padding for headers
					minCellHeight: 20,
					overflow: "ellipsize", // Prevent header wrapping
				},
				pageBreak: "auto",
				tableLineColor: [0, 0, 0],
				tableLineWidth: 0.1,
				tableWidth: availableWidth, // Use full available width
				didDrawPage: (data) => {
					if (data.pageNumber > 1) {
						doc.setFontSize(12);
						doc.text(title, marginLeft, 25);
					}
				},
			});
		};

		let currentY = marginTop;

		for (let i = 0; i < getFilteredData().length; i += rowsPerPage) {
			const slicedData = getFilteredData().slice(i, i + rowsPerPage);

			if (i > 0) {
				doc.addPage();
				currentY = marginTop;
			}

			addTableToPDF(slicedData, currentY);
		}

		doc.save(
			`exported_data_${new Date().toLocaleString("en-US", options)}.pdf`
		);
	};

	// Export CSV function
	const handleExportCSV = () => {
		const csvContent = [];

		// Header row
		const headers = getColumns()
			.filter((c) => !c.excludeFromReport)
			.map((column) => column.header);
		csvContent.push(headers.join(","));

		// Data rows
		getFilteredData().forEach((row, rowIndex) => {
			let currentRow = [];
			for (let i = 0; i < getColumns().length; i++) {
				let column = getColumns()[i];
				if (column.excludeFromReport) {
					continue;
				}
				if (column.accessorFn) {
					currentRow.push(column.accessorFn(row, rowIndex) || "");
				} else {
					currentRow.push(row[column.accessorKey] || "");
				}
			}
			csvContent.push(currentRow.join(","));
		});

		// Join rows with newline character
		const csvString = csvContent.join("\n");

		// Create a Blob object with the CSV data
		const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });

		// Create a temporary URL for the Blob
		const url = URL.createObjectURL(blob);

		// Create a link element to trigger the download
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute("download", "export.csv");

		// Trigger the download
		document.body.appendChild(link);
		link.click();

		// Clean up
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	useEffect(() => {
		setTagsData(tags);
	}, [tags]);

	useEffect(() => {
		if (startDate && endDate && new Date(startDate) <= new Date(endDate)) {
			const result = filterDataByDateRange(tags, startDate, endDate);
			if (result && result.length && endDate) {
				setTagsData(result);
			} else {
				setTagsData([]);
			}
		} else {
			setTagsData(tags);
		}
	}, [startDate, endDate, tags]);

	const handleFilterTags = (search) => {
		setSearchText(search);
		if (!search.length) {
			setTagsData(tags || []);
			return;
		}
		const regex = new RegExp(`.*${search.toLowerCase()}.*`, "i");

		const searchResult = (tags || []).filter((item) => {
			return (
				regex.test(item.model?.modelName) ||
				regex.test(item.objectName?.toLowerCase()) ||
				regex.test(item.incident?.toLowerCase()) ||
				regex.test(item.presence?.toLowerCase()) ||
				regex.test(item.sample?.toLowerCase()) ||
				regex.test(item.locations?.toLowerCase()) ||
				regex.test(item.text?.toLowerCase()) ||
				regex.test(item.type?.toLowerCase()) ||
				regex.test(item.group?.toLowerCase()) ||
				regex.test(item.slug?.toLowerCase())
			);
		});

		setTagsData(searchResult);
	};

	const columnSample = [
		{
			accessorFn: (row, i) => i + 1,
			header: "SN",
			cell: (info) => info.getValue(),
		},
		{
			accessorKey: "slug",
			header: "Ref",
			cell: (info) => info.getValue() || "",
		},
		{
			accessorKey: "group",
			header: "Group",
			cell: (info) => info.getValue() || "",
		},
		{
			accessorFn: (row) => row.model?.modelName,
			header: "Facility",
			cell: (info) => info.getValue(),
		},
		{
			accessorKey: "locations",
			header: "Location",
			cell: (info) => info.getValue() || "",
		},
		{
			accessorFn: (row) => row.model?.location?.name,
			header: "Factory location",
			cell: (info) => info.getValue() || "",
		},
		{
			accessorFn: (row) => row?.sample || "",
			header: "Sample Type",
			cell: (info) => info.getValue(),
		},
		{
			accessorFn: (row) => formatTime(row.createdAt),
			header: "Time",
			cell: (info) => info.getValue(),
		},
		{
			accessorKey: "objectName",
			header: "Object Name",
			cell: (info) => info.getValue() || "",
		},
		{
			accessorKey: "presence",
			header: "Result",
			cell: (info) => info.getValue() || "",
		},
		{
			accessorKey: "text",
			header: "Note",
			cell: (info) => info.getValue() || "",
		},
		{
			accessorFn: (row) => row.user?.fullname,
			header: "Added By",
			cell: (info) => info.getValue() || "",
		},
		{
			accessorKey: "action",
			header: "Corrective Actions",
			cell: (info) => info.getValue() || "",
		},
		{
			accessorKey: "evidence",
			header: "Evidence",
			cell: (info) => {
				const evidence = info.getValue();
				if (evidence) {
					return (
						<img
							className="w-16 h-16 object-cover rounded"
							src={getRealFileUrl(evidence)}
							alt="Evidence"
						/>
					);
				}
				return "";
			},
		},
		{
			accessorFn: (row) => "",
			header: "Options",
			excludeFromReport: true,
			cell: (info) => {
				return (
					<EditTagForm
						info={info}
						tagsData={tagsData}
						setTagsData={setTagsData}
					/>
				);
			},
		},
	];

	const columnIncident = useMemo(
		() => [
			{
				accessorFn: (row, i) => i + 1,
				header: "SN",
				cell: (info) => info.getValue(),
			},
			{
				accessorKey: "slug",
				header: "Ref",
				cell: (info) => info.getValue() || "",
			},
			{
				accessorKey: "group",
				header: "Group",
				cell: (info) => info.getValue() || "",
			},
			{
				accessorFn: (row) => row.model?.modelName,
				header: "Facility",
				cell: (info) => info.getValue(),
			},
			{
				accessorKey: "locations",
				header: "Location",
				cell: (info) => info.getValue() || "",
			},
			{
				accessorFn: (row) => row.model?.location?.name,
				header: "Factory location",
				cell: (info) => info.getValue() || "",
			},
			{
				accessorFn: (row) => row?.incident || "",
				header: "Incident Type",
				cell: (info) => info.getValue(),
			},
			{
				accessorFn: (row) => formatTime(row.createdAt),
				header: "Time",
				cell: (info) => info.getValue(),
			},
			{
				accessorKey: "objectName",
				header: "Object Name",
				cell: (info) => info.getValue() || "",
			},
			{
				accessorKey: "presence",
				header: "Result",
				cell: (info) => info.getValue() || "",
			},
			{
				accessorKey: "text",
				header: "Note",
				cell: (info) => info.getValue() || "",
			},
			{
				accessorFn: (row) => row.user?.fullname,
				header: "Added By",
				cell: (info) => info.getValue() || "",
			},
			{
				accessorKey: "action",
				header: "Corrective Actions",
				cell: (info) => info.getValue() || "",
			},
			{
				accessorKey: "evidence",
				header: "Evidence",
				cell: (info) => {
					const evidence = info.getValue();
					if (evidence) {
						return (
							<img
								className="w-16 h-16 object-cover rounded"
								src={getRealFileUrl(evidence)}
								alt="Evidence"
							/>
						);
					}
					return "";
				},
			},
			{
				accessorFn: (row) => "",
				header: "Options",
				excludeFromReport: true,
				cell: (info) => {
					return (
						<EditTagForm
							info={info}
							tagsData={tagsData}
							setTagsData={setTagsData}
						/>
					);
				},
			},
		],
		[]
	);

	// Mock report data for overview section
	const reportData = {
		totalReports: tagsData.length,
		sampleReports: tagsData.filter((item) => item.type === "sampling").length,
		incidentReports: tagsData.filter((item) => item.type === "incident")
			.length,
		approvedReports: Math.floor(tagsData.length * 0.6), // Mock 60% approval rate
	};

	return (
		<div className="flex flex-col flex-grow w-auto">
			{/* Report Overview Section */}
			{/* <ReportOverview reportData={reportData} /> */}

			{/* Report Filters and Table Section */}
			<div className="flex flex-col flex-grow p-5">
				<div className="flex items-center justify-between mb-6">
					<h2 className="heading-large font-bold text-primary">Reports</h2>
					]{" "}
					<div className="flex items-center gap-3">
						<label className="flex items-center gap-2 text-sm text-gray-700">
							<WebIcon icon="calendar" className="w-3 h-3" />
							<span>Start</span>
							<input
								type="date"
								value={startDate || ""}
								onChange={(e) => setStartDate(e.target.value)}
								className="border border-gray-300 rounded px-2 py-1 h-[24px]"
							/>
						</label>
						<label className="flex items-center gap-2 text-sm text-gray-700">
							<WebIcon icon="calendar" className="w-3 h-3" />
							<span>End</span>
							<input
								type="date"
								value={endDate || ""}
								min={startDate || undefined}
								onChange={(e) => setEndDate(e.target.value)}
								className="border border-gray-300 rounded px-2 py-1 h-[24px]"
							/>
						</label>
						<button
							onClick={() => {
								setStartDate(null);
								setEndDate(null);
							}}
							className="px-3 py-1 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
						>
							Clear
						</button>

						{/* All Filter - Using Shadcn Select */}
						<Select value={activeFilter} onValueChange={setActiveFilter}>
							<SelectTrigger
								className="bg-primary text-white border-primary rounded-[20px] flex items-center gap-1"
								style={{ width: "63px", height: "24px" }}
							>
								<SelectValue placeholder="All" />
							</SelectTrigger>
							<SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
								<SelectItem
									value="All"
									className="bg-white hover:bg-gray-100"
								>
									All
								</SelectItem>
								<SelectItem
									value="Sample"
									className="bg-white hover:bg-gray-100"
								>
									Sample
								</SelectItem>
								<SelectItem
									value="Incident"
									className="bg-white hover:bg-gray-100"
								>
									Incident
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Search Bar and Action Buttons Row - All flexed to the right */}
				<div className="flex items-center justify-end mb-6">
					<div className="flex items-center gap-3">
						{/* Search Bar */}
						<SearchInput
							value={searchText}
							onChange={(v) => handleFilterTags(v)}
							placeholder="Search by name, status, class...."
						/>

						{/* Action Buttons */}
						<div className="flex items-center gap-2">
							<button
								onClick={handleExportPDF}
								className="p-1 hover:bg-gray-100 transition-colors rounded"
								title="Export PDF"
							>
								<WebIcon
									icon="printer"
									className="text-gray-600"
									style={{ width: "16px", height: "16px" }}
								/>
							</button>
							<button
								onClick={handleExportCSV}
								className="p-1 hover:bg-gray-100 transition-colors rounded"
								title="Export CSV"
							>
								<WebIcon
									icon="download"
									className="text-gray-600"
									style={{ width: "16px", height: "16px" }}
								/>
							</button>
						</div>
					</div>
				</div>

				{/* Table Section */}
				<section className="flex justify-center items-center">
					<TanstackTable
						autoHeight
						columns={getColumns()}
						tableData={getFilteredData()}
					/>
				</section>
			</div>
		</div>
	);
};

function EditTagForm({ info, tagsData, setTagsData }) {
	const [isOpen, setIsOpen] = useState(false);
	const [isVisible, setIsVisible] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [formData, setFormData] = useState({
		action: info.cell.row.original.action || "",
		text: info.cell.row.original.text || "",
	});

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const handleEdit = () => {
		setIsOpen(false);
		// Reset form data with current values
		setFormData({
			action: info.cell.row.original.action || "",
			text: info.cell.row.original.text || "",
		});
		setIsVisible(true);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		setIsSubmitting(true);
		try {
			const formDataForUpload = new FormData();
			formDataForUpload.append("action", formData.action);
			formDataForUpload.append("text", formData.text);

			const response = await customFetch.put(
				"/tag/update-tag/" + info.cell.row.original._id,
				formDataForUpload
			);

			if (response.data?.status !== "error") {
				toast.success(`Report updated successfully`);

				// Update the local state
				let updatedTags = tagsData.map((tag) => {
					if (tag._id === info.cell.row.original._id) {
						return {
							...tag,
							action: formData.action,
							text: formData.text,
						};
					}
					return tag;
				});
				setTagsData(updatedTags);

				// Update the original row data
				info.cell.row.original.action = formData.action;
				info.cell.row.original.text = formData.text;

				setIsVisible(false);
			} else {
				toast.error(response.data?.message);
			}
		} catch (error) {
			console.log(error);
			const errorMessage =
				error?.response?.data?.msg || "Error updating report";
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="relative">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="p-1 hover:bg-gray-100 rounded transition-colors"
			>
				<MoreVertical className="w-4 h-4 text-gray-600" />
			</button>

			{isOpen && (
				<div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px]">
					<div className="py-1">
						<button
							onClick={handleEdit}
							className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
						>
							Edit Report
						</button>
					</div>
				</div>
			)}

			{/* Click outside to close dropdown */}
			{isOpen && (
				<div
					className="fixed inset-0 z-40"
					onClick={() => setIsOpen(false)}
				/>
			)}

			{isVisible && (
				<Modal
					title="Edit Report"
					isVisible={isVisible}
					onClose={() => setIsVisible(false)}
				>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label
								htmlFor="action"
								className="block text-sm font-medium text-gray-700"
							>
								Corrective Actions
							</label>
							<textarea
								id="action"
								name="action"
								value={formData.action}
								onChange={handleInputChange}
								rows={4}
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
								placeholder="Enter corrective actions"
							/>
						</div>

						<div>
							<label
								htmlFor="text"
								className="block text-sm font-medium text-gray-700"
							>
								Note
							</label>
							<textarea
								id="text"
								name="text"
								value={formData.text}
								onChange={handleInputChange}
								rows={4}
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
								placeholder="Enter note"
							/>
						</div>

						<div className="flex justify-end space-x-2 mt-4">
							<button
								type="button"
								onClick={() => setIsVisible(false)}
								className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={isSubmitting}
								className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none disabled:opacity-50"
							>
								{isSubmitting ? "Updating..." : "Update"}
							</button>
						</div>
					</form>
				</Modal>
			)}
		</div>
	);
}

export default Report;
