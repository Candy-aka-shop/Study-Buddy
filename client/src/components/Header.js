import React, { useState, useEffect, useMemo } from 'react'; // Add useMemo to imports
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Globe, Mail, User, Home, UserPlus, LogIn, LogOut } from 'lucide-react';
import useAuthStore from '../stores/auth';
import useProfileStore from '../stores/profile';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const publicRoutes = useMemo(() => 
    process.env.REACT_APP_PUBLIC_ROUTES
      ? process.env.REACT_APP_PUBLIC_ROUTES.split(',')
      : [],
    []
  );

  useEffect(() => {
    if (publicRoutes.includes(location.pathname)) {
      return;
    }
    if (isAuthenticated && user) {
      fetchProfile()
        .catch((error) => {
          console.error('Header: fetchProfile failed:', error);
        });
    }
  }, [isAuthenticated, user, fetchProfile, location.pathname, publicRoutes]); // Add publicRoutes

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-light-blue text-pure-black shadow-md p-3 z-20">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="logo text-3xl font-bold bg-pure-black p-2 rounded-lg flex items-center">
            <p className="text-3xl text-white">S</p>
            <p className="text-white">B</p>
          </div>
          <p className="text-2xl text-pure-black font-bold">STUDY BUDDY</p>
        </div>
        <nav className="hidden md:flex items-center space-x-6 text-lg text-pure-black">
          {!isAuthenticated ? (
            <>
              <Link to="/" className="flex items-center gap-2 hover:underline">
                <Home size={24} />
                <span>Home</span>
              </Link>
              <Link to="/register" className="flex items-center gap-2 hover:underline">
                <UserPlus size={24} />
                <span>Register</span>
              </Link>
              <Link to="/login" className="flex items-center gap-2 hover:underline">
                <LogIn size={24} />
                <span>Login</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/suggestions" className="flex items-center gap-2 hover:underline">
                <Globe size={24} />
                <span>Suggestions</span>
              </Link>
              <Link to="/chatroom" className="flex items-center gap-2 hover:underline">
                <Mail size={24} />
                <span>Messages</span>
              </Link>
              <Link to="/profile" className="flex items-center gap-2 hover:underline">
                {profile?.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-gray-500" />
                )}
                <span>Profile</span>
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 hover:underline">
                <LogOut size={24} />
                <span>Logout</span>
              </button>
            </>
          )}
        </nav>
        <button className="md:hidden text-pure-black focus:outline-none" onClick={toggleMenu}>
          {isMenuOpen ? <X size={40} /> : <Menu size={40} />}
        </button>
      </div>
      {isMenuOpen && (
        <nav className="md:hidden bg-light-blue text-pure-black p-4">
          <div className="flex flex-col space-y-4 text-lg text-pure-black">
            {!isAuthenticated ? (
              <>
                <Link to="/" className="flex items-center gap-2 hover:underline" onClick={toggleMenu}>
                  <Home size={24} />
                  <span>Home</span>
                </Link>
                <Link to="/register" className="flex items-center gap-2 hover:underline" onClick={toggleMenu}>
                  <UserPlus size={24} />
                  <span>Register</span>
                </Link>
                <Link to="/login" className="flex items-center gap-2 hover:underline" onClick={toggleMenu}>
                  <LogIn size={24} />
                  <span>Login</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/suggestions" className="flex items-center gap-2 hover:underline" onClick={toggleMenu}>
                  <Globe size={24} />
                  <span>Suggestions</span>
                </Link>
                <Link to="/chatroom" className="flex items-center gap-2 hover:underline" onClick={toggleMenu}>
                  <Mail size={24} />
                  <span>Messages</span>
                </Link>
                <Link to="/profile" className="flex items-center gap-2 hover:underline" onClick={toggleMenu}>
                  {profile?.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-500" />
                  )}
                  <span>Profile</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 hover:underline text-left">
                  <LogOut size={24} />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;