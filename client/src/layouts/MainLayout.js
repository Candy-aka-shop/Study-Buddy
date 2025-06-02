import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MainLayout = () => {
    const location = useLocation();
    const isChatroom = location.pathname.includes("chatroom") || location.pathname.includes("messages") ;
    const isHome = location.pathname === '/' || location.pathname === '/register' || location.pathname === '/login'

  
    return (
        <div className={`${isChatroom ? 'h-screen' : 'min-h-screen'} bg-pure-white text-pure-black`}>
          {!isChatroom ? (
              <>
                <div className="fixed top-0 left-0 right-0 z-50">
                  <Header />
                </div>
                <main className={!isHome && "px-2 sm:px-3 md:px-4"}> 
                  <Outlet />
                </main>
                <Footer />
              </>
            ) : (
                <Outlet />
              )}
            </div>
          );
        };
        
  export default MainLayout;