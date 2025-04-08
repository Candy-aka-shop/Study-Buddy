import React, { useState } from 'react';
import axios from 'axios'; // Import axios
import logo from './logo.svg'; // Import React logo (optional)
import './App.css'; // Import App.css (optional)

function App() {
    const [apiResponse, setApiResponse] = useState(null);
    const [apiError, setApiError] = useState(null);

    const callApi = async () => {
        setApiResponse(null); // Clear previous response
        setApiError(null);     // Clear previous error
        try {
            // **Replace with your actual JWT token for a registered user (e.g., Charlie's JWT)**
            const jwtToken = "YOUR_JWT_TOKEN_HERE"; // **Important: Replace Placeholder!**

            const response = await axios.get('http://localhost:3000/api/users/me', { // Call Get User Profile API
                headers: {
                    Authorization: `Bearer ${jwtToken}`, // Include JWT in Authorization header
                },
            });
            setApiResponse(JSON.stringify(response.data, null, 2)); // Format and display API response
            console.log("API Response:", response); // Log response to console for debugging
        } catch (error) {
            setApiError(JSON.stringify(error, null, 2)); // Format and display API error
            console.error("API Error:", error); // Log error to console
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <h1>Test API Connection</h1>
                <button onClick={callApi}>Call Get User Profile API</button>
                {apiResponse && (
                    <div className="api-response">
                        <h2>API Response:</h2>
                        <pre>{apiResponse}</pre>
                    </div>
                )}
                {apiError && (
                    <div className="api-error">
                        <h2>API Error:</h2>
                        <pre>{apiError}</pre>
                    </div>
                )}
            </header>
        </div>
    );
}
