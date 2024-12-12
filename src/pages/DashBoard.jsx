/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { ChartBox, ModelList, PieChartBox } from "../components";
import "../styles/DashBoard.css";
import { customFetch } from "../utils";
import { useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SampleChart from "../components/SampleChart";
import LineChart from "../components/LineChart";
import BarChart from "../components/BarChart";
import { ExpandableCard } from "../components/ExpandableCard";


const url = "/user/dashboard";

const userQuery = {
  queryKey: ["dashboard"],
  queryFn: () => customFetch(url),
};

// eslint-disable-next-line react-refresh/only-export-components
export const loader = (queryClient) => async () => {
  const response = await queryClient.ensureQueryData(userQuery);
  const items = response.data;
  if (response?.data.status === "error") {
    toast.error(response?.data.message);
  }
  return { items };
};

const DashBoard = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("Overview");
  const [item, setItem] = useState([]);
  const fetchData = async () => {
    const response = await customFetch(url);
    if (response.data.status !== "error") {
      setItem(response.data);
    } else {
      toast.error(response.data.message);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleItemClick = (item) => {
    setActiveItem(item);
  };

  const {
    tagsThisMonth,
    tagsLastMonth,
    totalTagsThisMonth,
    positivityRateThisMonth,
    positiveTagsThisMonth,
    tagsYearToDate,
    positivityRateYearToDate,
    positivityRatePerMonthYearToDate,
    totalReviewers,
    totalTaggers,
    totalModels,
    todaysModels,
    modelsInEachLocation,
    TotalTagsBySampleAndDay: dailyData,
    TotalTagsBySampleAndMonth: monthlyData,
    recentModels,
  } = item;

  const dailyModels = {
    title: "Today(s) Facilities",
    number: `${todaysModels}`,
  };
  const totalModel = {
    title: "Total Facilities",
    number: `${totalModels}`,
  };
  const taggers = {
    title: "Samplers",
    number: `${totalTaggers}`,
  };
  const reviewers = {
    title: "Reviewers",
    number: `${totalReviewers}`,
  };
  const barChartSampleType = {
    daily: "Daily samples",
    monthly: "Monthly samples",
    title: "Overview",
    color: "#5EA33E",
    alt: "No Recent Samples",
    data: {
      dailyData,
      monthlyData,
    },
  };
  const barChartIncidentType = {
    daily: "Daily Incidents",
    monthly: "Monthly Incidents",
    title: "Overview",
    color: "#e38557",
    alt: "No Recent Incident",
    data: {
      dailyData: item.TotalIncidentsByDay,
      monthlyData: item.TotalIncidentsByMonth,
    },
  };

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // hack
  const data = (modelsInEachLocation || []).map((item) => ({
    ...item,
    name: item.locationName,
    value: item.totalModels,
    color: getRandomColor(),
  }));

  return (
    <div className="flex flex-col flex-grow p-5 w-auto">
      {/* Navigation */}
      <div className="flex justify-center items-center mb-16">
        <div className="flex gap-4 justify-center items-center px-4 py-1 rounded-full bg-slate-300">
          {["Overview", "Sample", "Incident", "Activity"].map((item) => (
            <button
              key={item}
              className={`
                px-5 max-sm:px-3 py-1 rounded-full cursor-pointer font-bold
                transition-all duration-200
                ${activeItem === item ? "text-white bg-black" : "hover:bg-black/10"}
              `}
              onClick={() => handleItemClick(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Section */}
      {activeItem === "Overview" && (
        <div className="flex flex-col gap-4 justify-center items-center w-full">
          {/* First Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <ExpandableCard
              title="Positivity Rate Year To Date"
              bgColor="bg-[#333fc5]"
              className="text-white"
            >
              <ChartBox
                number={returnNumberOrZero(parseFloat(positivityRateYearToDate).toFixed(2))}
                bg="text"
              />
            </ExpandableCard>

            <ExpandableCard title="Positivity Rate This Month">
              <ChartBox
                number={returnNumberOrZero(parseFloat(positivityRateThisMonth).toFixed(2))}
              />
            </ExpandableCard>

            <ExpandableCard
              title="Positive Samples This Month"
              bgColor="bg-[#746c6c]"
              className="text-white"
            >
              <ChartBox
                number={positiveTagsThisMonth}
              />
            </ExpandableCard>

            <ExpandableCard
              title="Total Samples This Month"
              bgColor="bg-[#5EA33E]"
              className="text-white"
            >
              <ChartBox
                number={totalTagsThisMonth}
              />
            </ExpandableCard>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <ExpandableCard
              title="Today's Facilities"
              bgColor="bg-[#746c6c]"
              className="text-white"
              onClick={() => navigate("models")}
              isClickable
            >
              <ChartBox {...dailyModels} />
            </ExpandableCard>

            <ExpandableCard
              title="Total Facilities"
              bgColor="bg-[#5EA33E]"
              className="text-white"
              onClick={() => navigate("models")}
              isClickable
            >
              <ChartBox {...totalModel} />
            </ExpandableCard>

            <ExpandableCard
              title="Samplers"
              onClick={() => navigate("users")}
              isClickable
            >
              <ChartBox {...taggers} />
            </ExpandableCard>

            <ExpandableCard
              title="Reviewers"
              bgColor="bg-[#333fc5]"
              className="text-white"
              onClick={() => navigate("users")}
              isClickable
            >
              <ChartBox {...reviewers} bg="text" />
            </ExpandableCard>
          </div>

          {/* Pie Chart */}
          <div className="w-full">
            <ExpandableCard title="Location Distribution">
              <PieChartBox data={data} />
            </ExpandableCard>
          </div>
        </div>
      )}

      {/* Sample Section */}
      {activeItem === "Sample" && (
        <div className="space-y-4">
          <ExpandableCard title="Sample Charts">
            <div className="h-[600px]">
              <SampleChart barChartSampleType={barChartSampleType} />
            </div>
          </ExpandableCard>

          <ExpandableCard title="Samples This Month">
            <div className="h-[600px]">
              <BarChart
                barDataKey="count"
                xAxisKey="_id"
                barColor="#8884d8"
                data={tagsThisMonth}
              />
            </div>
          </ExpandableCard>

          <ExpandableCard title="Samples Last Month">
            <div className="h-[600px]">
              <BarChart
                barDataKey="count"
                xAxisKey="_id"
                barColor="#8884d8"
                data={tagsLastMonth}
              />
            </div>
          </ExpandableCard>

          <ExpandableCard title="Samples Year to Date">
            <div className="h-[600px]">
              <BarChart
                barDataKey="count"
                xAxisKey="_id"
                barColor="#8884d8"
                data={tagsYearToDate}
              />
            </div>
          </ExpandableCard>

          <ExpandableCard title="Positivity Rate Per Month">
            <div className="h-[600px]">
              <LineChart
                lineDataKey="positivityRate"
                xAxisKey="month"
                lineColor="#000000"
                data={positivityRatePerMonthYearToDate}
              />
            </div>
          </ExpandableCard>
        </div>
      )}

      {/* Incident Section */}
      {activeItem === "Incident" && (
        <section className="flex flex-col gap-4 justify-center items-center w-full h-full">
          <ExpandableCard title="Incident Overview">
            <div className="h-[600px]">
              <SampleChart barChartSampleType={barChartIncidentType} />
            </div>
          </ExpandableCard>
        </section>
      )}

      {/* Activity Section */}
      {activeItem === "Activity" && (
        <section className="flex flex-col gap-4 justify-center items-center w-full h-full">
          <ExpandableCard title="Recent Upload Models">
            <div className="h-[600px]">
              <ModelList text="Recent Upload Models" users={recentModels} />
            </div>
          </ExpandableCard>
        </section>
      )}
    </div>
  );
};

function returnNumberOrZero(value) {
  if (typeof Number(value) === "number" && value !== "NaN") return value
  return 0
}

export default DashBoard;