import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import useAuthStore from '../stores/auth';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-light-blue text-pure-black p-4 shadow-md fixed w-full top-0 left-0 z-10 text-pure-white">
      <div className="container mx-auto flex justify-between items-center md:w-5/6 mx-auto">
        <div className="flex items-center justify-start gap-2">
          <div className="logo text-3xl font-bold bg-pure-black p-2 rounded-lg flex justify-start items-center">
            <p className="text-3xl">S</p>
            <p>B</p>
          </div>
          <p className="logo text-2xl text-pure-black font-bold">STUDY BUDDY</p>
        </div>
        <nav className="hidden md:flex space-x-4 text-2xl text-pure-black">
          <Link to="/" className="hover:underline">Home</Link>
          {!isAuthenticated ? (
            <>
              <Link to="/register" className="hover:underline">Register</Link>
              <Link to="/login" className="hover:underline">Login</Link>
            </>
          ) : (
            <>
              <Link to="/profile" className="hover:underline">Profile</Link>
              <Link to="/suggestions" className="hover:underline">Suggestions</Link>
              <Link to="/courses" className="hover:underline">Courses</Link>
              <Link to="/availability" className="hover:underline">Availability</Link>
              <Link to="/preferences" className="hover:underline">Preferences</Link>
              <Link to="/sessions" className="hover:underline">Sessions</Link>
              <Link to="/resources" className="hover:underline">Resources</Link>
              <button onClick={handleLogout} className="hover:underline">Logout</button>
            </>
          )}
        </nav>
        <button className="md:hidden text-pure-black  focus:outline-none" onClick={toggleMenu}>
          {isMenuOpen ? <X size={40} /> : <Menu size={40} />}
        </button>
      </div>
      {isMenuOpen && (
        <nav className="md:hidden bg-light-blue text-pure-black p-4 w-5/6 mx-auto">
          <ul className="flex flex-col space-y-2 text-xl">
            <li>
              <Link to="/" className="block hover:underline" onClick={toggleMenu}>
                Home
              </Link>
            </li>
            {!isAuthenticated ? (
              <>
                <li>
                  <Link to="/register" className="block hover:underline" onClick={toggleMenu}>
                    Register
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="block hover:underline" onClick={toggleMenu}>
                    Login
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/profile" className="block hover:underline" onClick={toggleMenu}>
                    Profile
                  </Link>
                </li>
                <li>
                  <Link to="/suggestions" className="block hover:underline" onClick={toggleMenu}>
                    Suggestions
                  </Link>
                </li>
                <li>
                  <Link to="/courses" className="block hover:underline" onClick={toggleMenu}>
                    Courses
                  </Link>
                </li>
                <li>
                  <Link to="/availability" className="block hover:underline" onClick={toggleMenu}>
                    Availability
                  </Link>
                </li>
                <li>
                  <Link to="/preferences" className="block hover:underline" onClick={toggleMenu}>
                    Preferences
                  </Link>
                </li>
                <li>
                  <Link to="/sessions" className="block hover:underline" onClick={toggleMenu}>
                    Sessions
                  </Link>
                </li>
                <li>
                  <Link to="/resources" className="block hover:underline" onClick={toggleMenu}>
                    Resources
                  </Link>
                </li>
                <li>
                  <button className="block hover:underline" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;