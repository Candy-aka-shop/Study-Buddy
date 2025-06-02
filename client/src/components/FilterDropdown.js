import React, { useState, useEffect, useRef } from 'react';
import { Filter } from 'lucide-react';

const FilterDropdown = ({ filters, onFilterChange, availableStudyStyles, availableAcademicYears, availableDays }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCheckboxChange = (filterType, value) => {
    onFilterChange(filterType, value);
    setIsOpen(true);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 text-pure-black"
        aria-label="Toggle filter dropdown"
      >
        <Filter className="w-4 h-4" />
        <span>Filters</span>
        {Object.values(filters).some((f) => f.length > 0) && (
          <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
            {Object.values(filters).reduce((acc, f) => acc + f.length, 0)}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-pure-black mb-2">Study Style</label>
              <div className="space-y-2">
                {availableStudyStyles.length > 0 ? (
                  availableStudyStyles.map((style) => (
                    <label key={style} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.studyStyle.includes(style)}
                        onChange={() => handleCheckboxChange('studyStyle', style)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-pure-black">{style}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No study styles available</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-pure-black mb-2">Academic Year</label>
              <div className="space-y-2">
                {availableAcademicYears.length > 0 ? (
                  availableAcademicYears.map((year) => (
                    <label key={year} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.academicYear.includes(year)}
                        onChange={() => handleCheckboxChange('academicYear', year)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-pure-black">{year}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No academic years available</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-pure-black mb-2">Availability</label>
              <div className="space-y-2">
                {availableDays.length > 0 ? (
                  availableDays.map((day) => (
                    <label key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.availability.includes(day)}
                        onChange={() => handleCheckboxChange('availability', day)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-pure-black">{day}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No availability options available</p>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                onFilterChange('studyStyle', []);
                onFilterChange('academicYear', []);
                onFilterChange('availability', []);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-sm text-pure-black border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;