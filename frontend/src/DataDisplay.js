import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const DataDisplay = () => {
  const location = useLocation();
  const [pixelData, setPixelData] = useState(null);

  useEffect(() => {
    // Extract data passed from the previous page
    const { selectedPixel, surroundingPixels } = location.state;

    // You can further process the data here if needed
    setPixelData({ selectedPixel, surroundingPixels });
  }, [location.state]);

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
