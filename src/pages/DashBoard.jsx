/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { ChartBox, ModelList, PieChartBox } from "../components";
import "../styles/DashBoard.css";
import { customFetch } from "../utils";
import { useLoaderData, useNavigate } from "react-router-dom";
import { Card } from "@mui/material";
import { toast } from "react-toastify";
import SampleChart from "../components/SampleChart";
import LineChart from "../components/LineChart";
import BarChart from "../components/BarChart";

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
      <div className="flex justify-center items-center mb-16">
        <div className="flex gap-4 justify-center items-center px-4 py-1 rounded-full bg-slate-300">
          <h3
            className={`${activeItem === "Overview" ? "text-white bg-black" : ""
              } px-5 max-sm:px-3 py-1 rounded-full cursor-pointer font-bold`}
            onClick={() => handleItemClick("Overview")}
          >
            Overview
          </h3>
          <h3
            className={`${activeItem === "Sample" ? "text-white bg-black" : ""
              } px-5 max-sm:px-3 py-1 rounded-full cursor-pointer font-bold`}
            onClick={() => handleItemClick("Sample")}
          >
            Sample
          </h3>
          <h3
            className={`${activeItem === "Incident" ? "text-white bg-black" : ""
              } px-5 max-sm:px-3 py-1 rounded-full cursor-pointer font-bold`}
            onClick={() => handleItemClick("Incident")}
          >
            Incident
          </h3>
          <h3
            className={`${activeItem === "Activity" ? "text-white bg-black" : ""
              } px-5 max-sm:px-3 py-1 rounded-full cursor-pointer font-bold`}
            onClick={() => handleItemClick("Activity")}
          >
            Activity
          </h3>
        </div>
      </div>
      {activeItem === "Overview" ? (
        <div className="flex flex-col gap-4 justify-center items-center w-full">
          <div className="flex flex-row w-full max-[1025px]:flex-wrap justify-center items-center gap-4 max-[1025px]:gap-2">
            <Card className="flex flex-col w-[24.5%] min-h-44 max-md:w-full max-[1025px]:w-[49%] aspect-video bg-[#333fc5] ">
              <ChartBox
                {...{
                  number: parseFloat(positivityRateYearToDate).toFixed(2),
                  title: "Positivity Rate Year To Date",
                }}
                bg="text"
              />
            </Card>
            <Card className="flex flex-col w-[24.5%] min-h-44 max-md:w-full max-[1025px]:w-[49%] aspect-video">
              <ChartBox
                {...{
                  number: parseFloat(positivityRateThisMonth).toFixed(2),
                  title: "Positivity Rate This Month",
                }}
              />
            </Card>
            <Card className="flex flex-col w-[24.5%] min-h-44 max-md:w-full max-[1025px]:w-[49%] aspect-video bg-[#746c6c]">
              <ChartBox
                {...{
                  number: positiveTagsThisMonth,
                  title: "Positive Samples This Month",
                }}
              />
            </Card>
            <Card className="flex flex-col w-[24.5%] min-h-44 max-md:w-full max-[1025px]:w-[49%] aspect-video bg-[#5EA33E]">
              <ChartBox
                {...{
                  number: totalTagsThisMonth,
                  title: "Total Samples This Month",
                }}
              />
            </Card>
          </div>
          <div className="flex w-full flex-row max-[1025px]:flex-wrap justify-center items-center gap-4 max-[1025px]:gap-2">
            <Card
              onClick={() => navigate("models")}
              title="click to navigate to model page"
              className="flex cursor-pointer flex-col w-[24.5%] min-h-44 max-md:w-full max-[1025px]:w-[49%] bg-[#746c6c] aspect-video"
            >
              <ChartBox {...dailyModels} />
            </Card>
            <Card
              onClick={() => navigate("models")}
              title="click to navigate to model page"
              className="flex cursor-pointer flex-col w-[24.5%] min-h-44 max-md:w-full max-[1025px]:w-[49%] bg-[#5EA33E] aspect-video"
            >
              <ChartBox {...totalModel} />
            </Card>
            <Card
              onClick={() => navigate("users")}
              title="click to navigate to users page"
              className="flex cursor-pointer flex-col w-[24.5%] min-h-44 max-md:w-full max-[1025px]:w-[49%] aspect-video"
            >
              <ChartBox {...taggers} />
            </Card>
            <Card
              onClick={() => navigate("users")}
              title="click to navigate to users page"
              className="flex cursor-pointer flex-col w-[24.5%] min-h-44 max-md:w-full max-[1025px]:w-[49%] bg-[#333fc5] aspect-video"
            >
              <ChartBox {...reviewers} bg="text" />
            </Card>
          </div>
          <div className="flex justify-center items-center w-full gap-2l">
            <Card className="w-full box box9">
              <PieChartBox data={data} />
            </Card>
          </div>
        </div>
      ) : activeItem === "Sample" ? (
        <>
          <section className="flex flex-col gap-4 justify-center items-center w-full h-full">
            <div className="flex flex-row justify-center items-center w-full">
              <h2 className="capitalize"> Charts for samples </h2>
            </div>
            <div className="w-full h-[600px] flex flex-col">
              <SampleChart barChartSampleType={barChartSampleType} />
            </div>
            <div className="w-full h-[600px] flex flex-col gap-2">
              <div className="flex flex-row justify-center items-center w-full">
                <h2 className="capitalize">
                  {" "}
                  Graph of samples for this month{" "}
                </h2>
              </div>
              <BarChart
                barDataKey="count"
                xAxisKey="_id"
                barColor="#8884d8"
                data={tagsThisMonth}
              />
            </div>
            <div className="w-full h-[600px] flex flex-col gap-2">
              <div className="flex flex-row justify-center items-center w-full">
                <h2 className="capitalize">
                  {" "}
                  Graph of samples for last month{" "}
                </h2>
              </div>
              <BarChart
                barDataKey="count"
                xAxisKey="_id"
                barColor="#8884d8"
                data={tagsLastMonth}
              />
            </div>
            <div className="w-full h-[600px] flex flex-col gap-2">
              <div className="flex flex-row justify-center items-center w-full">
                <h2 className="capitalize"> Graph of samples year to date </h2>
              </div>
              <BarChart
                barDataKey="count"
                xAxisKey="_id"
                barColor="#8884d8"
                data={tagsYearToDate}
              />
            </div>
            <div className="w-full h-[600px] flex flex-col gap-2">
              <div className="flex flex-row justify-center items-center w-full">
                <h2 className="capitalize">
                  {" "}
                  Graph of positivity rate per month year to date{" "}
                </h2>
              </div>
              <LineChart
                lineDataKey="positivityRate"
                xAxisKey="month"
                lineColor="#000000"
                data={positivityRatePerMonthYearToDate}
              />
            </div>
          </section>
        </>
      ) : activeItem === "Incident" ? (
        <>
          <section className="flex flex-col gap-4 justify-center items-center w-full h-full">
            <div className="w-full h-[600px] flex flex-col gap-2 p-4">
              <SampleChart barChartSampleType={barChartIncidentType} />
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="flex flex-col gap-4 justify-center items-center w-full h-full">
            <div className="w-full h-[600px] flex flex-col gap-2 p-4">
              <ModelList text="Recent Upload Models" users={recentModels} />
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default DashBoard;
