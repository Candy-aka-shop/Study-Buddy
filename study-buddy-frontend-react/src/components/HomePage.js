import React from 'react';

function HomePage() {
  return (
    <div className="home-page">
      <h2>Welcome to Study Buddy App!</h2>
      <p>Find study partners and collaborate effectively.</p>
      {/* You can add more content here for your homepage */}
      <p>
        Get started by <a href="/register">Registering</a> or <a href="/login">Logging in</a>.
      </p>
    </div>
  );
}

export default HomePage;