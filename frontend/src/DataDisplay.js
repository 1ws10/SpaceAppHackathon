import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const DataDisplay = () => {
  const location = useLocation();
  const [pixelData, setPixelData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const { latitude, longitude, startDate, endDate, cloudCoverage } = location.state;

    const fetchPixelData = async () => {
      try {
        const response = await fetch('/api/get-landsat-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            latitude,
            longitude,
            startDate,
            endDate,
            cloudCoverage,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          setPixelData(data);
        } else {
          setError(data.error || 'An error occurred while fetching data.');
        }
      } catch (err) {
        setError('Failed to fetch data from the server.');
      }
    };

    fetchPixelData();
  }, [location.state]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!pixelData) {
    return <div>Loading data...</div>;
  }

  return (
    <div>
      <h1>Landsat 9 Data for Selected Pixel</h1>
      <div>
        <h3>Selected Pixel Data:</h3>
        <pre>{JSON.stringify(pixelData.selectedPixel, null, 2)}</pre>
      </div>
      <div>
        <h3>Surrounding Pixels Data:</h3>
        <pre>{JSON.stringify(pixelData.surroundingPixels, null, 2)}</pre>
      </div>
    </div>
  );
};

export default DataDisplay;
