import React from 'react';
import { X } from 'lucide-react';

const ActiveFilters = ({ filters, onRemoveFilter }) => {
  const activeFilters = [];

  filters.studyStyle.forEach((style) => activeFilters.push({ type: 'studyStyle', value: style, label: style }));
  filters.academicYear.forEach((year) => activeFilters.push({ type: 'academicYear', value: year, label: year }));
  filters.availability.forEach((day) => activeFilters.push({ type: 'availability', value: day, label: day }));

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {activeFilters.map((filter, index) => (
        <span
          key={`${filter.type}-${filter.value}-${index}`}
          className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
        >
          {filter.label}
          <button
            type="button"
            onClick={() => onRemoveFilter(filter.value, filter.type)}
            className="ml-1 hover:bg-blue-700 rounded-full p-0.5"
            aria-label={`Remove ${filter.label} filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
    </div>
  );
};

export default ActiveFilters;