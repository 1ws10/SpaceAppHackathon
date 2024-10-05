import React from 'react';
import { Container } from 'react-bootstrap';

const Home = () => {
  return (
    <Container className="mt-5">
      <h1>Welcome to the Home Page!</h1>
      <p>This page is accessible only to logged-in users.</p>
    </Container>
  );
};

export default Home;
