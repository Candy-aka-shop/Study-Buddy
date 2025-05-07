import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AvailabilityPage() {
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');


  const fetchUserAvailability = async () => {
    setLoading(true);
    setError(null);
    try {
      // **Retrieve JWT token from localStorage**
      const jwtToken = localStorage.getItem('authToken');

      if (!jwtToken) {
        setError("No JWT token found. Please log in.");
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:3000/api/users/me/availability', { // Call Get User Availability API
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      setAvailabilitySlots(response.data.availability || []); // Set availability slots from API response (or empty array if null)
      console.log("Availability Slots Fetched:", response.data.availability); // Log fetched availability slots
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch availability');
      console.error("Error fetching availability:", error); // Log error
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchUserAvailability(); // **Call fetchUserAvailability from useEffect - Correct call**
  }, []);

  const handleAddAvailabilitySlot = async (event) => {
    event.preventDefault(); // Prevent default form submission
    setSaveMessage('');    // Clear previous messages
    setSaveError('');       // Clear previous errors

    // 1. Basic Input Validation (Client-side - you can add more robust validation)
    if (!newDayOfWeek || !newStartTime || !newEndTime) {
      setSaveError("Please select Day of Week, Start Time, and End Time.");
      return;
    }
    // TODO: Add client-side time format validation if needed

    try {
      // **Call Set/Update Availability API endpoint (POST /api/users/me/availability)**
      const jwtToken = localStorage.getItem('authToken');
      const response = await axios.post(
        'http://localhost:3000/api/users/me/availability',
        [ // Request body is an array of slots - for now, just sending a single new slot in an array
          { dayOfWeek: newDayOfWeek, startTime: newStartTime, endTime: newEndTime }
        ],
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setSaveMessage(response.data.message); // Set success message
      console.log("Availability Slot Saved Successfully:", response); // Log success response

      // 2. After successful save, re-fetch availability to update the displayed list
      fetchUserAvailability(); // **Call fetchUserAvailability HERE - Correct call now! fetchUserAvailability is defined in component scope**

      // Clear form inputs after successful save (optional)
      setNewStartTime('');
      setNewEndTime('');

    } catch (error) {
      setSaveError(error.response?.data?.error || 'Error saving availability slot'); // Set error message
      console.error("Error saving availability slot:", error); // Log error
    }
  };

  // **New function to handle deleting availability slot - ADDED:**
  const handleDeleteAvailabilitySlot = async (availabilityIdToDelete) => {
    setSaveMessage(''); // Clear messages
    setSaveError('');

    try {
      // **Call Delete Availability Slot API endpoint (DELETE /api/users/me/availability/:availabilityId)**
      const jwtToken = localStorage.getItem('authToken');
      const response = await axios.delete(
        `http://localhost:3000/api/users/me/availability/${availabilityIdToDelete}`, // Use template literal to construct URL with availabilityId
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      setSaveMessage(response.data.message); // Set success message
      console.log("Availability Slot Deleted Successfully:", response); // Log success response

      // Re-fetch availability to update the displayed list after deletion
      fetchUserAvailability();

    } catch (error) {
      setSaveError(error.response?.data?.error || 'Error deleting availability slot'); // Set error message
      console.error("Error deleting availability slot:", error); // Log error
    }
  };


  const [newDayOfWeek, setNewDayOfWeek] = useState('Monday'); // Default day to Monday
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  //const [saveMessage, setSaveMessage] = useState('');
  //const [saveError, setSaveError] = useState('');


  return (
    <div className="availability-page">
      <h2>Your Study Availability</h2>
      {availabilitySlots && availabilitySlots.length > 0 ? (
        <ul className="availability-list">
          {availabilitySlots.map((slot) => (
            <li key={slot.availability_id} className="availability-item">
              <p><strong>{slot.day_of_week}:</strong> {slot.start_time} - {slot.end_time}</p>
              {/* **Add Delete Button for each slot - NEW BUTTON ADDED HERE:** */}
              <button onClick={() => handleDeleteAvailabilitySlot(slot.availability_id)} style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Delete</button>
              {/* You can add Edit button here in the next step */}
            </li>
          ))}
        </ul>
      ) : (
        <p>No availability slots set yet.</p>
      )}


      <div className="add-availability-form">
        <h3>Add New Availability Slot</h3>
        <form onSubmit={handleAddAvailabilitySlot}>
          <div>
            <label htmlFor="dayOfWeek">Day of Week:</label>
            <select id="dayOfWeek" value={newDayOfWeek} onChange={(e) => setNewDayOfWeek(e.target.value)} required>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>
          <div>
            <label htmlFor="startTime">Start Time (HH:mm):</label>
            <input type="time" id="startTime" value={newStartTime} onChange={(e) => setNewStartTime(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="endTime">End Time (HH:mm):</label>
            <input type="time" id="endTime" value={newEndTime} onChange={(e) => setNewEndTime(e.target.value)} required />
          </div>
          <button type="submit">Add Availability Slot</button>

          {saveMessage && <p className="success-message">{saveMessage}</p>}
          {saveError && <p className="error-message">{saveError}</p>}
        </form>
      </div>
    </div>
  );
}

export default AvailabilityPage;