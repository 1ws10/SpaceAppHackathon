import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';
//import Login from './Login';
//import Register from './Register';
import Home from './Home';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  const [token, setToken] = useState(null);

  return (
    <Router>
      <Navbar bg="light" expand="lg">
        <Navbar.Brand as={Link} to="/">MyApp</Navbar.Brand>
        <Nav className="ml-auto">
          {/*<Nav.Link as={Link} to="/login">Login</Nav.Link>
          <Nav.Link as={Link} to="/register">Register</Nav.Link>*/}
          <Nav.Link as={Link} to="/home">Home</Nav.Link>
        </Nav>
      </Navbar>

      <Routes>
        {/*<Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/register" element={<Register />} />*/}
        {/*<Route path="/home" element={token ? <Home /> : <Navigate to="/login" />} /> */}
        <Route path="/home" element={<Home />}></Route>
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
