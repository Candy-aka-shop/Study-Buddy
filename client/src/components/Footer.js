import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-light-blue text-pure-black p-4 mt-auto">
      <div className="container mx-auto text-center">
        <p>© {new Date().getFullYear()} Study Buddy App. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;