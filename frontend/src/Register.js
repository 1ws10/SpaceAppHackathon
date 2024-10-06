import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/register', { username, password });
      setMessage('User created successfully! You can now log in.');
      // Redirect to login page (optional)
    } catch (error) {
      setMessage('Error creating user');
      console.error(error.response.data);
    }
  };

  return (
    <div style={{ marginTop: '50px', maxWidth: '400px', margin: 'auto' }}>
      <h2>Register</h2>
      {message && <div style={{ color: 'blue' }}>{message}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter username"
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Password</label>
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
