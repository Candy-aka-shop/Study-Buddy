import React from 'react';
import RegisterForm from './components/RegisterForm'; // Import RegisterForm component
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Study Buddy App - User Registration</h1>
        <RegisterForm /> {/* Display RegisterForm component */}
      </header>
    </div>
  );
}

export default App;