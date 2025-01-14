import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Line } from "react-chartjs-2";

export const LineChart = ({ chartData }) => {
  if (chartData.chartType !== "line") {
    return <div>Invalid chart type</div>;
  }

  return <Line data={chartData.data} options={chartData.options} />;
};


export const PieChart = ({ chartData }) => {
    if (chartData.chartType !== 'pie') {
      return <div>Invalid chart type</div>;
    }
  
    return <Pie data={chartData.data} options={chartData.options} />;
  };
