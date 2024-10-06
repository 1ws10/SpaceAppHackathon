import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

//dummy data
const data = [
  { wavelength: 400, reflectance: 0.1 },
  { wavelength: 450, reflectance: 0.12 },
  { wavelength: 500, reflectance: 0.15 },
  { wavelength: 550, reflectance: 0.2 },
  { wavelength: 600, reflectance: 0.1 },
  { wavelength: 650, reflectance: 0.5 },
  { wavelength: 700, reflectance: 0.6 },
  { wavelength: 750, reflectance: 0.65 },
  { wavelength: 800, reflectance: 0.5 },
  { wavelength: 850, reflectance: 0.55 },
  { wavelength: 900, reflectance: 0.6 },
  { wavelength: 950, reflectance: 0.65 },
];

const WavelengthChart = () => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="wavelength" label={{ value: 'Wavelength (nm)', position: 'bottom' }} />
        <YAxis label={{ value: 'Reflectance', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="reflectance" stroke="#FFA500" dot={true} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default WavelengthChart;
