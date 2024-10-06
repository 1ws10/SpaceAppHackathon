// src/App.js
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  Navigate,
} from "react-router-dom";
import Search from "./Search"; // Import the Search component
import DataDisplay from "./DataDisplay"; // Import the new DataDisplay component
import "./Header.css"; // Import the custom CSS file
import { ThemeProvider, createTheme } from "@mui/material/styles";

const App = () => {
  const [token, setToken] = useState(null);
  const [location, setLocation] = useState(null);

  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <Router>
        {/*<Navbar bg="light" expand="lg">
        <Navbar.Brand as={Link} to="/">MyApp</Navbar.Brand>
        <Nav className="ml-auto">
       
          <Nav.Link as={Link} to="/search">Map Search</Nav.Link> 
        </Nav>
      </Navbar>
      */}

        <Routes>
          <Route path="/search" element={<Search />} />{" "}
          {/* Route to the Search component */}
          <Route path="/" element={<Navigate to="/search" />} />
          <Route path="/data-display" element={<DataDisplay />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
