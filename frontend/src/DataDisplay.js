import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import WavelengthChart from "./chart";
import sampleOutput from "./testing/sampleOutput";

import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Typography, List, ListItem } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import wavelengths from "./constants";

const DataDisplay = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [pixelData, setPixelData] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [error, setError] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false); // For showing the save email popup
  const [showViewModal, setShowViewModal] = useState(false); // For showing the view data popup
  const [email, setEmail] = useState(""); // For storing email input
  const [name, setName] = useState(""); // For storing name input
  const [success, setSuccess] = useState(false); // Success state to show checkmark
  const [savedData, setSavedData] = useState([]); // To store fetched saved data
  const [selectedData, setSelectedData] = useState(null); // To store the selected saved data

  const params = new URLSearchParams(location.search);
  const latitude = params.get("latitude");
  const longitude = params.get("longitude");
  const startDate = params.get("startDate");
  const endDate = params.get("endDate");
  const cloudCoverage = params.get("cloudCoverage");

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
          handleDataReceived(data);
        } else {
          setError(data.error || "An error occurred while fetching data.");
        }
      } catch (err) {
        setError("Failed to fetch data from the server.");
        console.error(err);
      }
    };

    fetchPixelData();
  }, []);

  const handleDataReceived = (data) => {
    setPixelData(data);
    const graphData = Object.keys(data.selectedPixel)
      .filter((key) => wavelengths[key])
      .map((key) => {
        return {
          band: key,
          wavelength: wavelengths[key],
          reflectance: data.selectedPixel[key] / 100000,
        };
      });
    setGraphData(graphData);
  };

  const handleSaveClick = () => {
    setShowSaveModal(true);
  };

  const handleSaveSubmit = async () => {
    const saveData = {
      email,
      name,
      latitude,
      longitude,
      startDate,
      endDate,
      cloudCoverage,
    };

    try {
      const response = await fetch("/save-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saveData),
      });

      if (response.ok) {
        setSuccess(true); // Show success state
        setTimeout(() => {
          setShowSaveModal(false); // Close modal after a delay
          setSuccess(false); // Reset success state for future uses
          setEmail(""); // Clear the email input
          setName(""); // Clear the name input
        }, 2000); // Display checkmark for 2 seconds
      } else {
        console.error("Failed to save data");
      }
    } catch (err) {
      console.error("Error saving data", err);
    }
  };

  const handleCloseSaveModal = () => {
    setShowSaveModal(false);
  };

  const handleViewClick = () => {
    setShowViewModal(true);
  };

  const handleViewSubmit = async () => {
    try {
      const response = await fetch("/get-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setSavedData(data); // Set fetched saved data
      } else {
        console.error("Failed to fetch saved data");
      }
    } catch (err) {
      console.error("Error fetching saved data", err);
    }
  };

  const handleSelectData = (item) => {
    const { latitude, longitude, startDate, endDate, cloudCoverage } = item; // Assuming item has these properties
    navigate(`/data-display?latitude=${latitude}&longitude=${longitude}&startDate=${startDate}&endDate=${endDate}&cloudCoverage=${cloudCoverage}`);
  };

  if (error) {
    return (
      <>
        <div className="mb-2">There wasn't any data for the request you submitted. Return back to search?</div>
        <Button variant="contained" color="primary" href="/search">
          Return to Search
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            handleDataReceived(sampleOutput);
            setError(null);
          }}
        >
          Use Sample Data (For Development)
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
      <div className="chart-container">
        <h3>Wavelength Reflectance Chart</h3>
        <WavelengthChart graphData={graphData} />
      </div>

      {/* Centered Save Button */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
        <Button variant="contained" color="primary" onClick={handleSaveClick}>
          Save
        </Button>
        <Button variant="contained" color="secondary" onClick={handleViewClick} style={{ marginLeft: "10px" }}>
          View Data
        </Button>
      </div>

      {/* Save Modal */}
      <Dialog open={showSaveModal} onClose={handleCloseSaveModal}>
        <DialogTitle>Enter details to save this query</DialogTitle>
        <DialogContent>
          {!success ? (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Name"
                type="text"
                fullWidth
                variant="standard"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                margin="dense"
                label="Email Address"
                type="email"
                fullWidth
                variant="standard"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </>
          ) : (
            <div style={{ textAlign: "center" }}>
              <CheckCircleIcon style={{ color: "green", fontSize: 60 }} />
              <Typography variant="h6" color="green" gutterBottom>
                Saved Successfully!
              </Typography>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          {!success && (
            <>
              <Button onClick={handleCloseSaveModal} color="secondary">
                Close
              </Button>
              <Button onClick={handleSaveSubmit} color="primary">
                Save
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* View Modal */}
      <Dialog open={showViewModal} onClose={() => setShowViewModal(false)}>
        <DialogTitle>Enter your email to view saved queries</DialogTitle>
        <DialogContent>
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
          <Button variant="contained" color="primary" onClick={handleViewSubmit} style={{ marginTop: "10px" }}>
            Fetch Saved Data
          </Button>
          <List>
            {savedData.map((item, index) => (
              <ListItem button key={index} onClick={() => handleSelectData(item)}>
                {item.name} {/* Assuming each saved data item has a name property */}
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowViewModal(false)} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DataDisplay;
