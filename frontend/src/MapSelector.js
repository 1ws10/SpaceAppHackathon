// src/MapSelector.js
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';


const MapSelector = () => {
  const [position, setPosition] = useState([0,0]); // Default position
  const [marker, setMarker] = useState(null);

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        setMarker([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  };

  return (
    <div>
      <MapContainer center={position} zoom={2} style={{ height: '600px', width: '100%' }}>
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
      <div>
        <h4>Selected Coordinates:</h4>
        <p>Latitude: {position[0]}</p>
        <p>Longitude: {position[1]}</p>
      </div>
    </div>
  );
};

export default MapSelector;
