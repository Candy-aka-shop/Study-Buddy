# Study Buddy Web Application

## Project Overview

The Study Buddy web application is a platform designed to connect students with peers for collaborative study sessions. It aims to facilitate academic collaboration and enhance student success by making it easy to find study partners based on shared courses and availability.

**Core Features:**

*   **User Registration & Profile Management:** Students can create and manage personal profiles, including academic details and study preferences.
*   **Availability & Preferences:** Users can set their study availability and preferences, such as group size and study style.
*   **Intelligent Matching System:** The application automatically suggests potential study buddies based on shared courses and availability overlap.
*   **Messaging/Communication:**  Basic one-on-one messaging functionality for users to coordinate study sessions.

## Table of Contents

1.  [Technologies Used](#technologies-used)
2.  [Setup Instructions](#setup-instructions)
    *   [Prerequisites](#prerequisites)
    *   [Backend Setup](#backend-setup)
    *   [Frontend Setup](#frontend-setup)
    *   [Database Setup](#database-setup)
3.  [API Endpoints](#api-endpoints)
    *   [User Registration (POST /api/users/register)](#user-registration-post-apiusersregister)
    *   [User Login (POST /api/users/login)](#user-login-post-apiuserslogin)
    *   [Get User Profile (GET /api/users/me)](#get-user-profile-get-apiusersme)
    *   [Update User Profile (PATCH /api/users/me)](#update-user-profile-patch-apiusersme)
    *   [Set/Update Study Preferences (POST /api/users/me/preferences)](#setupdate-study-preferences-post-apiusersmepreferences)
    *   [Get User Study Preferences (GET /api/users/me/preferences)](#get-user-study-preferences-get-apiusersmepreferences)
    *   [Set/Update User Availability (POST /api/users/me/availability)](#setupdate-user-availability-post-apiusersmeavailability)
    *   [Get User Availability (GET /api/users/me/availability)](#get-user-availability-get-apiusersmeavailability)
    *   [Get Study Buddy Suggestions (GET /api/users/me/study-buddies)](#get-study-buddy-suggestions-get-apiusersmestudy-buddies)
    *   [Send Message (POST /api/messages)](#send-message-post-apimessages)
    *   [Get User's Messages (Inbox) (GET /api/messages)](#get-users-messages-inbox-get-apimessages)
4.  [Running the Application](#running-the-application)
5.  [Further Work & Future Features](#further-work--future-features)
6.  [Credits](#credits)

## 1. Technologies Used

*   **Frontend:** React.js, JavaScript, HTML, CSS, Axios
*   **Backend:** Node.js, Express.js, PostgreSQL, `pg` (node-postgres), `bcrypt`, `jsonwebtoken`, `cors`, `dotenv`
*   **Database:** PostgreSQL
*   **Development Environment:** VS Code, Docker (for PostgreSQL)

## 2. Setup Instructions

Follow these instructions to set up the Study Buddy application for local development.

### Prerequisites

*   **Node.js and npm:** [https://nodejs.org/](https://nodejs.org/) (Ensure npm is installed with Node.js)
*   **PostgreSQL:** [https://www.postgresql.org/](https://www.postgresql.org/) (Or Docker Desktop for Docker-based PostgreSQL setup: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/))

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd study-buddy-backend-v2  # Or your backend project directory name
    ```

2.  **Install backend dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file in the backend root directory** and add your PostgreSQL database connection details and JWT secret key. Example `.env` file:

    ```
    DB_USER=your_db_username
    DB_HOST=localhost
    DB_NAME=study_buddy_db
    DB_PASSWORD=your_db_password
    DB_PORT=5432
    JWT_SECRET_KEY=yourSecretKeyForJWT
    ```
    **Replace the placeholder values** with your actual database credentials and a strong secret key for JWT.

4.  **Start the PostgreSQL database server.** If using Docker:
    ```bash
    docker run --name study-buddy-postgres -e POSTGRES_PASSWORD=your_postgres_password -p 5432:5432 -d postgres
    ```
    (Replace `your_postgres_password` with your chosen password).
    If using a local PostgreSQL installation, ensure your PostgreSQL server is running.

5.  **Create the `study_buddy_db` database and run table creation SQL scripts** using `psql` command-line client. See individual API endpoint sections below for table creation SQL.

6.  **Start the backend server:**
    ```bash
    node server.js
    ```
    The backend server should be running on `http://localhost:3000` (or the port specified in your `.env` or `server.js`).

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd study-buddy-frontend-react # Or your frontend project directory name
    ```

2.  **Install frontend dependencies:**
    ```bash
    npm install
    ```

3.  **Start the frontend development server:**
    ```powershell
    $env:PORT=3001; npm start
    ```
    The frontend React application should open in your web browser, typically at `http://localhost:3000` (or `http://localhost:3001` if port 3000 is already in use). Use powershell instead of cmd

### Database Setup

1.  **Connect to PostgreSQL database** using `psql` client:
    ```bash
    psql -h localhost -p 5432 -U postgres -d study_buddy_db
    ```

2.  **Create tables** by running the `CREATE TABLE` SQL statements provided in the API Endpoints section below for each table (`users`, `courses`, `study_preferences`, `availability`, `messages`). Copy and paste each `CREATE TABLE` statement into the `psql` prompt and execute them one by one.

## 3. API Endpoints

This section documents the main API endpoints for the Study Buddy Web Application.

**(Detailed documentation for each API endpoint should be included here, following the structure and examples we have used throughout the project.  For each endpoint, include: Endpoint URL, HTTP Method, Authentication, Request Body (example), Request Headers (example), Success Response (example), Error Responses (example)).  You can generate this documentation by summarizing the information from our previous discussions for each API endpoint (User Registration, Login, Get User Profile, Update User Profile, Study Preferences, Availability, Matching System, Messaging).  Use Markdown formatting for tables and code blocks to present the API documentation clearly.)**

**(Example - You need to complete this section by documenting ALL your API endpoints in detail, following this example format):**

### User Registration (POST /api/users/register)

*   **Endpoint URL:** `/api/users/register`
*   **HTTP Method:** `POST`
*   **Request Body (JSON):**
    ```json
    {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "password": "securePassword123",
      "academicYear": "Freshman",
      "profilePicture": "optional_profile_picture_url"
    }
    ```
*   **Success Response (201 Created):**
    ```json
    {
      "message": "User registered successfully",
      "user": {
        "user_id": 1,
        "name": "John Doe",
        "email": "john.doe@example.com",
        "academic_year": "Freshman",
        "profile_picture": null
      }
    }
    ```
*   **Error Responses:**
    *   **400 Bad Request:**  `{"error": "Missing required fields"}` (if name, email, password, academicYear are missing)
    *   **409 Conflict:** `{"error": "Email already registered"}` (if email is already in use)
    *   **500 Internal Server Error:** `{"error": "Error registering user", "details": "Database error details"}` (for backend server errors)

### User Login (POST /api/users/login)

*   **Endpoint URL:** `/api/users/login`
*   **HTTP Method:** `POST`
*   **Request Body (JSON):**
    ```json
    {
      "email": "john.doe@example.com",
      "password": "securePassword123"
    }
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "message": "Login successful",
      "token": "eyJhbGciOiJIUzI1NiI... (JWT Token) ...",
      "user": {
        "user_id": 1,
        "name": "John Doe",
        "email": "john.doe@example.com"
      }
    }
    ```
*   **Error Responses:**
    *   **400 Bad Request:** `{"error": "Missing email or password"}` (if email or password are missing)
    *   **401 Unauthorized:** `{"error": "Invalid credentials"}` (if email or password are incorrect)
    *   **500 Internal Server Error:** `{"error": "Login failed", "details": "Server error details"}` (for backend server errors)

### Get User Profile (GET /api/users/me)

*   **Endpoint URL:** `/api/users/me`
*   **HTTP Method:** `GET`
*   **Authentication:** **Required** (JWT Token in `Authorization` header - Bearer token)
*   **Request Headers (Example):**
    ```
    Authorization: Bearer eyJhbGciOiJIUzI1NiI... (JWT Token) ...
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "user": {
        "user_id": 1,
        "name": "John Doe",
        "email": "john.doe@example.com",
        "academic_year": "Freshman",
        "profile_picture": null
      }
    }
    ```
*   **Error Responses:**
    *   **401 Unauthorized:** (If JWT token is missing or invalid)
    *   **403 Forbidden:** (If JWT token is expired or invalid)
    *   **500 Internal Server Error:** `{"error": "Error getting user profile", "details": "Server error details"}` (for backend server errors)

### Update User Profile (PATCH /api/users/me)

*   **Endpoint URL:** `/api/users/me`
*   **HTTP Method:** `PATCH`
*   **Authentication:** **Required** (JWT Token in `Authorization` header - Bearer token)
*   **Request Headers (Example):**
    ```
    Authorization: Bearer eyJhbGciOiJIUzI1NiI... (JWT Token) ...
    Content-Type: application/json
    ```
*   **Request Body (JSON - Optional fields to update):**
    ```json
    {
      "name": "Updated Name",
      "academicYear": "Senior",
      "profilePicture": "new_profile_picture_url"
    }
    ```
    (All fields are optional. Send only the fields you want to update)
*   **Success Response (200 OK):**
    ```json
    {
      "message": "User profile updated successfully",
      "user": {
        "user_id": 1,
        "name": "Updated Name",
        "email": "john.doe@example.com",
        "academic_year": "Senior",
        "profile_picture": "new_profile_picture_url"
      }
    }
    ```
*   **Error Responses:**
    *   **400 Bad Request:** `{"error": "No fields to update provided"}` (if request body is empty or contains no valid updateable fields)
    *   **401 Unauthorized:** (If JWT token is missing or invalid)
    *   **403 Forbidden:** (If JWT token is expired or invalid)
    *   **500 Internal Server Error:** `{"error": "Error updating user profile", "details": "Server error details"}` (for backend server errors)

### Set/Update Study Preferences (POST /api/users/me/preferences)

*   **Endpoint URL:** `/api/users/me/preferences`
*   **HTTP Method:** `POST`
*   **Authentication:** **Required** (JWT Token in `Authorization` header - Bearer token)
*   **Request Headers (Example):**
    ```
    Authorization: Bearer eyJhbGciOiJIUzI1NiI... (JWT Token) ...
    Content-Type: application/json
    ```
*   **Request Body (JSON - Optional preference fields):**
    ```json
    {
      "preferredGroupSize": "Small Group",
      "preferredStudyStyle": "Discussion-Based",
      "studyEnvironmentPreference": "Library"
    }
    ```
    (All preference fields are optional. Send only the preferences you want to set or update)
*   **Success Response (200 OK):**
    ```json
    {
      "message": "Study preferences saved successfully",
      "preferences": {
        "preference_id": 1,
        "user_id": 1,
        "preferred_group_size": "Small Group",
        "preferred_study_style": "Discussion-Based",
        "study_environment_preference": "Library",
        "created_at": "...",
        "updated_at": "..."
      }
    }
    ```
*   **Error Responses:**
    *   **400 Bad Request:**
        *   `{"error": "Invalid preferredGroupSize value"}` (if preferredGroupSize is not one of the allowed values)
        *   `{"error": "Invalid preferredStudyStyle value"}` (if preferredStudyStyle is not one of the allowed values)
        *   `{"error": "Invalid studyEnvironmentPreference value"}` (if studyEnvironmentPreference is not one of the allowed values)
        *   `{"error": "No preferences to update provided"}` (if request body is empty or contains no valid preference fields)
    *   **401 Unauthorized:** (If JWT token is missing or invalid)
    *   **403 Forbidden:** (If JWT token is expired or invalid)
    *   **500 Internal Server Error:** `{"error": "Error saving study preferences", "details": "Server error details"}` (for backend server errors)

### Get User Study Preferences (GET /api/users/me/preferences)

*   **Endpoint URL:** `/api/users/me/preferences`
*   **HTTP Method:** `GET`
*   **Authentication:** **Required** (JWT Token in `Authorization` header - Bearer token)
*   **Request Headers (Example):**
    ```
    Authorization: Bearer eyJhbGciOiJIUzI1NiI... (JWT Token) ...
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "preferences": {
        "preference_id": 1,
        "user_id": 1,
        "preferred_group_size": "Small Group",
        "preferred_study_style": "Discussion-Based",
        "study_environment_preference": "Library",
        "created_at": "...",
        "updated_at": "..."
      }
    }
    ```
    (If preferences are not set yet, `preferences` object might be `null`)
*   **Error Responses:**
    *   **401 Unauthorized:** (If JWT token is missing or invalid)
    *   **403 Forbidden:** (If JWT token is expired or invalid)
    *   **500 Internal Server Error:** `{"error": "Error getting study preferences", "details": "Server error details"}` (for backend server errors)

### Set/Update User Availability (POST /api/users/me/availability)

*   **Endpoint URL:** `/api/users/me/availability`
*   **HTTP Method:** `POST`
*   **Authentication:** **Required** (JWT Token in `Authorization` header - Bearer token)
*   **Request Headers (Example):**
    ```
    Authorization: Bearer eyJhbGciOiJIUzI1NiI... (JWT Token) ...
    Content-Type: application/json
    ```
*   **Request Body (JSON - Array of availability slots):**
    ```json
    [
      { "dayOfWeek": "Monday", "startTime": "09:00", "endTime": "12:00" },
      { "dayOfWeek": "Wednesday", "startTime": "14:00", "endTime": "17:00" }
    ]
    ```
    (Send an array of availability slot objects. Replace existing availability with the new set)
*   **Success Response (200 OK):**
    ```json
    {
      "message": "Availability saved successfully"
    }
    ```
*   **Error Responses:**
    *   **400 Bad Request:**
        *   `{"error": "Invalid request body. Expected an array of availability slots."}` (if request body is not an array)
        *   `{"error": "Missing required fields (dayOfWeek, startTime, endTime) in availability slot."}` (if any slot is missing required fields)
        *   `{"error": "Invalid dayOfWeek: ... Allowed days are: ..."}` (if dayOfWeek is not valid)
        *   `{"error": "Invalid startTime or endTime format. Use 'HH:mm' format (e.g., '09:00')"}` (if time format is invalid)
        *   `{"error": "startTime must be before endTime"}` (if startTime is not before endTime)
    *   **401 Unauthorized:** (If JWT token is missing or invalid)
    *   **403 Forbidden:** (If JWT token is expired or invalid)
    *   **500 Internal Server Error:** `{"error": "Error saving availability", "details": "Server error details"}` (for backend server errors)

### Get User Availability (GET /api/users/me/availability)

*   **Endpoint URL:** `/api/users/me/availability`
*   **HTTP Method:** `GET`
*   **Authentication:** **Required** (JWT Token in `Authorization` header - Bearer token)
*   **Request Headers (Example):**
    ```
    Authorization: Bearer eyJhbGciOiJIUzI1NiI... (JWT Token) ...
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "availability": [
        {
          "availability_id": 1,
          "user_id": 1,
          "day_of_week": "Monday",
          "start_time": "09:00:00",
          "end_time": "12:00:00",
          "created_at": "...",
          "updated_at": "..."
        },
        // ... more availability slots ...
      ]
    }
    ```
    (If no availability is set, `availability` array might be empty `[]`)
*   **Error Responses:**
    *   **401 Unauthorized:** (If JWT token is missing or invalid)
    *   **403 Forbidden:** (If JWT token is expired or invalid)
    *   **500 Internal Server Error:** `{"error": "Error getting availability", "details": "Server error details"}` (for backend server errors)

### Get Study Buddy Suggestions (GET /api/users/me/study-buddies)

*   **Endpoint URL:** `/api/users/me/study-buddies`
*   **HTTP Method:** `GET`
*   **Authentication:** **Required** (JWT Token in `Authorization` header - Bearer token)
*   **Request Headers (Example):**
    ```
    Authorization: Bearer eyJhbGciOiJIUzI1NiI... (JWT Token) ...
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "message": "Study buddy suggestions retrieved successfully",
      "suggestions": [
        {
          "user_id": 2,
          "name": "Bob Johnson",
          "email": "bob.johnson@example.com",
          "academic_year": "Junior",
          "profile_picture": null,
          "shared_course_ids": [101, 201],
          "overlapScore": 60,
          "overlappingAvailability": [
            {
              "dayOfWeek": "Monday",
              "startTime1": "09:00:00",
              "endTime1": "10:00:00",
              "startTime2": "09:30:00",
              "endTime2": "11:30:00",
              "overlapDurationMinutes": 30
            }
          ],
          "preferenceScore": 15,
          "combinedScore": 75
        },
        // ... more suggested study buddies ...
      ]
    }
    ```
    (If no suggestions are found, `suggestions` array might be empty `[]`)
*   **Error Responses:**
    *   **401 Unauthorized:** (If JWT token is missing or invalid)
    *   **403 Forbidden:** (If JWT token is expired or invalid)
    *   **500 Internal Server Error:** `{"error": "Error getting study buddy suggestions", "details": "Server error details"}` (for backend server errors)

### Send Message (POST /api/messages)

*   **Endpoint URL:** `/api/messages`
*   **HTTP Method:** `POST`
*   **Authentication:** **Required** (JWT Token in `Authorization` header - Bearer token)
*   **Request Headers (Example):**
    ```
    Authorization: Bearer eyJhbGciOiJIUzI1NiI... (JWT Token) ...
    Content-Type: application/json
    ```
*   **Request Body (JSON):**
    ```json
    {
      "receiverUserId": 2, 
      "messageContent": "Hey Bob, let's study for CS101 on Monday!"
    }
    ```
    (Replace `receiverUserId` with the actual user_id of the recipient)
*   **Success Response (201 Created):**
    ```json
    {
      "message": "Message sent successfully",
      "message": {
        "message_id": 1,
        "sender_user_id": 1,
        "receiver_user_id": 2,
        "message_content": "Hey Bob, let's study for CS101 on Monday!",
        "timestamp": "...",
        "is_read": false
      }
    }
    ```
*   **Error Responses:**
    *   **400 Bad Request:**
        *   `{"error": "Missing receiverUserId or messageContent"}` (if receiverUserId or messageContent are missing)
        *   `{"error": "Cannot send message to yourself"}` (if senderUserId and receiverUserId are the same)
        *   `{"error": "Receiver user not found"}` (if receiverUserId does not exist)
    *   **401 Unauthorized:** (If JWT token is missing or invalid)
    *   **403 Forbidden:** (If JWT token is expired or invalid)
    *   **500 Internal Server Error:** `{"error": "Error sending message", "details": "Server error details"}` (for backend server errors)

### Get User's Messages (Inbox) (GET /api/messages)

*   **Endpoint URL:** `/api/messages`
*   **HTTP Method:** `GET`
*   **Authentication:** **Required** (JWT Token in `Authorization` header - Bearer token)
*   **Request Headers (Example):**
    ```
    Authorization: Bearer eyJhbGciOiJIUzI1NiI... (JWT Token) ...
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "messages": [
        {
          "message_id": 1,
          "sender_user_id": 1,
          "receiver_user_id": 2,
          "message_content": "Hey Bob, let's study for CS101 on Monday!",
          "timestamp": "...",
          "is_read": false
        },
        // ... more messages in inbox ...
      ]
    }
    ```
    (If inbox is empty, `messages` array might be empty `[]`)
*   **Error Responses:**
    *   **401 Unauthorized:** (If JWT token is missing or invalid)
    *   **403 Forbidden:** (If JWT token is expired or invalid)
    *   **500 Internal Server Error:** `{"error": "Error getting messages", "details": "Server error details"}` (for backend server errors)

**(Remember to replace the placeholder JWT tokens in the Request Headers examples with actual JWT tokens for testing).**

---


## 4. Running the Application

1.  **Start the backend server:**
    Navigate to the `study-buddy-backend-v2` directory in your terminal and run: `node server.js`
    The backend API will be accessible at `http://localhost:3000` (or your configured port).

2.  **Start the frontend application:**
    Navigate to the `study-buddy-frontend-react` directory in a separate terminal and run: `npm start`
    The frontend React application will open in your web browser, typically at `http://localhost:3000` (or `http://localhost:3001`).

3.  **Access the Study Buddy Web Application in your browser** at the URL provided by the React development server (e.g., `http://localhost:3000` or `http://localhost:3001`).

## 5. Further Work & Future Features

This research probe and project implementation provides a solid foundation for the Study Buddy Web Application. Future work could focus on:

*   **Enhancing the Matching System Algorithm:**
    *   Incorporating study preferences matching into the algorithm.
    *   Implementing more sophisticated availability overlap scoring (e.g., weighting overlap duration, considering time of day preferences).
    *   Adding filtering and ranking options for study buddy suggestions.
*   **Implementing Optional/Advanced Features:**
    *   Session Scheduling API and UI.
    *   Study Resource Sharing functionality.
    *   User Engagement and Feedback features (session ratings, feedback, gamification).
    *   Group Messaging functionality.
*   **Improving User Interface and User Experience (UI/UX):**
    *   Developing a more visually appealing and user-friendly React front-end UI.
    *   Implementing responsive design for different screen sizes.
    *   Improving form validation and error handling in the front-end.
*   **Testing and Deployment:**
    *   Writing unit and integration tests for backend and frontend code.
    *   Deploying the application to a cloud hosting platform (e.g., Heroku, Netlify, AWS, Azure).
*   **Security Enhancements:**
    *   Implementing more robust input validation and sanitization to prevent vulnerabilities.
    *   Strengthening password hashing and JWT security practices.
    *   Conducting security testing and vulnerability assessments.

## 6. Credits

This Study Buddy Web Application project was developed by [**Jamilya**].

