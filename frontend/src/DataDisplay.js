import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import WavelengthChart from "./chart";

import sampleOutput from "./testing/sampleOutput";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import wavelengths from "./constants";


const DataDisplay = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(true); // For showing the email popup
  const [pixelIndex, setPixelIndex] = useState(0);
  const [pixelData, setPixelData] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [error, setError] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false); // For showing the save email popup
  const [showViewModal, setShowViewModal] = useState(false); // For showing the view data popup
  const [email, setEmail] = useState(""); // For storing email input

  const [userPrompt, setUserPrompt] = useState(""); // For storing the GPT prompt
  const [messages, setMessages] = useState([]); // For storing chat messages
  const [loadingGPT, setLoadingGPT] = useState(false); // To show loading while waiting for GPT response

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

          // Generate the initial GPT prompt
          let initialPrompt =
            "Analyze the following Landsat 9 data for the selected pixel:\n";
          Object.entries(data.selectedPixel).forEach(([key, value]) => {
            initialPrompt += `${key}: ${value}\n`;
          });

          // Send the initial prompt to GPT
          fetchGPTResponse(initialPrompt);

          handleDataReceived(data);

        } else {
          setError(data.error || "An error occurred while fetching data.");
        }
      } catch (err) {
        setError("Failed to fetch data from the server.");
        console.error(err);
      }

    };

    const fetchGPTResponse = async (prompt) => {
      setLoadingGPT(true); // Set loading state
      try {
        const response = await fetch("/gpt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        });

        const data = await response.json();
        if (response.ok) {
          // Add assistant's response to messages
          setMessages((prevMessages) => [
            ...prevMessages,
            { role: "assistant", content: data.reply },
          ]);
        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              role: "assistant",
              content:
                data.error ||
                "An error occurred while fetching the assistant's response.",
            },
          ]);
        }
      } catch (error) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            role: "assistant",
            content: "Failed to get a response from the assistant.",
          },
        ]);
      } finally {
        setLoadingGPT(false); // Remove loading state
      }

    };

    fetchPixelData();
  }, [location.search]);

  useEffect(() => {
    if (!pixelData) return;
    const graphData = Object.keys(pixelData.pixelValues[pixelIndex]) // Get keys from the selected pixel data
      .filter((key) => wavelengths[key]) // Filter out keys without corresponding wavelengths
      .map((key) => {
        return {
          band: key,
          wavelength: wavelengths[key],
          reflectance: pixelData.pixelValues[pixelIndex][key] / 100000, // Normalize reflectance values
        };
      });
    setGraphData(graphData);
  }, [pixelIndex]);

  const handleDataReceived = (data) => {
    setPixelData(data);
    console.log("Received data:", data); // Log the received data
    const graphData = Object.keys(data.pixelValues[pixelIndex]) // Get keys from the selected pixel data
      .filter((key) => wavelengths[key]) // Filter out keys without corresponding wavelengths
      .map((key) => {
        return {
          band: key,
          wavelength: wavelengths[key],
          reflectance: data.pixelValues[pixelIndex][key] / 100000, // Normalize reflectance values
        };
      });
    setGraphData(graphData);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };


  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!userPrompt.trim()) return; // Prevent empty submissions
    setLoadingGPT(true); // Set loading state

    // Add user's message to messages
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: userPrompt },
    ]);

    // Create prompt using selectedPixel data
    let prompt =
      "Analyze the following Landsat 9 data for the selected pixel:\n";
    if (pixelData && pixelData.selectedPixel) {
      Object.entries(pixelData.selectedPixel).forEach(([key, value]) => {
        prompt += `${key}: ${value}\n`;
      });
    }

    prompt += `\nUser query: ${userPrompt}`;

    try {
      const response = await fetch("/gpt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
        }),

  const handleSaveClick = () => {
    setShowSaveModal(true);
  };

  const handleSaveSubmit = async () => {
    // Create a new FormData object
    const formData = new FormData();
    formData.append("email", email);
    formData.append("name", name);
    formData.append("lat", latitude);
    formData.append("long", longitude);
    formData.append("start", startDate);
    formData.append("end", endDate);
    formData.append("cloud", cloudCoverage);

    try {
      const response = await fetch("/save-data", {
        method: "POST",
        body: formData, // Send the FormData directly
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
    const formData = new FormData();
    formData.append("email", email);
    try {
      const response = await fetch("/get-data", {
        method: "POST",
        body: formData, // Send the FormData directly

      });

      const data = await response.json();
      if (response.ok) {

        // Add assistant's response to messages
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "assistant", content: data.reply },
        ]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            role: "assistant",
            content: "An error occurred while fetching GPT response.",
          },
        ]);
      }
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: "Failed to get a response from GPT.",
        },
      ]);
    } finally {
      setLoadingGPT(false); // Remove loading state
      setUserPrompt(""); // Clear the user's input
    }
  };


        setSavedData(data); // Set fetched saved data
      } else {
        console.error("Failed to fetch saved data");
      }
    } catch (err) {
      console.error("Error fetching saved data", err);
    }
  };

  const handleSelectData = (item) => {
    const { lat, long, start, end, cloud } = item; // Assuming item has these properties
    navigate(`/data-display?latitude=${lat}&longitude=${long}&startDate=${start}&endDate=${end}&cloudCoverage=${cloud}`);
  };


  if (error) {
    return (
      <>
        <div className="mb-2">
          There wasn't any data for the request you submitted. Return back to
          search?
        </div>
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
    <div className="w-full">
      <h1>Landsat 9 Data for Selected Pixel</h1>



      {/* gif */}
      <img src={pixelData.pixelValues[pixelIndex].thumbnail} alt="Landsat 9 Image" />

      <div className="chart-container">
        <h3>Wavelength Reflectance Chart for {pixelData.pixelValues[pixelIndex].date}</h3>
        <WavelengthChart graphData={graphData} />
      </div>


      {/* Email Popup Modal */}
      {showPopup && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Enter your email</h5>
                <button
                  type="button"
                  className="close"
                  aria-label="Close"
                  onClick={handleClosePopup}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmit}
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClosePopup}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GPT Chat Section */}
<div style={{ marginTop: "20px", display: "flex" }}>
  <div style={{ flex: "1" }}>
    {/* Chat Box */}
    <h3>Assistant Chat</h3>
    <div
      style={{
        border: "1px solid #ccc",
        padding: "10px",
        width: "100%",
        minHeight: "300px",
        maxHeight: "500px",
        overflowY: "auto",
        borderRadius: "5px",
        backgroundColor: "#f9f9f9",
      }}
    >
      {messages.map((msg, index) => (
        <div
          key={index}
          style={{
            textAlign: msg.role === "user" ? "right" : "left",
            margin: "10px 0",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "10px",
              borderRadius: "10px",
              backgroundColor:
                msg.role === "user" ? "#dcf8c6" : "#ffffff",
              maxWidth: "80%",
              color: "black", // Added this line to set text color
            }}
          >
            <strong>
              {msg.role === "user" ? "You" : "Assistant"}:
            </strong>{" "}
            {msg.content}
          </div>
        </div>
      ))}
    </div>
          <form onSubmit={handleChatSubmit} style={{ marginTop: "10px" }}>
            <textarea
              className="form-control"
              rows="3"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Enter your query for the assistant"
              style={{ width: "100%" }} // Make textarea full width
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loadingGPT}
              style={{ marginTop: "5px" }}
            >
              {loadingGPT ? "Analyzing..." : "Send"}
            </button>
          </form>
        </div>
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
          {success && (
            <div style={{ textAlign: "center" }}>
              <CheckCircleIcon style={{ color: "green", fontSize: 60 }} />
              <Typography variant="h6" color="green" gutterBottom>
                Saved Successfully!
              </Typography>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSaveModal} color="secondary">
            Close
          </Button>
          <Button onClick={handleSaveSubmit} color="primary">
            Save
          </Button>
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

      <section className="w-full flex justify-between my-4">
        <Button
          variant="contained"
          color="primary"
          disabled={pixelIndex === 0}
          onClick={() => {
            if (pixelIndex === 0) return;
            setPixelIndex((prev) => prev - 1);
          }}
        >
          Previous Date
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pixelData));
            const downloadAnchorNode = document.createElement("a");
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "landsat_data.json");
            document.body.appendChild(downloadAnchorNode); // required for firefox
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
          }}
        >
          Download JSON
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={pixelIndex === pixelData.pixelValues.length - 1}
          onClick={() => {
            if (pixelIndex === pixelData.pixelValues.length - 1) return;
            setPixelIndex((prev) => prev + 1);
          }}
        >
          Next Date
        </Button>
      </section>

      {/* MUI Email Popup Modal */}
      <Dialog open={showPopup} onClose={handleClosePopup}>
        <DialogTitle>Enter email for notifications on the next LandSat overpass</DialogTitle>

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
          <Button onClick={handleClosePopup} color="secondary">
            Close
          </Button>
          {!success && (
            <Button onClick={handleSaveSubmit} color="primary">
              Save
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DataDisplay;
