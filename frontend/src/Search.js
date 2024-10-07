import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import dayjs, { Dayjs } from "dayjs";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Slider from "@mui/material/Slider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import InteractiveGlobe from "./InteractiveGlobe";

const Search = () => {
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [isGlobe, setIsGlobe] = useState(true); // Toggle between Globe and Map
  const [position, setPosition] = useState([0, 0]); // Default position (0, 0)
  const [marker, setMarker] = useState(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  // september 27 2021 by default
  const [startDate, setStartDate] = useState(dayjs("2021-09-27"));
  const [endDate, setEndDate] = useState(dayjs());
  const [cloudCoverage, setCloudCoverage] = useState(10);

  const navigate = useNavigate();

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        setMarker([lat, lng]);
        setLatitude(lat); // Update latitude state
        setLongitude(lng); // Update longitude state
        setSelectedCoordinates({ lat, lng }); // Update selected coordinates for later use
      },
    });
    return null;
  };

  const handleCoordinatesSelection = (lat, lng) => {
    setLatitude(lat);
    setLongitude(lng);
    setSelectedCoordinates({ lat, lng });
  };

  const handleNavigateSearch = () => {
    const params = new URLSearchParams({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      startDate: startDate?.format("YYYY-MM-DD"),
      endDate: endDate?.format("YYYY-MM-DD"),
      cloudCoverage: parseInt(cloudCoverage),
    }).toString();

    navigate(`/data-display?${params}`);
  };

  // Toggle between Globe and Map
  const toggleView = () => {
    setIsGlobe((prevIsGlobe) => !prevIsGlobe);
  };

  return (
    <div>
      <section className="my-4">
        <h1 className="text-4xl">Landsat Data Viewer</h1>
      </section>

      {/* Toggle Button to switch between Globe and Map */}
      <div className="mt-3 text-center">
        <button onClick={toggleView}>{isGlobe ? "Switch to Map" : "Switch to Globe"}</button>
      </div>

      <div className="mt-4">
        {isGlobe ? (
          <div>
            <h2>Select a location on the Globe:</h2>
            <InteractiveGlobe onCoordinatesSelected={handleCoordinatesSelection} />
          </div>
        ) : (
          <div>
            <h2>Select a location on the Map:</h2>
            <MapContainer
              center={position}
              zoom={2}
              style={{ height: "400px", width: "100%", filter: "invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)" }}
            >
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
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-4 flex-col md:flex-row">
        <TextField label="Latitude" variant="outlined" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="Enter Latitude" />
        <TextField label="Longitude" variant="outlined" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="Enter Longitude" />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker label="Start Date" value={startDate} onChange={(newValue) => setStartDate(newValue)} />
          <DatePicker label="End Date" defaultValue={dayjs()} value={endDate} onChange={(newValue) => setEndDate(newValue)} />
        </LocalizationProvider>
        <div>
          <label htmlFor="cloudCoverage">Maximum Cloud Coverage (%):</label>
          <Slider
            id="cloudCoverage"
            defaultValue={10}
            value={cloudCoverage}
            onChange={(e, newValue) => setCloudCoverage(newValue)}
            aria-labelledby="cloudCoverage"
            valueLabelDisplay="auto"
            step={1}
            min={0}
            max={100}
          />
          <span>{cloudCoverage}%</span>
        </div>
      </div>

      {/* Button to trigger navigation */}
      <Button variant="contained" color="primary" className="mt-3" onClick={handleNavigateSearch}>
        View Landsat Data
      </Button>
    </div>
  );
};

export default Search;
