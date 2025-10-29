import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { customFetch, formatDate } from "../utils";
import WebIcon from "../components/custom/WebIcons";
import RemoveModal from "../components/admin-dashboard/remove-modal";
import UserOverview from "./new/UserOverview.jsx";
// import UserOverview from "./new/UserOverview.jsx";

const SAMPLE_USERS = [
  {
    _id: "usr_0001",
    username: "sherifat.k",
    fullname: "Sherifat Kimspolo",
    email: "sherifat@example.com",
    locations: { name: "Lagos" },
    role: "tagger",
    models: ["m1", "m2", "m3"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "usr_0002",
    username: "aaron.s",
    fullname: "Aaron Saffy",
    email: "aaron@example.com",
    locations: { name: "Abuja" },
    role: "reviewer",
    models: ["m4"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "usr_0003",
    username: "andre.n",
    fullname: "Andre Nurain",
    email: "andre@example.com",
    locations: { name: "Port Harcourt" },
    role: "tagger",
    models: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Exported loader to satisfy AdminRoute import
export const loader = (queryClient) => async () => {
  try {
    const res = await customFetch.get("/users");
    const users = Array.isArray(res.data?.data) ? res.data.data : [];
    return { users: users.length ? users : SAMPLE_USERS };
  } catch (e) {
    return { users: SAMPLE_USERS };
  }
};

const columns = [
  { key: "fullname", label: "Name" },
  { key: "role", label: "Role" },
  { key: "email", label: "Email" },
  { key: "locations", label: "Location" },
  { key: "models", label: "Models" },
  { key: "createdAt", label: "Created" },
  { key: "status", label: "Status" },
];

const AllUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("All Users");
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeVariant, setRemoveVariant] = useState("confirm");
  const [userToRemove, setUserToRemove] = useState(null);
  const [startDate, setStartDate] = useState("Start Date");
  const [endDate, setEndDate] = useState("End Date");
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [listFilter, setListFilter] = useState("All");
  const [showListDropdown, setShowListDropdown] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await customFetch.get("/users");
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setUsers(list.length ? list : SAMPLE_USERS);
      } catch (e) {
        setUsers(SAMPLE_USERS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const dashboardData = useMemo(() => {
    const totalReviewers = users.filter((u) => (u.role || "").toLowerCase() === "reviewer").length;
    const totalTaggers = users.filter((u) => (u.role || "").toLowerCase() === "tagger").length;
    return {
      totalTagsThisMonth: users.length,
      totalModels: 0,
      totalReviewers,
      totalTaggers,
      todaysModels: 0,
    };
  }, [users]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u._id, u.username, u.fullname, u.email, u.role, u?.locations?.name || u.locations]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [users, search]);

  const tabFiltered = useMemo(() => {
    switch (activeTab) {
      case "Taggers":
        return filtered.filter((u) => (u.role || "").toLowerCase() === "tagger");
      case "Reviewers":
        return filtered.filter((u) => (u.role || "").toLowerCase() === "reviewer");
      case "Inactive Users":
        return filtered.filter((u) => (u.status || "").toLowerCase() === "inactive");
      default:
        return filtered;
    }
  }, [filtered, activeTab]);

  return (
    <div className="p-6 md:p-8 mx-5">
      <UserOverview dashboardData={dashboardData} />
      {/* Tabs + Add user */}
      <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-white rounded-full p-1 border border-gray-200">
          {[
            "All Users",
            "Taggers",
            "Reviewers",
            "Inactive Users",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-full text-xs md:text-sm ${activeTab === tab ? "bg-[#2D1342] text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button className="rounded-full px-3 py-2 bg-[#2D1342] text-white text-xs md:text-sm" onClick={() => navigate("/admin/users/add-user")}>+ Add User</button>
      </div>

      {/* Search and filters */}
      <div className="mb-5 flex flex-col sm:flex-row items-center gap-3 text-end justify-end my-8">
        <div className="relative flex-1 max-w-xl w-full">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Name, Status, Role...."
            className="w-full rounded-full border border-gray-200 pl-4 pr-12 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white shadow ring-1 ring-gray-200 flex items-center justify-center"
          >
            <WebIcon icon="search" className="w-4 h-4 text-gray-700" />
          </button>
        </div>
        {/* Start Date */}
        <div className="relative dropdown-container">
          <button
            onClick={() => setShowStartDatePicker(!showStartDatePicker)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-gray-50 transition-colors border border-gray-200"
          >
            <WebIcon icon="calendar" className="w-4 h-4 text-gray-700" />
            <span className="text-xs text-gray-700">{startDate}</span>
            <WebIcon icon="chevron_down" className="w-4 h-4 text-gray-700" />
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
          <button
            onClick={() => setShowEndDatePicker(!showEndDatePicker)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-gray-50 transition-colors border border-gray-200"
          >
            <WebIcon icon="calendar" className="w-4 h-4 text-gray-700" />
            <span className="text-xs text-gray-700">{endDate}</span>
            <WebIcon icon="chevron_down" className="w-4 h-4 text-gray-700" />
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
        {/* All dropdown */}
        <div className="relative dropdown-container">
          <button
            onClick={() => setShowListDropdown(!showListDropdown)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-gray-50 transition-colors border border-gray-200"
          >
            <span className="text-xs text-gray-700">{listFilter}</span>
            <WebIcon icon="chevron_down" className="w-4 h-4 text-gray-700" />
          </button>
          {showListDropdown && (
            <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[120px]">
              {["All", "Active", "Inactive"].map((s) => (
                <button key={s} onClick={() => { setListFilter(s); setShowListDropdown(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg">{s}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#2D1342] text-white">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider">_id</th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider">username</th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider">fullname</th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider">email</th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider">locations</th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider">role</th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider">models</th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider">createdAt</th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider">updatedAt</th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white text-sm">
            {loading && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-500">Loading...</td></tr>
            )}
            {!loading && tabFiltered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-500">No users found</td></tr>
            )}
            {!loading && tabFiltered.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{u?._id}</td>
                <td className="px-4 py-3">{u?.username || ""}</td>
                <td className="px-4 py-3 font-medium">{u?.fullname || ""}</td>
                <td className="px-4 py-3">{u?.email || ""}</td>
                <td className="px-4 py-3">{u?.role === 'superAdmin' ? 'All locations' : (u?.locations?.name || u?.locations || '')}</td>
                <td className="px-4 py-3">{u?.role || ''}</td>
                <td className="px-4 py-3">{Array.isArray(u?.models) ? u.models.length : 0}</td>
                <td className="px-4 py-3">{u?.createdAt ? formatDate(u.createdAt) : ''}</td>
                <td className="px-4 py-3">{u?.updatedAt ? formatDate(u.updatedAt) : ''}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      className="p-1.5 rounded hover:bg-gray-100 active:scale-95 transition"
                      aria-label="Delete user"
                      onClick={() => { setUserToRemove(u); setRemoveVariant("confirm"); setShowRemoveModal(true); }}
                    >
                      <WebIcon icon="delete" className="w-6 h-6 text-[#160a22]" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Remove modal */}
      <RemoveModal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        variant={removeVariant}
        userDisplayName={userToRemove?.fullname || userToRemove?.username || "this user"}
        onConfirm={() => {
          if (!userToRemove) return;
          // Simulate delete success locally
          setUsers((prev) => prev.filter((x) => x._id !== userToRemove._id));
          setRemoveVariant("success");
          // keep modal open to show success
          setTimeout(() => {
            setShowRemoveModal(false);
            setRemoveVariant("confirm");
            setUserToRemove(null);
          }, 1400);
        }}
      />
    </div>
  );
};

export default AllUsers;


