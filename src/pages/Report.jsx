// eslint-disable-next-line no-unused-vars
import React, { useEffect, useMemo, useState } from "react";
// import { Table } from '../components';
import {
  customFetch,
  filterDataByDateRange,
  formatDate,
  formatTime,
  removeCommas,
} from "../utils";
import { toast } from "react-toastify";
import { useLoaderData } from "react-router-dom";
import TanstackTable from "../components/TanstackTable";

export const ReportLoader = () => async () => {
  let tags = [];

  const the_tags = await customFetch.get("/tag/all-tags");
  if (tags.data?.status !== "error") {
    tags = the_tags.data.data;
  } else {
    toast.error(the_tags.data.message);
  }

  return { tags };
};

const Report = () => {
  const { tags } = useLoaderData();
  const [activeItem, setActiveItem] = useState("Sample");
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [tagsData, setTagsData] = useState(tags);

  const handleItemClick = (item) => {
    setActiveItem(item);
  };

  useEffect(() => {
    setTagsData(tags);
  }, [tags]);

  useEffect(() => {
    // console.log(startDate, endDate);
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

  const columnSample = useMemo(
    () => [
      {
        accessorFn: (row) => row.model?.modelName,
        header: "Model Name",
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
        accessorFn: (row) => row?.sample?.name,
        header: "Sample Type",
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
        accessorKey: "locations",
        header: "Location",
      },
      {
        accessorKey: "evidence",
        header: "Evidence",
        cell: (info) => (
          <img className="w-20 h-20 rounded-full" src={info.getValue()} />
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
    ],
    []
  );


  const columnIncident = useMemo(
    () => [
      {
        accessorFn: (row) => row.model?.modelName,
        header: "Model Name",
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
        accessorFn: (row) => row?.incident?.name,
        header: "Incident",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "action",
        header: "Corrective Actions",
      },
      {
        accessorKey: "locations",
        header: "Location",
      },
      {
        accessorKey: "evidence",
        header: "Evidence",
        cell: (info) => (
          <img className="w-20 h-20 rounded-full" src={info.getValue()} />
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
    ],
    []
  );

  const columnSafety = useMemo(
    () => [
      {
        accessorFn: (row) => row.model?.modelName,
        header: "Model Name",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "objectName",
        header: "Object Name",
      },
      {
        accessorKey: "slug",
        header: "Slug",
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
        accessorKey: "evidence",
        header: "Evidence",
        cell: (info) => (
          <img className="w-20 h-20 rounded-full" src={info.getValue()} />
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
          <h3
            className={`${
              activeItem === "Activity" ? "text-white bg-black" : ""
            } px-5 max-sm:px-3 py-1 rounded-full cursor-pointer font-bold`}
            onClick={() => handleItemClick("Safety")}
          >
            Safety
          </h3>
        </div>
      </div>
      {activeItem === "Sample" ? (
        <section className="flex justify-center items-center">
          <TanstackTable
            columns={columnSample}
            tableData={tagsData.filter((items) => items.type === "sampling")}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
        </section>
      ) : activeItem === "Incident" ? (
        <section className="flex justify-center items-center">
          <TanstackTable
            columns={columnIncident}
            tableData={tagsData.filter((items) => items.type === "incident")}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
        </section>
      ) : (
        <section className="flex justify-center items-center">
          <TanstackTable
            columns={columnSafety}
            tableData={tagsData.filter((items) => items.type === "safety")}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
        </section>
      )}
    </div>
  );
};

export default Report;
