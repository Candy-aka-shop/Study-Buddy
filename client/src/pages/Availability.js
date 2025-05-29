import React, { useState, useEffect } from 'react';
import { useAvailabilityStore, useAuthStore } from '../stores';

const AvailabilityPage = () => {
  const { isAuthenticated } = useAuthStore();
  const { availability, fetchAvailability, updateAvailability } = useAvailabilityStore();
  const [days, setDays] = useState({
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false,
    Sunday: false,
  });
  const [startTime, setStartTime] = useState('12:00');

  useEffect(() => {
    if (isAuthenticated) {
      fetchAvailability();
    }
  }, [isAuthenticated, fetchAvailability]);

  const handleDayToggle = (day) => {
    setDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedDays = Object.keys(days).filter((day) => days[day]);
    const newAvailability = selectedDays.map((day) => ({
      dayOfWeek: day,
      startTime,
      endTime: startTime,
    }));
    try {
      await updateAvailability(newAvailability);
      alert('Availability updated!');
    } catch (error) {
      console.error('Update availability error:', error);
      alert('Failed to update availability');
    }
  };

  const handleSkip = () => {
    window.location.href = '/suggestions';
  };

  if (!isAuthenticated) {
    return <div className="text-center text-pure-black">Please log in to manage availability.</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-pure-white py-6 sm:py-8 md:py-12">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto bg-pure-white rounded-lg shadow-md p-4 sm:p-6 md:p-8">
        <img src="/logo.png" alt="Study Buddy Logo" className="mx-auto mb-4 w-24 sm:w-32" />
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-pure-black text-center">Set Your Availability</h2>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-5">
          <div>
            <label className="block text-xs sm:text-sm md:text-base font-medium text-pure-black">Availability</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(days).map((day) => (
                <label key={day} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={days[day]}
                    onChange={() => handleDayToggle(day)}
                    className="mr-2"
                  />
                  <span className="text-xs sm:text-sm text-pure-black">{day}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="startTime" className="block text-xs sm:text-sm md:text-base font-medium text-pure-black">Time</label>
            <input
              type="time"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded text-pure-black text-sm sm:text-base"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-light-blue text-pure-black p-2 sm:p-3 rounded hover:bg-blue-200 text-sm sm:text-base md:text-lg font-semibold transition"
          >
            Next Step
          </button>
          <button
            type="button"
            onClick={handleSkip}
            className="w-full bg-gray-300 text-pure-black p-2 sm:p-3 rounded hover:bg-gray-400 text-sm sm:text-base md:text-lg font-semibold transition mt-2"
          >
            Skip for Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default AvailabilityPage;