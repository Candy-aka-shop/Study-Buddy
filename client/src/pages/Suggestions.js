import React, { useEffect } from 'react';
import { useMatchingStore, useAuthStore } from '../stores';

const SuggestionsPage = () => {
  const { isAuthenticated } = useAuthStore();
  const { matches, fetchMatches } = useMatchingStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchMatches();
    }
  }, [isAuthenticated, fetchMatches]);

  if (!isAuthenticated) {
    return <div className="text-center text-pure-black">Please log in to view suggestions.</div>;
  }

  if (matches.length === 0) {
    return <div className="text-center text-pure-black">No study buddy suggestions found.</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-pure-white py-6 sm:py-8 md:py-12">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto bg-pure-white rounded-lg shadow-md p-4 sm:p-6 md:p-8">
        <img src="/logo.png" alt="Study Buddy Logo" className="mx-auto mb-4 w-24 sm:w-32" />
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-pure-black text-center">Choose Your Study Buddy</h2>
        <ul className="space-y-4">
          {matches.map((suggestion) => (
            <li key={suggestion.userId} className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-pure-black">{suggestion.name}</h3>
              <p><strong>Courses:</strong> {suggestion.courses.join(', ')}</p>
              <p><strong>Compatibility Score:</strong> {(suggestion.compatibilityScore * 100).toFixed(0)}%</p>
              {suggestion.availability && suggestion.availability.length > 0 && (
                <div>
                  <p><strong>Availability:</strong></p>
                  <ul className="list-disc pl-5">
                    {suggestion.availability.map((slot, index) => (
                      <li key={index} className="text-pure-black">
                        {slot.day}: {slot.startTime} - {slot.endTime}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SuggestionsPage;