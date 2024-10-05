import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const DataDisplay = () => {
  const location = useLocation();
  const [pixelData, setPixelData] = useState(null);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(true); // For showing the email popup
  const [email, setEmail] = useState(""); // For storing email input

  useEffect(() => {
    const { latitude, longitude, startDate, endDate, cloudCoverage } = location.state;
  
    const fetchPixelData = async () => {
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
        if (response.ok) {
          setPixelData(data);
          console.log('Received data:', data); // Log the received data
        } else {
          setError(data.error || 'An error occurred while fetching data.');
        }
      } catch (err) {
        setError('Failed to fetch data from the server.');
      }
    };
  
    fetchPixelData();
  }, [location.state]);

  const handleSubmit = () => {
    console.log("Email submitted:", email);
    setShowPopup(false); // Close popup after email submission
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!pixelData) {
    return <div>Loading data...</div>;
  }

  return (
    <div>
      <h1>Landsat 9 Data for Selected Pixel</h1>
      <div>
        <h3>Selected Pixel Data:</h3>
        <pre>{JSON.stringify(pixelData.selectedPixel, null, 2)}</pre>
      </div>
      <div>
        <h3>Surrounding Pixels Data:</h3>
        <pre>{JSON.stringify(pixelData.surroundingPixels, null, 2)}</pre>
      </div>
      {/* Email Popup Modal */}
      {showPopup && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Enter your email</h5>
                <button type="button" className="close" aria-label="Close" onClick={handleClosePopup}>
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
                <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                  Submit
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleClosePopup}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataDisplay;
