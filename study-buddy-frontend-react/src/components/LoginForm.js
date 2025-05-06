import React, { useState } from 'react';
import axios from 'axios';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault(); // Prevent default form submission
    setLoginMessage('');   // Clear previous messages
    setLoginError('');      // Clear previous errors
  
    try {
      const response = await axios.post('http://localhost:3000/api/users/login', { // Call User Login API
        email: email,
        password: password,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      setLoginMessage(response.data.message); // Set success message (e.g., "Login successful")
      // **Save JWT token to localStorage after successful login - ADD THESE LINES:**
      const token = response.data.token; // Extract JWT token from response
      localStorage.setItem('authToken', token); // **Save JWT token to localStorage with key 'authToken'**
      const user = response.data.user;
      console.log("Login Success - JWT Token:", token); // Log JWT token to console
      console.log("Logged-in User:", user); // Log user info to console 
  
      // You might also want to redirect the user to the Profile page or another protected page after successful login here (using React Router's `navigate` hook, for example)
  
    } catch (error) {
      setLoginError(error.response?.data?.error || 'Login failed'); 
      console.error("Login Error:", error); 
    }
  };

  return (
    <div className="login-form">
      <h2>User Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="loginEmail">Email:</label>
          <input type="email" id="loginEmail" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="loginPassword">Password:</label>
          <input type="password" id="loginPassword" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Login</button>

        {loginMessage && <p className="success-message">{loginMessage}</p>}
        {loginError && <p className="error-message">{loginError}</p>}
      </form>
    </div>
  );
}

export default LoginForm;