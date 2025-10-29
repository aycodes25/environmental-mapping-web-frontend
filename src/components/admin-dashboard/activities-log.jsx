import React, { useEffect, useMemo, useState } from "react";
import MessageModal from "./modal.jsx";
import TanstackTable from "../TanstackTable";
import WebIcon from "../custom/WebIcons";
import { customFetch, formatDate } from "../../utils";
import { toast } from "react-toastify";

const ActivitiesLog = () => {
    // Dropdown states (match pattern from full-dashboard)
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showTimePeriodDropdown, setShowTimePeriodDropdown] = useState(false);
    const [startDate, setStartDate] = useState("Start Date");
    const [endDate, setEndDate] = useState("End Date");
    const [timePeriod, setTimePeriod] = useState("Monthly");

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.dropdown-container')) {
                setShowStartDatePicker(false);
                setShowEndDatePicker(false);
                setShowTimePeriodDropdown(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);
	const columns = [
		{
			accessorKey: "tagId",
			header: () => <span>Tag ID</span>,
			cell: ({ row }) => <span className="text-gray-800">{row.original.tagId}</span>,
		},
		{ accessorKey: "type", header: () => <span>Type</span>, cell: ({ row }) => <span className="text-gray-800">{row.original.type}</span> },
		{ accessorKey: "facility", header: () => <span>Facility</span>, cell: ({ row }) => <span className="text-gray-800">{row.original.facility}</span> },
		{ accessorKey: "source", header: () => <span>Source</span>, cell: ({ row }) => <span className="text-gray-800">{row.original.source}</span> },
		{ accessorKey: "extent", header: () => <span>Extent</span>, cell: ({ row }) => <span className="text-gray-800">{row.original.extent}</span> },
		{
			accessorKey: "status",
			header: () => <span>Status</span>,
			cell: ({ row }) => {
				const s = row.original.status;
				const color = s === "Active" ? "text-green-600" : s === "Pending" ? "text-yellow-500" : "text-red-500";
				return <span className={`font-medium ${color}`}>{s}</span>;
			},
		},
		{ accessorKey: "tagger", header: () => <span>Tagger</span>, cell: ({ row }) => <span className="text-gray-800">{row.original.tagger}</span> },
		{ accessorKey: "date", header: () => <span>Date</span>, cell: ({ row }) => <span className="text-gray-800">{row.original.date}</span> },
        {
            accessorKey: "action", header: () => <span>Action</span>, cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <button
                        className="p-1 rounded hover:bg-gray-100"
                        onClick={() => handleEditStart(row.original)}
                        aria-label="Edit tag"
                    >
                        <WebIcon icon="edit" className="w-5 h-5" />
                    </button>
                    <button
                        className="p-1 rounded hover:bg-gray-100"
                        onClick={() => handleDelete(row.original.tagId)}
                        aria-label="Delete tag"
                    >
                        <WebIcon icon="delete" className="w-5 h-5" />
                    </button>
                    <button
                        className="p-1 rounded hover:bg-gray-100"
                        onClick={() => handleDeleteModelTags(row.original.modelId)}
                        aria-label="Delete all tags for model"
                        disabled={!row.original.modelId}
                        title={!row.original.modelId ? "No model id on this tag" : "Delete all tags for this model"}
                    >
                        <WebIcon icon="trash2" className="w-5 h-5" />
                    </button>
                </div>
            )
        },
	];

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [editForm, setEditForm] = useState({ action: "", presence: "", text: "", type: "", objectName: "" });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await customFetch.get("/tag/all-tags");
                const tags = Array.isArray(res.data?.data) ? res.data.data : [];
                const mapped = tags.map((t) => ({
                    tagId: t?._id,
                    type: (t?.type || "").toString().replace(/\b\w/g, (c) => c.toUpperCase()),
                    facility: t?.model?.location?.name || t?.model?.location || "-",
                    source: t?.sample?.name || t?.objectName || "-",
                    extent: t?.presence || t?.taggedInfo?.extent || "-",
                    status: t?.action || "-",
                    tagger: t?.user?.username || t?.user?.email || "-",
                    date: t?.createdAt ? formatDate(t.createdAt) : "-",
                    modelId: t?.model?._id || null,
                }));
                setRows(mapped);
            } catch (e) {
                setRows([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Search state
    const [search, setSearch] = useState("");

    const filteredRows = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter((r) => {
            const values = [r.tagId, r.type, r.facility, r.source, r.extent, r.status, r.tagger, r.date]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return values.includes(q);
        });
    }, [search, rows]);

    async function handleDelete(id) {
        try {
            const yes = window.confirm("Delete this tag? This cannot be undone.");
            if (!yes) return;
            await customFetch.delete(`/tag/tags-delete/${id}`);
            setRows((prev) => prev.filter((r) => r.tagId !== id));
            toast.success("Tag deleted");
        } catch (e) {
            toast.error("Failed to delete tag");
        }
    }

    async function handleDeleteModelTags(modelId) {
        if (!modelId) return;
        try {
            const yes = window.confirm("Delete all tags for this model? This cannot be undone.");
            if (!yes) return;
            await customFetch.delete(`/tag/delete-model-tags/${modelId}`);
            setRows((prev) => prev.filter((r) => r.modelId !== modelId));
            toast.success("All tags for model deleted");
        } catch (e) {
            toast.error("Failed to delete model tags");
        }
    }

    function handleEditStart(row) {
        setEditingId(row.tagId);
        setEditForm({
            action: row.status || "",
            presence: row.extent || "",
            text: "",
            type: (row.type || "").toLowerCase(),
            objectName: row.source || "",
        });
    }

    async function handleEditSubmit() {
        if (!editingId) return;
        try {
            setEditSubmitting(true);
            await customFetch.put(`/tag/update-tag/${editingId}`, {
                action: editForm.action,
                presence: editForm.presence,
                text: editForm.text,
                type: editForm.type,
                objectName: editForm.objectName,
            });
            setRows((prev) => prev.map((r) => r.tagId === editingId ? {
                ...r,
                status: editForm.action,
                extent: editForm.presence,
                source: editForm.objectName || r.source,
                type: (editForm.type || r.type).toString().replace(/\b\w/g, (c) => c.toUpperCase()),
            } : r));
            setEditingId(null);
            toast.success("Tag updated");
        } catch (e) {
            toast.error("Failed to update tag");
        } finally {
            setEditSubmitting(false);
        }
    }

    const tableData = filteredRows;

    // Modal state for download actions
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [downloadSuccess, setDownloadSuccess] = useState(true);

    return (
        <div className="bg-white rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl p-4 sm:p-5 md:p-6 mx-2 sm:mx-4 lg:mx-5">
            {/* Header and Filters */}
            <div className="flex items-center justify-between mb-3 md:mb-4 gap-2 sm:gap-3">
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Activities Log</h2>
                <div className="flex items-center flex-wrap gap-2 sm:gap-3">
                    {/* Start Date */}
                    <div className="relative dropdown-container">
                    <button onClick={() => setShowStartDatePicker(!showStartDatePicker)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                        <WebIcon icon="calendar" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="text-sm text-gray-700 whitespace-nowrap">{startDate}</span>
                        <WebIcon icon="chevron_down" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    {showStartDatePicker && (
                        <input
                            type="date"
                            className="absolute top-full mt-1 z-50 border border-gray-300 rounded-lg p-2"
                            onChange={(e) => {
                                const d = new Date(e.target.value);
                                setStartDate(`${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`);
                                setShowStartDatePicker(false);
                            }}
                            autoFocus
                        />
                    )}
                    </div>

                    {/* End Date */}
                    <div className="relative dropdown-container">
                    <button onClick={() => setShowEndDatePicker(!showEndDatePicker)} className="flex items-center gap-2 px-3 py-2 border-l border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                        <WebIcon icon="calendar" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="text-sm text-gray-700 whitespace-nowrap">{endDate}</span>
                        <WebIcon icon="chevron_down" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    {showEndDatePicker && (
                        <input
                            type="date"
                            className="absolute top-full mt-1 z-50 border border-gray-300 rounded-lg p-2"
                            onChange={(e) => {
                                const d = new Date(e.target.value);
                                setEndDate(`${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`);
                                setShowEndDatePicker(false);
                            }}
                            autoFocus
                        />
                    )}
                    </div>

                    {/* Time Period */}
                    <div className="relative dropdown-container">
                    <button onClick={() => setShowTimePeriodDropdown(!showTimePeriodDropdown)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                        <span className="text-sm text-gray-700">{timePeriod}</span>
                        <WebIcon icon="chevron_down" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    {showTimePeriodDropdown && (
                        <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[120px]">
                            {["Monthly","Weekly","Daily"].map((period) => (
                                <button
                                    key={period}
                                    onClick={() => { setTimePeriod(period); setShowTimePeriodDropdown(false); }}
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
                        <WebIcon icon="chevron_down" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
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
                        placeholder="Search by tagId, type, facility, source, extent, status, tagger, date...."
                    />
                    <WebIcon icon="search" className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
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
                    <button onClick={() => { setDownloadSuccess(true); setShowDownloadModal(true); }} className="p-1 rounded hover:bg-gray-100">
                        <WebIcon icon="download" className="w-6 h-6" />
                    </button>
                    <WebIcon icon="printer" className="w-6 h-6" />
                </div>
            </div>

            {editingId && (
                <div className="mb-4 p-4 border rounded-lg bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <input className="border rounded px-2 py-1 text-sm" placeholder="Action" value={editForm.action} onChange={(e) => setEditForm({ ...editForm, action: e.target.value })} />
                        <input className="border rounded px-2 py-1 text-sm" placeholder="Presence / Extent" value={editForm.presence} onChange={(e) => setEditForm({ ...editForm, presence: e.target.value })} />
                        <input className="border rounded px-2 py-1 text-sm" placeholder="Type (incident/sampling)" value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })} />
                        <input className="border rounded px-2 py-1 text-sm" placeholder="Source / Object Name" value={editForm.objectName} onChange={(e) => setEditForm({ ...editForm, objectName: e.target.value })} />
                        <input className="border rounded px-2 py-1 text-sm col-span-1 sm:col-span-2 lg:col-span-3" placeholder="Notes" value={editForm.text} onChange={(e) => setEditForm({ ...editForm, text: e.target.value })} />
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                        <button className="px-3 py-1.5 text-sm rounded border" onClick={() => setEditingId(null)}>Cancel</button>
                        <button className="px-3 py-1.5 text-sm rounded bg-[#412461] text-white disabled:opacity-50" disabled={editSubmitting} onClick={handleEditSubmit}>
                            {editSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            )}

            {/* Download modal */}
            <MessageModal
                isOpen={showDownloadModal}
                onClose={() => setShowDownloadModal(false)}
                variant={downloadSuccess ? "success" : "error"}
                reportId="I-0125"
                onRetry={() => { setDownloadSuccess(true); setShowDownloadModal(false); }}
                onCancel={() => setShowDownloadModal(false)}
            />

            {/* Table */}
            <div className="mt-4 overflow-x-auto">
                {loading ? (
                    <div className="px-4 py-6 text-center text-gray-500">Loading...</div>
                ) : tableData.length === 0 ? (
                    <div className="px-4 py-6 text-center text-gray-500">The list is empty.</div>
                ) : (
                    <>
                        <TanstackTable tableData={tableData} columns={columns} />
                        <div className="flex justify-end mt-2">
                            <button className="text-xs text-purple-700">See All</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ActivitiesLog;


