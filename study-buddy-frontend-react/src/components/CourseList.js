import React, { useState, useEffect } from 'react';
    import axios from 'axios';

    function CourseList() {
      const [courses, setCourses] = useState(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [enrollmentMessage, setEnrollmentMessage] = useState('');
      const [enrollmentError, setEnrollmentError] = useState('');

      useEffect(() => {
        const fetchCourses = async () => {
          setLoading(true);
          setError(null);
          try {
            const response = await axios.get('http://localhost:3000/api/courses'); // Call List All Courses API (no JWT needed for listing courses)
            setCourses(response.data.courses);
          } catch (error) {
            setError(error.response?.data?.error || 'Failed to load courses');
            console.error("Error loading courses:", error);
          } finally {
            setLoading(false);
          }
        };

        fetchCourses();
      }, []); // Run once on mount

      const handleEnroll = async (courseId) => {
        setEnrollmentMessage(''); // Clear previous messages
        setEnrollmentError('');    // Clear previous errors
        try {
          // **Retrieve JWT token from localStorage for enrollment API call**
          const jwtToken = localStorage.getItem('authToken'); // Get JWT token

          if (!jwtToken) {
            setEnrollmentError("Please log in to enroll in courses."); // Handle case where user is not logged in
            return;
          }

          const response = await axios.post('http://localhost:3000/api/users/me/courses', { // Call Enroll User in Course API
            courseId: courseId,
          }, {
            headers: {
              Authorization: `Bearer ${jwtToken}`, // Include JWT token in Authorization header
              'Content-Type': 'application/json'
            }
          });

          setEnrollmentMessage(`Successfully enrolled in ${response.data.course.courseName}!`); // Set success message
          console.log("Enrollment Success:", response); // Log success response

        } catch (error) {
          setEnrollmentError(error.response?.data?.error || 'Error enrolling in course'); // Set error message
          console.error("Enrollment Error:", error); // Log error
        }
      };


      if (loading) {
        return <p>Loading courses...</p>;
      }

      if (error) {
        return <p className="error-message">Error loading courses: {error}</p>;
      }

      if (!courses) {
        return <p>Could not load courses.</p>;
      }


      return (
        <div className="course-list">
          <h2>Available Courses</h2>
          <ul className="courses">
            {courses.map(course => (
              <li key={course.course_id} className="course-item">
                <h3>{course.courseName}</h3>
                <p>Code: {course.courseCode}</p>
                <p>Description: {course.description}</p>
                <button onClick={() => handleEnroll(course.course_id)}>Enroll in Course</button> {/* Enroll Button */}
                {enrollmentMessage && <p className="success-message">{enrollmentMessage}</p>} {/* Enrollment success message */}
                {enrollmentError && <p className="error-message">{enrollmentError}</p>}       {/* Enrollment error message */}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    export default CourseList;