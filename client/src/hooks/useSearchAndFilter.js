import { useState, useMemo } from 'react';

const useSearchAndFilter = (data) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    studyStyle: [],
    academicYear: [],
    availability: [],
  });

  const availableStudyStyles = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return [];
    }
    const styles = new Set(data.map((item) => item.studyStyle || item.study_style).filter(Boolean));
    const result = Array.from(styles).sort();
    return result;
  }, [data]);

  const availableAcademicYears = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return [];
    }
    const years = new Set(data.map((item) => item.academicYear || item.academic_year).filter(Boolean));
    const result = Array.from(years).sort();
    return result;
  }, [data]);

  const availableDays = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return [];
    }
    const days = new Set();
    data.forEach((item) => {
      if (Array.isArray(item.availableDays)) {
        item.availableDays.forEach((slot) => {
          if (slot.day) days.add(slot.day);
        });
      }
    });
    const result = Array.from(days).sort();
    return result;
  }, [data]);

  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return [];
    }

    const result = data.filter((item) => {
      if (!item) {
        return false;
      }

      const searchLower = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !searchTerm ||
        (item.firstName && item.firstName.toLowerCase().includes(searchLower)) ||
        (item.lastName && item.lastName.toLowerCase().includes(searchLower)) ||
        (item.courses &&
          Array.isArray(item.courses) &&
          item.courses.some((course) => course.toLowerCase().includes(searchLower)));

      const matchesStudyStyle =
        filters.studyStyle.length === 0 ||
        (item.studyStyle && filters.studyStyle.includes(item.studyStyle)) ||
        (item.study_style && filters.studyStyle.includes(item.study_style));

      const matchesAcademicYear =
        filters.academicYear.length === 0 ||
        (item.academicYear && filters.academicYear.includes(item.academicYear)) ||
        (item.academic_year && filters.academicYear.includes(item.academic_year));

      const matchesAvailability =
        filters.availability.length === 0 ||
        (Array.isArray(item.availableDays) &&
          filters.availability.some((filterDay) =>
            item.availableDays.some((slot) => slot.day.toLowerCase() === filterDay.toLowerCase())
          ));

      return matchesSearch && matchesStudyStyle && matchesAcademicYear && matchesAvailability;
    });

    return result;
  }, [data, searchTerm, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => {
      const currentValues = prev[filterType] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];
      return { ...prev, [filterType]: newValues };
    });
  };

  const removeFilter = (filterType, value) => {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        [filterType]: (prev[filterType] || []).filter((item) => item !== value),
      };
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({ studyStyle: [], academicYear: [], availability: [] });
    setSearchTerm('');
  };

  return {
    searchTerm,
    setSearchTerm,
    filters,
    handleFilterChange,
    removeFilter,
    clearFilters,
    filteredData,
    availableStudyStyles,
    availableAcademicYears,
    availableDays,
  };
};

export default useSearchAndFilter;