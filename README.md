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
     ```bash
     npm start
     ```
     The frontend React application should open in your web browser, typically at `http://localhost:3000` (or `http://localhost:3001` if port 3000 is already in use).
 
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
 
 **(Continue documenting all your API endpoints in a similar format, including Request Body examples, Success and Error Response examples for each endpoint: User Login, Get User Profile, Update User Profile, Study Preferences, Availability, Matching System, Send Message, Get User's Messages.  Refer to our previous discussions and code for the details of each API endpoint to create this documentation section.)**
 
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
 