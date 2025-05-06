import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProfilePage() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
        setLoading(true);
        setError(null);
        try {
          // **Retrieve JWT token from localStorage (Now actually implemented!)**
          const jwtToken = localStorage.getItem('authToken'); // **Retrieve token from localStorage with key 'authToken'**
      
          if (!jwtToken) { // **Handle case where token is not found in local storage (User not logged in)**
            setError("No JWT token found. Please log in.");
            setLoading(false);
            return; // Stop API call if no token
          }
      
          const response = await axios.get('http://localhost:3000/api/users/me', { 
            headers: {
              Authorization: `Bearer ${jwtToken}`, // Include JWT in Authorization header
            },
          });
          setUserProfile(response.data.user); 
          console.log("Profile Data Fetched:", response.data.user); 
        } catch (error) {
          setError(error.response?.data?.error || 'Failed to fetch profile'); 
          console.error("Error fetching profile:", error); 
        } finally {
          setLoading(false); 
        }
      };

    fetchUserProfile(); // Call fetchUserProfile function when component mounts (useEffect)
  }, []); // Empty dependency array means useEffect runs only once on component mount


  if (loading) {
    return <p>Loading profile...</p>; // Display loading message while fetching data
  }

  if (error) {
    return <p className="error-message">Error: {error}</p>; // Display error message if API call fails
  }

  if (!userProfile) {
    return <p>Could not load profile.</p>; // Display message if userProfile data is null/undefined (e.g., API returned empty data)
  }


  return (
    <div className="profile-page">
      <h2>Your Profile</h2>
      <div className="profile-details">
        <p><strong>Name:</strong> {userProfile.name}</p>
        <p><strong>Email:</strong> {userProfile.email}</p>
        <p><strong>Academic Year:</strong> {userProfile.academic_year}</p>
        {userProfile.profile_picture && (
          <div className="profile-picture">
            <img src={userProfile.profile_picture} alt="Profile Picture" style={{ maxWidth: '150px', borderRadius: '50%' }} />
          </div>
        )}
        {/* You can add more profile details here as needed */}
      </div>
    </div>
  );
}

export default ProfilePage;