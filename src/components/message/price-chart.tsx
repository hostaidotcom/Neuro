"use client";

import React from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  } from "chart.js";
  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface PriceChartProps {
  data: {
    time: string;
    value: number;
  }[];
}

const PriceChart: React.FC<PriceChartProps> = ({ data }) => {
  // Transform data for Chart.js format
  const chartLabels = data.map((point) => point.time); // X-axis (Date/Time)
  const chartDataValues = data.map((point) => point.value); // Y-axis (Price)

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Price (USD)",
        data: chartDataValues,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 2,
        pointRadius: 0, // Removes point markers
        pointHoverRadius: 6, // Highlight point on hover
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
      title: {
        display: true,
        text: "Price History Chart",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        title: {
          display: true,
          text: "Price (USD)",
        },
      },
    },
  };

  return (
    <div className="w-auto h-96 min-w-[600px] min-h-[400px]">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default PriceChart;
