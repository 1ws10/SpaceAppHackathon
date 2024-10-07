import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import WavelengthChart from "./chart";
import { Button } from "@mui/material";

const DataDisplay = () => {
  const location = useLocation();
  const [pixelData, setPixelData] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(true); // For showing the email popup
  const [email, setEmail] = useState(""); // For storing email input
  const [userPrompt, setUserPrompt] = useState(""); // For storing the GPT prompt
  const [messages, setMessages] = useState([]); // For storing chat messages
  const [loadingGPT, setLoadingGPT] = useState(false); // To show loading while waiting for GPT response

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

          // Generate the initial GPT prompt
          let initialPrompt =
            "Analyze the following Landsat 9 data for the selected pixel:\n";
          Object.entries(data.selectedPixel).forEach(([key, value]) => {
            initialPrompt += `${key}: ${value}\n`;
          });

          // Send the initial prompt to GPT
          fetchGPTResponse(initialPrompt);
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
  }, []);

  const handleSubmit = () => {
    console.log("Email submitted:", email);
    setShowPopup(false); // Close popup after email submission
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
    </div>
  );
};

export default DataDisplay;
