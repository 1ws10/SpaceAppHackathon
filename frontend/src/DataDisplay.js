import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { MapContainer, ImageOverlay } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const DataDisplay = () => {
  const location = useLocation();
  const [imageUrl, setImageUrl] = useState(null);
  const [bounds, setBounds] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const { latitude, longitude, startDate, endDate, cloudCoverage } = location.state;

    const fetchMapData = async () => {
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
          }),});

        const data = await response.json();
        if (response.ok) {
          setImageUrl(data.image_url);
          const lat = data.latitude;
          const lon = data.longitude;
          // Define the bounds for the image overlay
          const delta = 0.05; // Adjust as needed
          setBounds([
            [lat - delta, lon - delta],
            [lat + delta, lon + delta]
          ]);
        } else {
          setError(data.error || 'An error occurred while fetching data.');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to fetch data from the server.');
      }
    };

    fetchMapData();
  }, [location.state]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!imageUrl || !bounds) {
    return <div>Loading data...</div>;
  }

  return (
    <div className="data-display">
      <h1>Landsat 9 Data for Selected Location</h1>
      <MapContainer
        bounds={bounds}
        style={{ height: '500px', width: '100%' }}
      >
        <ImageOverlay url={imageUrl} bounds={bounds} />
      </MapContainer>
    </div>
  );
};

export default DataDisplay;
