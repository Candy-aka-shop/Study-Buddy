import './RegisterForm.css'; // Import RegisterForm.css for styling
import React, { useState } from 'react';
import axios from 'axios';

function RegisterForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [registrationMessage, setRegistrationMessage] = useState('');
    const [registrationError, setRegistrationError] = useState('');

    const handleRegister = async (event) => {
        event.preventDefault(); // Prevent default form submission (page reload)
        setRegistrationMessage(''); // Clear previous messages
        setRegistrationError('');    // Clear previous errors

        try {
            const response = await axios.post('http://localhost:3000/api/users/register', { // Call User Registration API
                name: name,
                email: email,
                password: password,
                academicYear: academicYear,
            }, {
                headers: {
                    'Content-Type': 'application/json' // Explicitly set Content-Type header
                }
            });

            setRegistrationMessage(response.data.message); // Set success message
            console.log("Registration Success:", response); // Log success response
            // Clear form fields after successful registration (optional)
            setName('');
            setEmail('');
            setPassword('');
            setAcademicYear('');

        } catch (error) {
            setRegistrationError(error.response?.data?.error || 'Error during registration'); // Set error message from API or generic error
            console.error("Registration Error:", error); // Log error to console
        }
    };

    return (
        <div className="register-form">
            <h2>User Registration</h2>
            <form onSubmit={handleRegister}>
                <div>
                    <label htmlFor="name">Name:</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="academicYear">Academic Year:</label>
                    <input type="text" id="academicYear" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} required />
                </div>
                <button type="submit">Register</button>

                {registrationMessage && <p className="success-message">{registrationMessage}</p>}
                {registrationError && <p className="error-message">{registrationError}</p>}
            </form>
        </div>
    );
}

export default RegisterForm;