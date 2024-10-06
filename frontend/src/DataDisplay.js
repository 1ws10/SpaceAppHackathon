import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

const DataDisplay = () => {
  const location = useLocation();
  const [mapid, setMapId] = useState(null);
  const [token, setToken] = useState(null);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Extract user-selected parameters from location.state
    const { latitude, longitude, startDate, endDate, cloudCoverage } = location.state;

    console.log('Sending data:', {
      latitude,
      longitude,
      startDate,
      endDate,
      cloudCoverage,
    }); // Log the data being sent

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
          }),
        });

        const data = await response.json();
        console.log('Received data:', data); // Log the received data

        if (response.ok) {
          setMapId(data.mapid);
          setToken(data.token);
          setLatitude(data.latitude);
          setLongitude(data.longitude);
        } else {
          setError(data.error || 'An error occurred while fetching data.');
        }
      } catch (err) {
        console.error('Fetch error:', err); // Log any fetch errors
        setError('Failed to fetch data from the server.');
      }
    };

    fetchMapData();
  }, [location.state]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!mapid) {
    return <div>Loading data...</div>;
  }

  // Construct the tile URL
  const tileUrl = token
    ? `/tiles/${mapid}/{z}/{x}/{y}.png?token=${token}`
    : `/tiles/${mapid}/{z}/{x}/{y}.png`;

  return (
    <div className="data-display">
      <h1>Landsat 9 Data for Selected Location</h1>
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        style={{ height: '500px', width: '100%' }}
      >
        <TileLayer
          url={tileUrl}
        />
      </MapContainer>
    </div>
  );
};

export default DataDisplay;
