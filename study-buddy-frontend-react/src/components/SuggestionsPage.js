import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudyBuddySuggestions = async () => {
      setLoading(true);
      setError(null);
      try {
        // **Retrieve JWT token from localStorage (Actual Logic - No Placeholder)**
        const jwtToken = localStorage.getItem('authToken'); // Retrieve token from localStorage

        if (!jwtToken) { // **Handle case where token is not found (User not logged in)**
          setError("No JWT token found. Please log in to view suggestions.");
          setLoading(false);
          return; // Stop API call if no token
        }

        const response = await axios.get('http://localhost:3000/api/users/me/study-buddies', { // Call Get Study Buddy Suggestions API
          headers: {
            Authorization: `Bearer ${jwtToken}`, // Include JWT in Authorization header
          },
        });
        setSuggestions(response.data.suggestions); // Set suggestions data from API response
        console.log("Study Buddy Suggestions Fetched:", response.data.suggestions); // Log fetched suggestions
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to fetch study buddy suggestions'); // Set error message
        console.error("Error fetching study buddy suggestions:", error); // Log error
      } finally {
        setLoading(false);
      }
    };

    fetchStudyBuddySuggestions();
  }, []);

  if (loading) {
    return <p>Loading study buddy suggestions...</p>;
  }

  if (error) {
    return <p className="error-message">Error: {error}</p>;
  }

  if (!suggestions || suggestions.length === 0) {
    return <p>No study buddy suggestions found.</p>;
  }

  return (
    <div className="suggestions-page">
      <h2>Study Buddy Suggestions</h2>
      <ul className="suggestions-list">
        {suggestions.map((suggestion) => (
          <li key={suggestion.user_id} className="suggestion-item">
            <h3>{suggestion.name}</h3>
            <p>Email: {suggestion.email}</p>
            <p>Academic Year: {suggestion.academic_year}</p>
            <p>Shared Courses: {suggestion.shared_course_ids.join(', ')}</p>
            <p>Overlap Score: {suggestion.overlapScore}</p>
            {suggestion.overlappingAvailability && suggestion.overlappingAvailability.length > 0 && (
              <div className="overlapping-availability">
                <p>Overlapping Availability:</p>
                <ul>
                  {suggestion.overlappingAvailability.map((slot, index) => (
                    <li key={index}>
                      {slot.dayOfWeek}s: {slot.startTime1} - {slot.endTime1} and {slot.startTime2} - {slot.endTime2} (Overlap: {slot.overlapDurationMinutes} minutes)
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* You can add more details or actions for each suggestion here (e.g., "Send Message" button) */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SuggestionsPage;