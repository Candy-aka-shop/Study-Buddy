import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores';
import { authApi } from '../utils/api';

const CourseListPage = () => {
  const { isAuthenticated } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await authApi.get('/courses');
        setCourses(response.data.courses || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleEnroll = async (courseId) => {
    if (!isAuthenticated) {
      alert('Please log in to enroll in courses.');
      return;
    }
    try {
      await authApi.post('/courses/enroll', { courseId });
      alert('Successfully enrolled!');
    } catch (error) {
      console.error('Enrollment Error:', error);
      alert('Enrollment failed');
    }
  };

  if (loading) {
    return <div className="text-center text-pure-black">Loading courses...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  if (courses.length === 0) {
    return <div className="text-center text-pure-black">No courses available.</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-pure-white py-6 sm:py-8 md:py-12">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto bg-pure-white rounded-lg shadow-md p-4 sm:p-6 md:p-8">
        <img src="/logo.png" alt="Study Buddy Logo" className="mx-auto mb-4 w-24 sm:w-32" />
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-pure-black text-center">Available Courses</h2>
        <ul className="space-y-4">
          {courses.map((course) => (
            <li key={course.course_id} className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-pure-black">{course.courseName}</h3>
              <p><strong>Code:</strong> {course.courseCode}</p>
              <p><strong>Description:</strong> {course.description}</p>
              <button
                onClick={() => handleEnroll(course.course_id)}
                className="mt-2 bg-light-blue text-pure-black p-2 rounded hover:bg-blue-200 text-sm sm:text-base"
              >
                Enroll in Course
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CourseListPage;