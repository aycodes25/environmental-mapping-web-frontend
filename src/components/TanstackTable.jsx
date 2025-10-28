/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	// eslint-disable-next-line no-unused-vars
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { TableVirtuoso } from "react-virtuoso";
import { Box } from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CustomScrollbar from "./CustomScrollbar";
import { Checkbox } from "./ui/checkbox";

// eslint-disable-next-line react/prop-types
export default function TanstackTable({ tableData, columns }) {
	const [sorting, setSorting] = useState([]);
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 10,
	});
	const [rowSelection, setRowSelection] = useState({});
	const tableRef = useRef();

	// eslint-disable-next-line no-unused-vars
	const [data, setData] = useState([]);
	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			pagination,
			rowSelection,
		},
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onPaginationChange: setPagination,
		onSortingChange: (e) => setSorting(e),
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});
	const { rows } = table.getRowModel();

	useEffect(() => {
		setData(tableData);
	}, [tableData]);

	return (
		// eslint-disable-next-line react/prop-types
		<Box className="z-0 h-auto min-h-96 w-full">
			<Box className="flex h-auto min-h-96 w-full flex-col gap-2">
				{rows.length === 0 ? (
					<div className="flex flex-col justify-center items-center w-full h-[600px]">
						<div>No data available</div>
					</div>
				) : (
					<>
							<TableVirtuoso
							id="virtuoso-table"
							style={{
								height: "520px",
								boxShadow: "none",
								border: 0,
								width: "100%",
							}}
							totalCount={rows.length}
							components={{
								Scroller: CustomScrollbar,
								Table: ({ style, ...props }) => {
									return (
										<table
											ref={tableRef}
											className="table table-auto shadow-none w-full"
											{...props}
											style={{
												...style,
												width: "100%",
												tableLayout: "auto",
											}}
										/>
									);
								},
								TableRow: (props) => {
									const index = props["data-index"];
									const row = rows[index];

									return (
										<tr
											className="border-b hover:bg-gray-100"
											{...props}
										>
											{/* Checkbox column */}
											<td className="px-4 py-2 w-12">
												<Checkbox
													checked={row.getIsSelected()}
													onCheckedChange={(value) =>
														row.toggleSelected(!!value)
													}
												/>
											</td>
											{row.getVisibleCells().map((cell) => (
												<td key={cell.id} className="px-4 py-2">
													{flexRender(
														cell.column.columnDef.cell,
														cell.getContext()
													)}
												</td>
											))}
										</tr>
									);
								},
							}}
							fixedHeaderContent={() => {
								return table.getHeaderGroups().map((headerGroup) => (
									<tr key={headerGroup.id} className="bg-primary">
										{/* Checkbox header */}
										<th className="px-4 py-2 text-white font-semibold w-12">
											<Checkbox
												checked={table.getIsAllRowsSelected()}
												indeterminate={table.getIsSomeRowsSelected()}
												onCheckedChange={(value) =>
													table.toggleAllRowsSelected(!!value)
												}
												className="border-white data-[state=checked]:bg-white data-[state=checked]:text-primary"
											/>
										</th>
										{headerGroup.headers.map((header, index) => {
											return (
												<th
													className="px-4 py-2 text-white font-semibold"
													key={index}
													colSpan={header.colSpan}
												>
													{header.isPlaceholder ? null : (
														// eslint-disable-next-line jsx-a11y/click-events-have-key-events
														<div
															{...{
																style: header.column.getCanSort()
																	? {
																			cursor: "pointer",
																			userSelect: "none",
																	  }
																	: {},
																onClick:
																	header.column.getToggleSortingHandler(),
															}}
														>
															{flexRender(
																header.column.columnDef.header,
																header.getContext()
															)}
															{{
																asc: <ExpandMoreIcon />,
																desc: <ExpandLessIcon />,
															}[header.column.getIsSorted()] ??
																null}
														</div>
													)}
												</th>
											);
										})}
									</tr>
								));
							}}
							/>
							<div className="flex flex-wrap w-full items-center justify-center gap-2 pt-[5px] text-xs sm:text-sm">
							<button
									className="rounded border px-2 py-1"
								onClick={() => table.setPageIndex(0)}
								disabled={!table.getCanPreviousPage()}
							>
								{"<<"}
							</button>
							<button
									className="rounded border px-2 py-1"
								onClick={() => table.previousPage()}
								disabled={!table.getCanPreviousPage()}
							>
								{"<"}
							</button>
							<button
									className="rounded border px-2 py-1"
								onClick={() => table.nextPage()}
								disabled={!table.getCanNextPage()}
							>
								{">"}
							</button>
							<button
									className="rounded border px-2 py-1"
								onClick={() =>
									table.setPageIndex(table.getPageCount() - 1)
								}
								disabled={!table.getCanNextPage()}
							>
								{">>"}
							</button>
								<span className="flex items-center gap-1 whitespace-nowrap">
									<div>Page</div>
								<strong>
									{table.getState().pagination.pageIndex + 1} of{" "}
									{table.getPageCount()}
								</strong>
							</span>
								<span className="hidden sm:flex items-center gap-1">
									| Go to page:
								<input
									type="number"
									defaultValue={
										table.getState().pagination.pageIndex + 1
									}
									onChange={(e) => {
										const page = e.target.value
											? Number(e.target.value) - 1
											: 0;
										table.setPageIndex(page);
									}}
										className="w-16 rounded border p-1"
								/>
							</span>
								<select
								value={table.getState().pagination.pageSize}
								onChange={(e) => {
									table.setPageSize(Number(e.target.value));
								}}
									className="border rounded px-2 py-1"
							>
								{[10, 20, 30, 40, 50].map((pageSize) => (
									<option key={pageSize} value={pageSize}>
										Show {pageSize}
									</option>
								))}
							</select>
						</div>
					</>
				)}
			</Box>
		</Box>
	);
}
