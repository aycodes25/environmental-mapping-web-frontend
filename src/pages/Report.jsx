// eslint-disable-next-line no-unused-vars
import React, { useEffect, useMemo, useState } from "react";
// import { Table } from '../components';
import {
	customFetch,
	filterDataByDateRange,
	formatDate,
	formatTime,
	getRealFileUrl,
	removeCommas,
} from "../utils";
import { toast } from "react-toastify";
import { useLoaderData } from "react-router-dom";
import TanstackTable from "../components/TanstackTable";
import { Pencil2Icon } from "@radix-ui/react-icons";
import Modal from "@/components/ui/modal";

import { Button } from "@mui/material";

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
	const [activeItem, setActiveItem] = useState("Sample");
	const [searchText, setSearchText] = useState("");
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [tagsData, setTagsData] = useState(tags);

	const handleItemClick = (item) => {
		setActiveItem(item);
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
			accessorFn: (row) => row.model?.modelName,
			header: "Facility",
			cell: (info) => info.getValue(),
		},
		{
			accessorKey: "objectName",
			header: "Object Name",
		},
		{
			accessorKey: "slug",
			header: "Ref",
		},
		{
			accessorFn: (row) => row.model?.location?.name,
			header: "Factory location",
			cell: (info) => info.getValue(),
		},
		{
			accessorKey: "locations",
			header: "Location",
		},
		{
			accessorFn: (row) => row.group || "",
			header: "Group",
			cell: (info) => info.getValue(),
		},
		{
			accessorFn: (row) => row?.sample || "",
			header: "Sample Type",
			cell: (info) => info.getValue(),
		},
		{
			accessorFn: (row) =>
				!row?.zone || row?.zone === "undefined" ? "Not Set" : row?.zone,
			header: "Zone",
			cell: (info) => info.getValue(),
		},
		{
			accessorFn: (row) =>
				!row?.sampleDetails || row?.sampleDetails === "undefined"
					? "Not Set"
					: row?.sampleDetails,
			header: "Sample Details",
			cell: (info) => info.getValue(),
		},
		{
			accessorKey: "presence",
			header: "Result",
		},
		{
			accessorKey: "action",
			header: "Corrective Actions",
		},
		{
			accessorKey: "evidence",
			header: "Evidence",
			cell: (info) => (
				<img
					className="w-20 h-20 rounded-full"
					src={getRealFileUrl(info.getValue())}
				/>
			),
		},
		{
			accessorFn: (row) => row.user?.fullname,
			header: "Added By",
			cell: (info) => info.getValue(),
		},
		{
			accessorKey: "text",
			header: "Note",
		},
		{
			accessorFn: (row) => removeCommas(formatTime(row.createdAt)),
			header: "Time",
			cell: (info) => info.getValue(),
		},
		{
			accessorFn: (row) => removeCommas(formatDate(row.createdAt)),
			header: "Date",
			cell: (info) => info.getValue(),
		},
		{
			accessorFn: (row) => "",
			header: "Update",
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
				accessorFn: (row) => row.model?.modelName,
				header: "Facility",
				cell: (info) => info.getValue(),
			},
			{
				accessorKey: "objectName",
				header: "Object Name",
			},
			{
				accessorKey: "slug",
				header: "Ref",
			},
			{
				accessorFn: (row) => row.model?.location?.name,
				header: "Factory location",
				cell: (info) => info.getValue(),
			},
			{
				accessorKey: "locations",
				header: "Location",
			},
			{
				accessorFn: (row) => row.group || "",
				header: "Group",
				cell: (info) => info.getValue(),
			},
			{
				accessorFn: (row) => row?.incident || "",
				header: "Incident Details",
				cell: (info) => info.getValue(),
			},
			// Zone and Sample Details removed for Incident table per requirements
			{
				accessorKey: "action",
				header: "Corrective Actions",
			},
			{
				accessorKey: "evidence",
				header: "Evidence",
				cell: (info) => (
					<img
						className="w-20 h-20 rounded-full"
						src={getRealFileUrl(info.getValue())}
					/>
				),
			},
			{
				accessorKey: "text",
				header: "Note",
			},
			{
				accessorFn: (row) => row.user?.fullname,
				header: "Added By",
				cell: (info) => info.getValue(),
			},
			{
				accessorFn: (row) => removeCommas(formatTime(row.createdAt)),
				header: "Time",
				cell: (info) => info.getValue(),
			},
			{
				accessorFn: (row) => removeCommas(formatDate(row.createdAt)),
				header: "Date",
				cell: (info) => info.getValue(),
			},
			{
				accessorFn: (row) => "",
				header: "Update",
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

	return (
		<div className="flex overflow-auto flex-col flex-grow p-5 w-auto h-screen">
			<div className="flex justify-center items-center mb-2">
				<div className="flex gap-4 justify-center items-center px-4 py-1 rounded-full bg-slate-300">
					<h3
						className={`${
							activeItem === "Sample" ? "text-white bg-black" : ""
						} px-5 max-sm:px-3 py-1 rounded-full cursor-pointer font-bold`}
						onClick={() => handleItemClick("Sample")}
					>
						Sample
					</h3>
					<h3
						className={`${
							activeItem === "Incident" ? "text-white bg-black" : ""
						} px-5 max-sm:px-3 py-1 rounded-full cursor-pointer font-bold`}
						onClick={() => handleItemClick("Incident")}
					>
						Incident
					</h3>
				</div>
			</div>
			{activeItem === "Sample" && (
				<section className="flex justify-center items-center">
					<TanstackTable
						columns={columnSample}
						tableData={tagsData.filter(
							(items) => items.type === "sampling"
						)}
						startDate={startDate}
						endDate={endDate}
						setStartDate={setStartDate}
						setEndDate={setEndDate}
						searchText={searchText}
						handleFilterTags={handleFilterTags}
					/>
				</section>
			)}
			{activeItem === "Incident" && (
				<section className="flex justify-center items-center">
					<TanstackTable
						columns={columnIncident}
						tableData={tagsData.filter(
							(items) => items.type === "incident"
						)}
						startDate={startDate}
						endDate={endDate}
						setStartDate={setStartDate}
						setEndDate={setEndDate}
						searchText={searchText}
						handleFilterTags={handleFilterTags}
					/>
				</section>
			)}
		</div>
	);
};

function EditTagForm({ info, tagsData, setTagsData }) {
	const [isVisible, setIsVisible] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [formData, setFormData] = useState({
		action: info.cell.row.original.action,
		text: info.cell.row.original.text,
	});

	const handleInputChange = (e) => {
		const { name, value, files } = e.target;
		setFormData({
			...formData,
			[name]: files ? files[0] : value || "",
		});
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
				toast.success(`Tag updated successfully`);
				info.cell.row.original.action = formData.action;
				info.cell.row.original.text = formData.text;
				let updatedTags = tagsData.map((tag) => {
					if (tag._id === info.cell.row.original._id) {
						let updatedTag = {
							...tag,
							action: formData.action,
							text: formData.text,
						};
						return updatedTag;
					}
					return tag;
				});
				setFormData({
					action: "",
					text: "",
				});
				setTagsData(updatedTags);
				setIsVisible(false);
			} else {
				toast.error(response.data?.message);
			}
		} catch (error) {
			console.log(error);
			const errorMessage =
				error?.response?.data?.msg || "Error updating Tag";
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div
			onClick={() => {
				console.log(info.cell.row.original);
			}}
		>
			<Modal
				title={"Update Tag info"}
				isVisible={isVisible}
				onClose={() => {
					setIsVisible(false);
				}}
			>
				<div>
					<form
						onSubmit={handleSubmit}
						method="PUT"
						encType="multipart/form-data"
						className="mx-auto flex w-full flex-grow flex-col items-center justify-between gap-10"
					>
						<div className="flex w-full flex-col gap-4 p-2">
							<div className="flex flex-col">
								<div className="mt-5 flex h-auto w-full flex-col">
									<label
										htmlFor="action"
										className="mb-2 text-sm font-medium text-gray-700"
									>
										Corrective Actions
									</label>
									<textarea
										className="border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-blue-300 h-auto w-full rounded-md"
										rows={4}
										cols={10}
										onChange={handleInputChange}
										label="action"
										placeholder="Please enter additional data here"
										type="Corrective Actions"
										name="action"
										size="input-sm"
										value={formData?.action}
									/>
								</div>

								<div className="mt-5 flex h-auto w-full flex-col">
									<label
										htmlFor="text"
										className="mb-2 text-sm font-medium text-gray-700"
									>
										Note
									</label>
									<textarea
										className="border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-blue-300 h-auto w-full rounded-md"
										rows={4}
										cols={10}
										onChange={handleInputChange}
										label="text"
										placeholder="Please enter additional data here"
										type="text"
										name="text"
										size="input-sm"
										value={formData?.text}
									/>
								</div>
							</div>
							<div className="flex w-full flex-col items-center justify-center gap-2 py-1">
								<Button
									className="btn btn-neutral h-10 w-full border-solid"
									type="submit"
									disabled={isSubmitting}
								>
									{isSubmitting ? (
										<>
											<span className="loading loading-spinner"></span>
											processing...
										</>
									) : (
										"Submit"
									)}
								</Button>
								<Button
									className="btn btn-outline btn-neutral btn-sm h-10 w-full border-solid"
									onClick={() => {
										setFormData(formData);
										setIsVisible(false);
									}}
								>
									Cancel
								</Button>
							</div>
						</div>
					</form>
				</div>
			</Modal>
			<Pencil2Icon
				className="w-5 h-5 cursor-pointer"
				onClick={() => setIsVisible(!isVisible)}
			/>
		</div>
	);
}

export default Report;
