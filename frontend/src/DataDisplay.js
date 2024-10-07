import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import WavelengthChart from "./chart";
import sampleOutput from "./testing/sampleOutput";

import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Import MUI Check Icon


const DataDisplay = () => {
  const location = useLocation();
  const [pixelData, setPixelData] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(true); // For showing the email popup
  const [email, setEmail] = useState(""); // For storing email input
  const [success, setSuccess] = useState(false); // Success state to show checkmark


  const params = new URLSearchParams(location.search);
  const latitude = params.get("latitude");
  const longitude = params.get("longitude");
  const startDate = params.get("startDate");
  const endDate = params.get("endDate");
  const cloudCoverage = params.get("cloudCoverage");

  const wavelengths = {
    SR_B1: 443,
    SR_B2: 482,
    SR_B3: 561,
    SR_B4: 665,
    SR_B5: 705,
    SR_B6: 740,
    SR_B7: 842,
  };

  useEffect(() => {
    const fetchPixelData = async () => {
      try {
        const response = await fetch("/search-data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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
          console.log("Received data:", data); // Log the received data
          const graphData = Object.keys(data.selectedPixel)
            .filter((key) => wavelengths[key]) // Filter out keys without corresponding wavelengths
            .map((key) => {
              return {
                wavelength: wavelengths[key],
                reflectance: data.selectedPixel[key] / 100000,
              };
            });
          setGraphData(graphData);
          console.log("Graph data:", graphData);
        } else {
          setError(data.error || "An error occurred while fetching data.");
        }
      } catch (err) {
        setError("Failed to fetch data from the server.");
        console.error(err);
      }
      // setPixelData(sampleOutput); // Use sample data for testing
    };

    fetchPixelData();
  }, []);

  const handleSubmit = () => {
    console.log("Email submitted:", email);
    setSuccess(true); // Show success state
    setTimeout(() => {
      setShowPopup(false); // Close popup after a delay
      setSuccess(false); // Reset success state for future uses
    }, 2000); // Display checkmark for 2 seconds
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  if (error) {
    return (
      <>
        <div className="mb-2">There wasn't any data for the request you submitted. Return back to search?</div>
        <Button variant="contained" color="primary" href="/search">
          Return to Search
        </Button>
      </>
    );
  }

  if (!pixelData) {
    return <div>Loading data...</div>;
  }

  return (
    <div>
      <h1>Landsat 9 Data for Selected Pixel</h1>
      {/* <div>
        <h3>Selected Pixel Data:</h3>
        <pre>{JSON.stringify(pixelData.selectedPixel, null, 2)}</pre>
      </div>
      <div>
        <h3>Surrounding Pixels Data:</h3>
        <pre>{JSON.stringify(pixelData.surroundingPixels, null, 2)}</pre>
      </div> */}
      <div className="chart-container">
        <h3>Wavelength Reflectance Chart</h3>
        <WavelengthChart graphData={graphData} />
      </div>
      {/* MUI Email Popup Modal */}
      <Dialog open={showPopup} onClose={handleClosePopup}>
        <DialogTitle>Enter email for notifications on the next LandSat overpass</DialogTitle>
        <DialogContent>
          {!success ? (
            <TextField
              autoFocus
              margin="dense"
              label="Email Address"
              type="email"
              fullWidth
              variant="standard"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          ) : (
            <div style={{ textAlign: "center" }}>
              <CheckCircleIcon style={{ color: "green", fontSize: 60 }} />
              <Typography variant="h6" color="green" gutterBottom>
                Submitted Successfully!
              </Typography>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          {!success && (
            <>
              <Button onClick={handleClosePopup} color="secondary">
                Close
              </Button>
              <Button onClick={handleSubmit} color="primary">
                Submit
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DataDisplay;
