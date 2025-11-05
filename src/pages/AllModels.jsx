/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import {
	Link,
	useLoaderData,
	useNavigate,
	useSearchParams,
} from "react-router-dom";
import RemoveIcon from "@mui/icons-material/Remove";
import { FaTrash, FaEdit } from "react-icons/fa";
import { useSelector } from "react-redux";
import { memoize } from "proxy-memoize";
import { customFetch, getRealFileUrl } from "../utils";
import { toast } from "react-toastify";
import { Button, Card } from "@mui/material";
import { Button as ShButton } from "../components/ui/button";
import ReactPaginate from "react-paginate";
import { useCallback } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { getUserFromLocalStorage } from "../redux/reducers/userReducer";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

// import ModalCard component.
import { ModelCard } from "../components/ModelCard";
import { deleteFromDb } from "@/components/SceneComponent";
import ModelsOverview from "./new/ModelsOverview";
import SearchInput from "../components/ui/search-input";

const url = "/model/get-models";

const modelQuery = {
	queryKey: ["model"],
	queryFn: () => customFetch(url),
};

export const loader = (queryClient) => async () => {
	const response = await queryClient.ensureQueryData(modelQuery);

	let model = [];
	if (response.data.status !== "error") {
		model = response.data.data || [];
	} else {
		toast.error(response.data.message);
	}
	return { model };
};

const AllModels = () => {
	const { model } = useLoaderData();
	const [searchParams] = useSearchParams();
	const isCompletedView = searchParams.get("type") === "completed";

	// Filter based on the URL query parameter
	const filteredModels = useMemo(() => {
		return model.filter((item) =>
			isCompletedView ? item.isComplete : !item.isComplete
		);
	}, [model, isCompletedView]);

	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [modelList, setModelList] = useState([]);
	const [searchText, setSearchText] = useState("");
	const [deleteModel, setDeleteModel] = useState(false);
	const [modelToDelList, setModelToDelList] = useState([]);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [itemOffset, setItemOffset] = useState(0);
	const itemsPerPage = 6;
	const endOffset = itemOffset + itemsPerPage;

	// Use filteredModels instead of model
	const currentItems = useMemo(
		() => filteredModels.slice(itemOffset, endOffset),
		[endOffset, itemOffset, filteredModels]
	);

	// Use filteredModels for pagination
	const pageCount = Math.max(1, Math.ceil(filteredModels.length / itemsPerPage));

	const handlePageClick = (event) => {
		setItemOffset(event.selected * itemsPerPage);
	};

	const user = useSelector(memoize((state) => state.userState.user));
	const localUser = getUserFromLocalStorage();
	const currentUser = localUser || user;

	const fetchData = async () => {
		const response = await customFetch(url);
		if (response.data.status !== "error") {
			const allModels = response.data.data || [];
			// Filter based on the current view and respect pagination on first load
			const filtered = allModels.filter((item) =>
				isCompletedView ? item.isComplete : !item.isComplete
			);
			// Reset to first page then slice
			setItemOffset(0);
			setModelList(filtered.slice(0, itemsPerPage));
		} else {
			toast.error(response.data.message);
		}
	};

	useEffect(() => {
		fetchData();
	}, [isCompletedView]); // Re-fetch when the view changes

	const mutation = useMutation(
		// hack - post method?
		(ids) =>
			customFetch.post(`/model/soft-delete-models/`, { modelIds: ids }),
		{
			onSuccess: async () => {
				toast.success("Facility Section(s) deleted successfully");
				await queryClient.invalidateQueries("model");
				const response = await queryClient.fetchQuery(
					["model"],
					modelQuery
				);
				if (response.data.status !== "error") {
					setModelList(response.data.data);
				} else {
					toast.error(response.data.message);
				}
			},
			onError: (error) => {
				toast.error(error.message);
			},
		}
	);

	const handleDeleteModels = () => {
		setConfirmDelete(false);
		setDeleteModel(false);
		mutation.mutate(modelToDelList);
		modelList.forEach((m) => {
			if (modelToDelList.includes(m._id)) {
				deleteFromDb(getRealFileUrl(m.file)).then(console.log);
			}
		});
	};

	useEffect(() => {
		setModelList(currentItems);
	}, [currentItems]);

	// Clamp itemOffset when filtered list shrinks to avoid empty pages
	useEffect(() => {
		const total = filteredModels.length;
		const maxPageIndex = Math.max(0, Math.ceil(total / itemsPerPage) - 1);
		const desiredOffset = Math.min(itemOffset, maxPageIndex * itemsPerPage);
		if (itemOffset !== desiredOffset) setItemOffset(desiredOffset);
	}, [filteredModels, itemsPerPage, itemOffset]);

	const handleDeleteAModel = (id) => {
		setConfirmDelete(false);
		setDeleteModel(false);
		mutation.mutate([id]);
	};

	const deleteModels = () => {
		setConfirmDelete(false);
		setDeleteModel(false);
	};

	const handleCheckedForSoftDelete = (id) => {
		if (modelToDelList.includes(id)) {
			setModelToDelList(modelToDelList.filter((item) => item !== id));
		} else {
			setModelToDelList([...modelToDelList, id]);
		}
	};

	const handleFilterModels = useCallback(
		(search) => {
			const term = (search || "").toLowerCase();
			if (!term.length) {
				setItemOffset(0);
				setModelList(filteredModels.slice(0, itemsPerPage));
				return;
			}
			const regex = new RegExp(`.*${term}.*`, "i");
			const searchResult = filteredModels.filter((item) => {
				return regex.test((item.modelName || "").toLowerCase());
			});
			setItemOffset(0);
			setModelList(searchResult.slice(0, itemsPerPage));
		},
		[filteredModels, itemsPerPage]
	);

	return (
		<div className="AllModels box-border w-full py-5">
			{/* Models Overview Section */}
			<ModelsOverview
				data={{
					totalModels: model?.length || 0,
					completedModels: model?.filter((m) => m.isComplete)?.length || 0,
					activeModels: model?.filter((m) => !m.isComplete)?.length || 0,
					deletedModels: 0,
				}}
			/>

			<main className="w-full mt-4">
				{/* Toggle row */}
				<div className="mb-4 w-full px-1 lg:px-3 xl:px-5 flex items-center gap-3">
					<button
						onClick={() => navigate("/admin/models")}
						className={`h-[46px] rounded-[100px] px-5 text-sm font-medium border ${
							!isCompletedView
								? "bg-primary text-white border-primary"
								: "bg-white text-gray-600 border-gray-300"
						}`}
					>
						All Facilities
					</button>
					<button
						onClick={() => navigate("/admin/models?type=completed")}
						className={`h-[46px] rounded-[100px] px-5 text-sm font-medium border ${
							isCompletedView
								? "bg-primary text-white border-primary"
								: "bg-white text-gray-600 border-gray-300"
						}`}
					>
						Complete Facilities
					</button>
				</div>

				<div className="modelControl mb-3 w-full items-center justify-end px-1 lg:px-3 xl:px-5">
					{deleteModel ? (
						<div className="deleteModeWrapper flex flex-row items-center justify-between">
							<div
								className="backBtnWrapper flex flex-row items-center justify-center gap-4"
								onClick={deleteModels}
							>
								<div className="back flex h-10 items-center justify-center">
									<img
										src="/img/back (4).png"
										alt="icon"
										className="my-auto"
									/>
								</div>
								<Button className="add btn btn-sm mr-5 bg-white shadow-none">
									<div className="flex max-sm:text-sm">back</div>
								</Button>
							</div>
							<Button
								className="add btn btn-success btn-sm mr-5 bg-red-900"
								onClick={() => setConfirmDelete(true)}
							>
								<RemoveIcon style={{ color: "#FFF" }} />
								<p className="text-white max-md:truncate max-sm:text-sm">
									Delete Selected Facility Sections
								</p>
							</Button>
						</div>
					) : null}
				</div>

				{/* Search and actions row */}
				<div className="mx-3 w-[94%] flex items-center justify-between gap-4">
					<SearchInput
						value={searchText}
						onChange={(v) => {
							setSearchText(v);
							handleFilterModels(v);
						}}
						placeholder="Search by Facility, Status, Location..."
					/>
					<div className="flex items-center gap-3">
						{!deleteModel &&
							["admin", "superAdmin"].includes(currentUser.role) && (
								<>
									<Link
										to={`${
											["admin", "superAdmin"].includes(
												currentUser.role
											)
												? "/admin/models/add-model"
												: currentUser.role === "sampler"
												? "/sampler/models/add-model"
												: "/login"
										}`}
									>
										<ShButton className="w-[206px] h-[48px] rounded-[20px] bg-primary text-white border border-primary shadow-none">
											<p className="max-sm:text-sm">
												Add Facility Model
											</p>
										</ShButton>
									</Link>
									<ShButton
										onClick={() => setDeleteModel(true)}
										className="w-[206px] h-[48px] rounded-[20px] bg-white text-primary border border-primary shadow-none"
									>
										<p className="max-sm:text-sm">Delete Multiple</p>
									</ShButton>
								</>
							)}
					</div>
				</div>
				<div className="flex flex-wrap justify-start gap-6 p-6">
					{modelList?.map((item, index) => (
						<div
							key={index}
							className="w-[calc(33.33%-1rem)] min-w-[300px]"
						>
							<ModelCard
								model={item}
								onDelete={handleDeleteAModel}
								onEdit={(id) =>
									navigate(
										`/${
											["admin", "superAdmin"].includes(user?.role)
												? "admin"
												: user?.role
										}/edit-model/${id}`
									)
								}
								deleteModel={deleteModel}
								onCheck={handleCheckedForSoftDelete}
								userRole={user?.role}
							/>
						</div>
					))}
				</div>

				<div className="navigatonBtnContainer -mt-5">
					<ReactPaginate
						previousLabel="Prev"
						nextLabel="Next"
						pageClassName="flex h-10 w-10 items-center justify-center rounded-full text-center text-xl"
						pageLinkClassName="page-link"
						previousClassName="flex h-10 w-10 items-center justify-center rounded-full text-center text-xl font-bold"
						previousLinkClassName="page-link"
						nextClassName="flex h-10 w-10 items-center justify-center rounded-full text-center text-xl font-bold"
						nextLinkClassName="page-link"
						breakLabel="..."
						breakClassName="flex h-10 w-10 items-center justify-center rounded-full text-center text-xl font-bold"
						breakLinkClassName="page-link"
						pageCount={pageCount}
						marginPagesDisplayed={2}
						pageRangeDisplayed={5}
						onPageChange={handlePageClick}
						containerClassName="flex flex-row items-center justify-center gap-2 py-10 text-center text-xl"
						activeclassname="m-1 rounded-full bg-black p-0 text-white"
						forcePage={Math.floor(itemOffset / itemsPerPage)}
					/>
				</div>
				{confirmDelete && (
					<div className="confirmationModalWrapper absolute">
						<div className="confirmationModal">
							<h1>Are you sure you want to delete?</h1>
							<div className="btnWrapper">
								<button
									className="Yes"
									onClick={() => {
										deleteModels();
										handleDeleteModels();
									}}
								>
									Yes
								</button>
								<button
									className="No"
									onClick={() => setConfirmDelete(false)}
								>
									No
								</button>
							</div>
						</div>
					</div>
				)}
			</main>
		</div>
	);
};

export default AllModels;
