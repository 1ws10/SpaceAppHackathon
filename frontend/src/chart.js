import React from "react";
// import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { LineChart } from "@mui/x-charts/LineChart";
import { bands } from "./constants";

export default function WavelengthChart({ graphData }) {
  return (
    <LineChart
      height={600}
      xAxis={[{ dataKey: "wavelength", label: "Wavelength", valueFormatter: (value) => bands[value] ? bands[value] : value + " nm" }]}
      yAxis={[{ dataKey: "reflectance", min: 0, label: "Reflectance" }]}
      dataset={graphData}
      className="p-8"
      series={[
        {
          dataKey: "reflectance",
          label: "Reflectance",
          color: "#8884d8",
        },
      ]}
    />
  );
}
