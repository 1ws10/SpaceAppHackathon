// src/Search.js
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Row, Form, Container, Navbar, Nav } from 'react-bootstrap';

const Search = () => {
  const [position, setPosition] = useState([0, 0]); // Default position (0, 0)
  const [marker, setMarker] = useState(null);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [cloudCoverage, setCloudCoverage] = useState(0);
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        setMarker([e.latlng.lat, e.latlng.lng]);
        setLatitude(e.latlng.lat);
        setLongitude(e.latlng.lng);
      },
    });
    return null;
  };
  const handleSearch = () => {
    const formData = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      startDate,
      endDate,
      cloudCoverage,
    };
     // Convert formData to query string for GET request
     const queryString = new URLSearchParams(formData).toString();
     console.log('GET request data:', queryString);
     // Make your GET request here using fetch or axios
   };

  return (
    <div>
      <MapContainer center={position} zoom={2} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {marker && (
          <Marker position={marker}>
            <Popup>
              Selected Location: <br /> Latitude: {marker[0]} <br /> Longitude: {marker[1]}
            </Popup>
          </Marker>
        )}
        <MapClickHandler />
      </MapContainer>
      <div className="mt-3">
        <Form>
        <Form.Group controlId="latitude">
            <Form.Label>Latitude</Form.Label>
            <Form.Control
              type="text"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="Enter Latitude"
            />
          </Form.Group>
          <Form.Group controlId="longitude">
            <Form.Label>Longitude</Form.Label>
            <Form.Control
              type="text"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="Enter Longitude"
            />
          </Form.Group>
          <Form.Group controlId="dateRange">
            <Form.Label>Date Range</Form.Label>
            <Row>
              <Form.Group as={Form.Col} controlId="startDate">
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Form.Group>
              <Form.Group as={Form.Col} controlId="endDate">
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Form.Group>
            </Row>
              
            
          </Form.Group>
          <Form.Group controlId="cloudCoverage">
            <Form.Label>Cloud Coverage (%)</Form.Label>
            <Form.Control
              type="range"
              min="0"
              max="100"
              value={cloudCoverage}
              onChange={(e) => setCloudCoverage(e.target.value)}
            />
            <Form.Text>{cloudCoverage}%</Form.Text>
          </Form.Group>
        </Form>
      </div>
      
    </div>
  );
};

export default Search;
