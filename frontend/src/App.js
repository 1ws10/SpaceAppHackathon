// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { Container, Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Search from './Search'; // Import the Search component
import DataDisplay from './DataDisplay'; // Import the new DataDisplay component


const App = () => {
  const [token, setToken] = useState(null);
  const [location, setLocation] = useState(null);

  return (
    <Router>
      <Navbar bg="light" expand="lg">
        <Navbar.Brand as={Link} to="/">MyApp</Navbar.Brand>
        <Nav className="ml-auto">
       
          <Nav.Link as={Link} to="/search">Map Search</Nav.Link> {/* Add a link to Search */}
        </Nav>
      </Navbar>
      <Container className="mt-5">
        <Routes>
          <Route path="/search" element={<Search />} /> {/* Route to the Search component */}
          <Route path="/" element={<Navigate to="/search" />} />
          <Route path="/data-display" element={<DataDisplay />} />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;
