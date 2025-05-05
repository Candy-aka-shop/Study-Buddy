import React from 'react';
import { Routes, Route, Link } from 'react-router-dom'; // Import Router components

import RegisterForm from './components/RegisterForm'; // Import RegisterForm
import LoginForm from './components/LoginForm'; // Import LoginForm
import HomePage from './components/HomePage';
import ProfilePage from './components/ProfilePage';
import SuggestionsPage from './components/SuggestionsPage'; // **Import ProfilePage Component**
import logo from './logo.svg';

import './App.css';

function App() {
  return (
    <div className="App"> {/* **Enclosing <div> tag - Now outermost container** */}
      <header className="App-header"> 
        <img alt="Study Buddy Logo" src={logo} className="App-logo" />
        <h1>Study Buddy App</h1>
        <nav>  
          <ul>
            <li><Link to="/">Home</Link></li>        
            <li><Link to="/register">Register</Link></li> 
            <li><Link to="/login">Login</Link></li>  
            <li><Link to="/profile">Profile</Link></li>
            <li><Link to="/suggestions">Suggestions</Link></li>
             
          </ul>
        </nav>
      </header>
      <Routes> {/* Routes are inside the div */}
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/suggestions" element={<SuggestionsPage />} />
      </Routes>
    </div>
  );
}

export default App;
