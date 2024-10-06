
import Globe from 'react-globe.gl';
import React, { useState } from 'react';
import { defaultBarMarkerOptions, defaultDotMarkerOptions } from 'react-globe.gl';

const InteractiveGlobe = ({ onCoordinatesSelected }) => {
    const [marker, setMarker] = useState(null); // State for marker position
    const defaultMarker = { lat: 0, lng: 0 }; // Replace with desired coordinates
    
  const handleGlobeClick = (event) => {
    const { lat, lng } = event
    console.log("Clicked coordinates:", lat, lng);
    // Call the parent component's handler and pass the lat/lng
    if (onCoordinatesSelected) {
      onCoordinatesSelected(lat, lng);
    }
    setMarker({ lat, lng });
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '500px', // Full viewport height
        width: '100%',  // Full viewport width
        position: 'relative', // Relative positioning for the globe
        overflow: 'hidden', // Prevent overflow if the globe is too large
      }}
    >
      <Globe
  onGlobeClick={handleGlobeClick} // Click handler for the globe
  globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg" // Satellite texture with visible landmasses
  backgroundColor="rgba(0,0,0,0)" // Optional: transparent background
  bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png" // Topology bumps
  backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png" // Background image (like space)
  onPointHover={(point) => {
    if (point) {
      console.log(`Hovered over point: ${point.city}`);
    }
  }}
  style={{
    width: '60vmin', // Adjust size as needed
    height: '60vmin', // Adjust size as needed
  }}
  markers={[
    {
      id: "marker1",
      city: "Singapore",
      color: "red",
      coordinates: [1.3521, 103.8198],
      value: 50,
    },
    {
      id: "marker3",
      city: "San Francisco",
      color: "orange",
      coordinates: [37.773972, -122.431297],
      value: 35,
    },
  ]} // Always show these markers
  markerColor={(marker) => marker.color} // Use marker color from the marker object
  markerLabel={(marker) => `${marker.city}: ${marker.value}`} // Display city and value in hover label
  markerAltitude={0.1} // Adjust marker altitude if needed
  markerRadius={0.5} // Adjust marker radius
  enableMarkerGlow={false} // Disable glow around the marker
  markerType="dot" // Set marker type to 'dot'
/>
    </div>
  );
};

export default InteractiveGlobe;
