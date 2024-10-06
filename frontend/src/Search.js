import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Col, Row, Form, Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Search = () => {
  const [position, setPosition] = useState([0, 0]); // Default position (0, 0)
  const [marker, setMarker] = useState(null);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [cloudCoverage, setCloudCoverage] = useState(0);

  const navigate = useNavigate(); // Initialize useNavigate

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

  // Handler to navigate to DataDisplay with the selected data
  const handleNavigate = () => {
    navigate('/data-display', {
      state: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        startDate,
        endDate,
        cloudCoverage: parseInt(cloudCoverage),
      },
    });
  };
  // Handler to navigate to DataDisplay with the selected data as query parameters
const handleNavigateSearch = () => {
  const params = new URLSearchParams({
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    startDate,
    endDate,
    cloudCoverage: parseInt(cloudCoverage),
  }).toString();

  navigate(`/search-data?${params}`);
};

  return (
    <div>
      <Container className="mt-4">
        <Row>
          <Col>
            <div className="bubble-header">
              <h1 >Welcome to Landsat Data Viewer</h1>
              <h3>A SpaceApps Challenge Project</h3>
            </div>
          </Col>
        </Row>
      </Container>
      <Container className="mt-4">
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
      </Container>
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
            <Row>
              <Col>
              Starting Date
              <Form.Group as={Form.Col} controlId="startDate">
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Form.Group>
              </Col>
              <Col>
              Ending Date
              <Form.Group as={Form.Col} controlId="endDate">
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Form.Group>
              </Col>
            </Row>
          </Form.Group>
          <Form.Group controlId="cloudCoverage">
            <Form.Label>Omit Data Where Cloud Coverage is Greater than (%)</Form.Label>
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
      {/* Button to trigger navigation */}
      <Button className="mt-3" onClick={handleNavigateSearch}>
        View Landsat Data
      </Button>
    </div>
  );
};

export default Search;
