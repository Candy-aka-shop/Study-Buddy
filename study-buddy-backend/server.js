const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dbConfig = require('./db.config');
const cors = require('cors');


//app.use(cors()); // **Enable CORS middleware for all routes

const app = express();
const port = process.env.PORT || 3000;
app.use(cors()); // Enable CORS for all routes

// **Double-check: express.json() middleware setup**
app.use(express.json()); // Middleware to parse JSON request bodies

const pool = new Pool(dbConfig);

// User Registration Endpoint
app.post('/api/users/register', async (req, res) => {
    try {
        const { name, email, password, academicYear, profilePicture } = req.body;

        // 1. Basic Input Validation (you can add more robust validation)
        if (!name || !email || !password || !academicYear) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        // TODO: Add more robust email and password validation

        // 2. Check if email already exists
        const emailCheckResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (emailCheckResult.rows.length > 0) {
            return res.status(409).json({ error: "Email already registered" }); // 409 Conflict
        }

        // 3. Hash the password
        const saltRounds = 10; // Recommended salt rounds for bcrypt
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 4. Insert new user into database
        const insertResult = await pool.query(
            'INSERT INTO users (name, email, password, academic_year, profile_picture) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, name, email, academic_year, profile_picture',
            [name, email, hashedPassword, academicYear, profilePicture || null] // profilePicture is optional
        );

        const newUser = insertResult.rows[0];

        // 5. Return success response (201 Created)
        res.status(201).json({ message: "User registered successfully", user: newUser });

    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Error registering user", details: error.message }); // 500 Internal Server Error
    }
});
// User Login Endpoint
app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Input Validation (basic)
        if (!email || !password) {
            return res.status(400).json({ error: "Missing email or password" }); // 400 Bad Request
        }

        // 2. Find user by email
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        // 3. Check if user exists
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" }); // 401 Unauthorized
        }

        // 4. Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password);

        // 5. If passwords match, generate JWT
        if (passwordMatch) {
            const payload = { userId: user.user_id, email: user.email }; // Payload for JWT (include user ID and email)
            const secretKey = process.env.JWT_SECRET_KEY || 'your_jwt_secret_key'; // Use environment variable for secret key, default for dev
            const token = jwt.sign(payload, secretKey, { expiresIn: '1h' }); // Sign JWT, expires in 1 hour

            // 6. Return success response with JWT and user info
            return res.status(200).json({ message: "Login successful", token: token, user: { userId: user.user_id, name: user.name, email: user.email } }); // 200 OK
        } else {
            // Passwords don't match
            return res.status(401).json({ error: "Invalid credentials" }); // 401 Unauthorized
        }

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Login failed", details: error.message }); // 500 Internal Server Error
    }
});
// Get User Profile Endpoint (Requires JWT Authentication)
app.get('/api/users/me', authenticateToken, async (req, res) => {
    // 'authenticateToken' is middleware we will create to verify JWT
    try {
        const userId = req.user.userId; // 'req.user' is set by authenticateToken middleware

        // 1. Retrieve user profile from database (excluding password)
        const userResult = await pool.query(
            'SELECT user_id, name, email, academic_year, profile_picture FROM users WHERE user_id = $1',
            [userId]
        );
        const userProfile = userResult.rows[0];

        // 2. Check if user profile found
        if (!userProfile) {
            return res.status(404).json({ error: "User profile not found" }); // 404 Not Found (unlikely, but possible)
        }

        // 3. Return success response with user profile (200 OK)
        res.status(200).json({ user: userProfile });

    } catch (error) {
        console.error("Error getting user profile:", error);
        res.status(500).json({ error: "Error getting user profile", details: error.message }); // 500 Internal Server Error
    }
});
// Update User Profile Endpoint (PATCH /api/users/me) - Requires JWT Authentication
app.patch('/api/users/me', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId; // User ID from JWT

        const { name, academicYear, profilePicture } = req.body; // Extract fields to update from request body

        // 1. Basic Input Validation (optional fields, but validate if provided)
        // You can add more specific validation if needed, e.g., for academicYear or profilePicture format

        // 2. Build dynamic UPDATE query (only update provided fields)
        const updates = [];
        const values = [userId]; // userId is always the first value in the array for WHERE clause
        let valueIndex = 2; // Start parameter index at 2 (after userId at index 1)

        if (name) {
            updates.push(`name = $${valueIndex}`);
            values.push(name);
            valueIndex++;
        }
        if (academicYear) {
            updates.push(`academic_year = $${valueIndex}`);
            values.push(academicYear);
            valueIndex++;
        }
        if (profilePicture) {
            updates.push(`profile_picture = $${valueIndex}`);
            values.push(profilePicture);
            valueIndex++;
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: "No fields to update provided" }); // 400 Bad Request if no fields in body
        }

        const updateQuery = `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1 RETURNING user_id, name, email, academic_year, profile_picture`;
        // console.log("Update Query:", updateQuery); // For debugging - remove in production
        // console.log("Update Values:", values); // For debugging - remove in production

        // 3. Execute UPDATE query
        const updateResult = await pool.query(updateQuery, values);
        const updatedUser = updateResult.rows[0];

        // 4. Check if user profile updated
        if (!updatedUser) {
            return res.status(404).json({ error: "User profile not found for update" }); // 404 Not Found (unlikely)
        }

        // 5. Return success response with updated user profile (200 OK)
        res.status(200).json({ message: "User profile updated successfully", user: updatedUser });

    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ error: "Error updating user profile", details: error.message }); // 500 Internal Server Error
    }
});
// **Study Preferences API Endpoints**

// Set/Update Study Preferences (POST /api/users/me/preferences) - Requires JWT Authentication
app.post('/api/users/me/preferences', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId; // User ID from JWT
        const { preferredGroupSize, preferredStudyStyle, studyEnvironmentPreference } = req.body;

        // 1. Input Validation (basic - check if values are valid strings, you can add more specific validation)
        // Define allowed values for preferences (you can store these in a config or enum)
        const allowedGroupSizes = ["Individual", "Small Group", "Large Group"];
        const allowedStudyStyles = ["Quiet Study", "Discussion-Based", "Practice Problems"];
        const allowedEnvironments = ["Online", "On-Campus", "Library", "Coffee Shop"];

        if (preferredGroupSize && !allowedGroupSizes.includes(preferredGroupSize)) {
            return res.status(400).json({ error: "Invalid preferredGroupSize value" }); // 400 Bad Request
        }
        if (preferredStudyStyle && !allowedStudyStyles.includes(preferredStudyStyle)) {
            return res.status(400).json({ error: "Invalid preferredStudyStyle value" }); // 400 Bad Request
        }
        if (studyEnvironmentPreference && !allowedEnvironments.includes(studyEnvironmentPreference)) {
            return res.status(400).json({ error: "Invalid studyEnvironmentPreference value" }); // 400 Bad Request
        }

        // 2. Check if preferences already exist for user
        const existingPreferencesResult = await pool.query('SELECT * FROM study_preferences WHERE user_id = $1', [userId]);
        const existingPreferences = existingPreferencesResult.rows[0];

        let query, values;

        if (existingPreferences) {
            // Preferences exist - UPDATE
            const updates = [];
            values = [userId];
            let valueIndex = 2;

            if (preferredGroupSize) {
                updates.push(`preferred_group_size = $${valueIndex}`);
                values.push(preferredGroupSize);
                valueIndex++;
            }
            if (preferredStudyStyle) {
                updates.push(`preferred_study_style = $${valueIndex}`);
                values.push(preferredStudyStyle);
                valueIndex++;
            }
            if (studyEnvironmentPreference) {
                updates.push(`study_environment_preference = $${valueIndex}`);
                values.push(studyEnvironmentPreference);
                valueIndex++;
            }

            if (updates.length === 0) {
                return res.status(400).json({ error: "No preferences to update provided" }); // 400 Bad Request
            }

            query = `UPDATE study_preferences SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1 RETURNING *`;


        } else {
            // Preferences do not exist - INSERT
            query = `INSERT INTO study_preferences (user_id, preferred_group_size, preferred_study_style, study_environment_preference) VALUES ($1, $2, $3, $4) RETURNING *`;
            values = [userId, preferredGroupSize || null, preferredStudyStyle || null, studyEnvironmentPreference || null]; // Allow null values if not provided

        }

        // 3. Execute INSERT or UPDATE query
        const preferenceResult = await pool.query(query, values);
        const userPreferences = preferenceResult.rows[0];


        // 4. Return success response with user preferences (200 OK)
        res.status(200).json({ message: "Study preferences saved successfully", preferences: userPreferences });

    } catch (error) {
        console.error("Error saving study preferences:", error);
        res.status(500).json({ error: "Error saving study preferences", details: error.message }); // 500 Internal Server Error
    }
});


// Get User Study Preferences (GET /api/users/me/preferences) - Requires JWT Authentication
app.get('/api/users/me/preferences', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId; // User ID from JWT

        // 1. Retrieve user preferences from database
        const preferencesResult = await pool.query(
            'SELECT preference_id, preferred_group_size, preferred_study_style, study_environment_preference FROM study_preferences WHERE user_id = $1',
            [userId]
        );
        const userPreferences = preferencesResult.rows[0]; // Expecting only one row or null

        // 2. Return success response (200 OK) with user preferences (can be null if not set yet)
        res.status(200).json({ preferences: userPreferences || null }); // Return null if no preferences set yet

    } catch (error) {
        console.error("Error getting study preferences:", error);
        res.status(500).json({ error: "Error getting study preferences", details: error.message }); // 500 Internal Server Error
    }
});
// **Availability API Endpoints**

// Set/Update User Availability (POST /api/users/me/availability) - Requires JWT Authentication
app.post('/api/users/me/availability', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId; // User ID from JWT
        const availabilitySlots = req.body; // Array of availability slots from request body

        // 1. Input Validation for Availability Slots
        if (!Array.isArray(availabilitySlots)) {
            return res.status(400).json({ error: "Invalid request body. Expected an array of availability slots." }); // 400 Bad Request
        }

        const allowedDaysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/; // Regex for "HH:mm" format

        for (const slot of availabilitySlots) {
            if (!slot.dayOfWeek || !slot.startTime || !slot.endTime) {
                return res.status(400).json({ error: "Missing required fields (dayOfWeek, startTime, endTime) in availability slot." }); // 400 Bad Request
            }
            if (!allowedDaysOfWeek.includes(slot.dayOfWeek)) {
                return res.status(400).json({ error: `Invalid dayOfWeek: ${slot.dayOfWeek}. Allowed days are: ${allowedDaysOfWeek.join(", ")}` }); // 400 Bad Request
            }
            if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
                return res.status(400).json({ error: "Invalid startTime or endTime format. Use 'HH:mm' format (e.g., '09:00')" }); // 400 Bad Request
            }
            if (slot.startTime >= slot.endTime) {
                return res.status(400).json({ error: "startTime must be before endTime" }); // 400 Bad Request
            }
        }

        // 2. Delete existing availability for user
        await pool.query('DELETE FROM availability WHERE user_id = $1', [userId]);

        // 3. Insert new availability slots
        for (const slot of availabilitySlots) {
            await pool.query(
                'INSERT INTO availability (user_id, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4)',
                [userId, slot.dayOfWeek, slot.startTime, slot.endTime]
            );
        }

        // 4. Return success response (200 OK)
        res.status(200).json({ message: "Availability saved successfully" });

    } catch (error) {
        console.error("Error saving availability:", error);
        res.status(500).json({ error: "Error saving availability", details: error.message }); // 500 Internal Server Error
    }
});


// Get User Availability (GET /api/users/me/availability) - Requires JWT Authentication
app.get('/api/users/me/availability', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId; // User ID from JWT

        // 1. Retrieve availability slots from database
        const availabilityResult = await pool.query(
            'SELECT availability_id, day_of_week, start_time, end_time FROM availability WHERE user_id = $1',
            [userId]
        );
        const availabilitySlots = availabilityResult.rows;

        // 2. Return success response (200 OK) with availability slots (can be empty array)
        res.status(200).json({ availability: availabilitySlots });

    } catch (error) {
        console.error("Error getting availability:", error);
        res.status(500).json({ error: "Error getting availability", details: error.message }); // 500 Internal Server Error
    }
});
// **Messaging/Communication API Endpoints**

// Send Message (POST /api/messages) - Requires JWT Authentication
app.post('/api/messages', authenticateToken, async (req, res) => {
    try {
        const senderUserId = req.user.userId; // Sender user ID from JWT
        const { receiverUserId, messageContent } = req.body;

        // 1. Input Validation
        if (!receiverUserId || !messageContent) {
            return res.status(400).json({ error: "Missing receiverUserId or messageContent" }); // 400 Bad Request
        }
        if (senderUserId === parseInt(receiverUserId)) { // Prevent sending message to yourself
            return res.status(400).json({ error: "Cannot send message to yourself" }); // 400 Bad Request
        }

        // 2. Check if receiver user exists
        const receiverUserResult = await pool.query('SELECT user_id FROM users WHERE user_id = $1', [receiverUserId]);
        if (receiverUserResult.rows.length === 0) {
            return res.status(400).json({ error: "Receiver user not found" }); // 400 Bad Request
        }

        // 3. Insert new message into database
        const insertResult = await pool.query(
            'INSERT INTO messages (sender_user_id, receiver_user_id, message_content) VALUES ($1, $2, $3) RETURNING message_id, sender_user_id, receiver_user_id, message_content, timestamp, is_read',
            [senderUserId, receiverUserId, messageContent]
        );

        const newMessage = insertResult.rows[0];

        // 4. Return success response (201 Created)
        res.status(201).json({ message: "Message sent successfully", message: newMessage });


    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Error sending message", details: error.message }); // 500 Internal Server Error
    }
});


// Get User's Messages (Inbox) (GET /api/messages) - Requires JWT Authentication
app.get('/api/messages', authenticateToken, async (req, res) => {
    try {
        const receiverUserId = req.user.userId; // Current user is the receiver

        // 1. Retrieve messages from database for the current user (receiver)
        const messagesResult = await pool.query(
            'SELECT message_id, sender_user_id, receiver_user_id, message_content, timestamp, is_read FROM messages WHERE receiver_user_id = $1 ORDER BY timestamp DESC', // Order by timestamp DESC for newest messages first
            [receiverUserId]
        );
        const messages = messagesResult.rows;

        // 2. Return success response (200 OK) with messages list
        res.status(200).json({ messages: messages });

    } catch (error) {
        console.error("Error getting messages:", error);
        res.status(500).json({ error: "Error getting messages", details: error.message }); // 500 Internal Server Error
    }
});



// **Matching System API Endpoint**
// Get Study Buddy Suggestions (GET /api/users/me/study-buddies) - Requires JWT Authentication - **UPDATED with Detailed Logging**


// Get Study Buddy Suggestions (GET /api/users/me/study-buddies) - Requires JWT Authentication - **UPDATED with Match Availability Logging**
app.get('/api/users/me/study-buddies', authenticateToken, async (req, res) => {
    try {
        const currentUserId = req.user.userId;
        console.log(`Get Study Buddy Suggestions API called for user_id: ${currentUserId}`); // Log: API call start

        // 1. Get current user's courses and availability
        console.log(`Fetching courses for user_id: ${currentUserId}`); // Log: Fetching courses
        const userCoursesResult = await pool.query('SELECT course_id FROM user_courses WHERE user_id = $1', [currentUserId]);
        const currentUserCourseIds = userCoursesResult.rows.map(row => row.course_id);
        console.log(`User courses found:`, currentUserCourseIds); // Log: User courses

        const currentUserAvailabilityResult = await pool.query('SELECT day_of_week, start_time, end_time FROM availability WHERE user_id = $1', [currentUserId]);
        const currentUserAvailability = currentUserAvailabilityResult.rows;
        console.log(`User availability slots found:`, currentUserAvailability); // Log: User availability

        if (currentUserCourseIds.length === 0) {
            console.log("User not enrolled in any courses - returning empty suggestions"); // Log: No courses - empty suggestions
            return res.status(200).json({ message: "No study buddy suggestions available. You are not enrolled in any courses yet.", suggestions: [] });
        }

        // 2. Find potential matches (users sharing courses) - Exclude current user
        console.log("Finding potential matches (users sharing courses)"); // Log: Finding matches
        const potentialMatchesResult = await pool.query(
            `SELECT u.user_id, u.name, u.email, u.academic_year, u.profile_picture,
          ARRAY_AGG(DISTINCT uc.course_id) AS shared_course_ids
        FROM users u
        INNER JOIN user_courses uc ON u.user_id = uc.user_id
        WHERE uc.course_id IN (${currentUserCourseIds.map((_, index) => `$${index + 1}`).join(', ')}) 
          AND u.user_id != $${currentUserCourseIds.length + 1} 
        GROUP BY u.user_id, u.name, u.email, u.academic_year, u.profile_picture
        ORDER BY u.user_id`,
            [...currentUserCourseIds, currentUserId]
        );

        let potentialMatches = potentialMatchesResult.rows;
        console.log(`Potential matches found (sharing courses):`, potentialMatches); // Log: Potential matches

        // 3. Retrieve availability for potential matches and calculate overlap score
        const suggestionsWithOverlap = [];
        console.log("Calculating availability overlap for potential matches"); // Log: Calculating overlap
        for (const match of potentialMatches) {
            const matchAvailabilityResult = await pool.query('SELECT day_of_week, start_time, end_time FROM availability WHERE user_id = $1', [match.user_id]);
            const matchAvailability = matchAvailabilityResult.rows;
            console.log(`Availability slots for potential match user_id ${match.user_id}:`, matchAvailability); // **Log: Match Availability Slots - ADDED LOGGING HERE**

            let overlapScore = 0;
            const overlappingSlots = [];

            for (const matchSlot of matchAvailability) {
                for (const currentUserSlot of currentUserAvailability) { // **Important: Nested loops - currentUserSlot is INNER loop**
                    if (currentUserSlot.day_of_week === matchSlot.day_of_week) {
                        // Check for time overlap
                        const overlap = calculateTimeOverlap(currentUserSlot, matchSlot);
                        if (overlap > 0) {
                            overlapScore += overlap;
                            overlappingSlots.push({
                                dayOfWeek: currentUserSlot.day_of_week,
                                startTime1: currentUserSlot.start_time, endTime1: currentUserSlot.end_time,
                                startTime2: matchSlot.start_time, endTime2: matchSlot.end_time,
                                overlapDurationMinutes: overlap
                            });
                        }
                    }
                }
            }

            suggestionsWithOverlap.push({
                ...match,
                overlapScore: overlapScore,
                overlappingAvailability: overlappingSlots
            });
        }

        console.log(`Suggestions with overlap scores calculated:`, suggestionsWithOverlap); // Log: Suggestions with scores

        // 4. Sort suggestions by overlap score (descending)
        suggestionsWithOverlap.sort((a, b) => b.overlapScore - a.overlapScore);
        const filteredSuggestions = suggestionsWithOverlap.filter(suggestion => suggestion.overlapScore > 0); // Filter out no overlap - already commented out

        console.log(`Final study buddy suggestions (after sorting and filtering):`, filteredSuggestions); // Log: Final suggestions

        // 5. Return success response with study buddy suggestions (200 OK)
        res.status(200).json({ message: "Study buddy suggestions retrieved successfully", suggestions: filteredSuggestions });

    } catch (error) {
        console.error("Error getting study buddy suggestions:", error);
        res.status(500).json({ error: "Error getting study buddy suggestions", details: error.message });
    }
});


function calculateTimeOverlap(slot1, slot2) {
    console.log("calculateTimeOverlap called with slot1:", slot1, " and slot2:", slot2);

    console.log("slot1.start_time (string):", slot1.start_time);
    console.log("slot1.end_time (string):", slot1.end_time);
    console.log("slot2.start_time (string):", slot2.start_time);
    console.log("slot2.end_time (string):", slot2.end_time);

    // 1. Parse time strings into hours and minutes (for slot1)
    const [startHour1, startMinute1] = slot1.start_time.split(':').map(Number);
    const [endHour1, endMinute1] = slot1.end_time.split(':').map(Number);

    // 2. Parse time strings into hours and minutes (for slot2)
    const [startHour2, startMinute2] = slot2.start_time.split(':').map(Number);
    const [endHour2, endMinute2] = slot2.end_time.split(':').map(Number);

    console.log(`slot1 - startHour1: ${startHour1}, startMinute1: ${startMinute1}, endHour1: ${endHour1}, endMinute1: ${endMinute1}`); // Log: Parsed times
    console.log(`slot2 - startHour2: ${startHour2}, startMinute2: ${startMinute2}, endHour2: ${endHour2}, endMinute2: ${endMinute2}`); // Log: Parsed times


    // 3. Convert times to minutes from start of day for easier comparison
    const startTimeMinutes1 = startHour1 * 60 + startMinute1;
    const endTimeMinutes1 = endHour1 * 60 + endMinute1;
    const startTimeMinutes2 = startHour2 * 60 + startMinute2;
    const endTimeMinutes2 = endHour2 * 60 + endMinute2;

    console.log(`slot1 - startTimeMinutes1: ${startTimeMinutes1}, endTimeMinutes1: ${endTimeMinutes1}`); // Log: Time in minutes
    console.log(`slot2 - startTimeMinutes2: ${startTimeMinutes2}, endTimeMinutes2: ${endTimeMinutes2}`); // Log: Time in minutes


    // 4. Calculate overlap start and end times in minutes
    const overlapStartMinutes = Math.max(startTimeMinutes1, startTimeMinutes2);
    const overlapEndMinutes = Math.min(endTimeMinutes1, endTimeMinutes2);

    console.log("overlapStartMinutes:", overlapStartMinutes); // Log: Overlap start/end in minutes
    console.log("overlapEndMinutes:", overlapEndMinutes);


    // 5. Check for overlap and calculate overlap duration in minutes
    if (overlapStartMinutes < overlapEndMinutes) {
        const overlapMinutes = overlapEndMinutes - overlapStartMinutes;
        console.log("Overlap found - overlapMinutes:", overlapMinutes);
        return overlapMinutes; // Overlap in minutes
    }

    console.log("No overlap found");
    return 0; // No overlap
}
// Create Course (POST /api/courses) - For now, no authentication
app.post('/api/courses', async (req, res) => {
    try {
        const { courseName, courseCode, description } = req.body;

        // 1. Input Validation
        if (!courseName || !courseCode) {
            return res.status(400).json({ error: "Course name and code are required" }); // 400 Bad Request
        }

        // 2. Check if course code already exists
        const codeCheckResult = await pool.query('SELECT * FROM courses WHERE course_code = $1', [courseCode]);
        if (codeCheckResult.rows.length > 0) {
            return res.status(409).json({ error: "Course code already exists" }); // 409 Conflict
        }

        // 3. Insert new course into database
        const insertResult = await pool.query(
            'INSERT INTO courses (course_name, course_code, description) VALUES ($1, $2, $3) RETURNING course_id, course_name, course_code, description',
            [courseName, courseCode, description || null] // description is optional
        );

        const newCourse = insertResult.rows[0];

        // 4. Return success response (201 Created)
        res.status(201).json({ message: "Course created successfully", course: newCourse });

    } catch (error) {
        console.error("Error creating course:", error);
        res.status(500).json({ error: "Error creating course", details: error.message }); // 500 Internal Server Error
    }
});

// List All Courses (GET /api/courses) - Public endpoint
app.get('/api/courses', async (req, res) => {
    try {
        // 1. Retrieve all courses from database
        const coursesResult = await pool.query('SELECT course_id, course_name, course_code, description FROM courses');
        const courses = coursesResult.rows;

        // 2. Return success response (200 OK) with courses list
        res.status(200).json({ courses: courses });

    } catch (error) {
        console.error("Error listing courses:", error);
        res.status(500).json({ error: "Error listing courses", details: error.message }); // 500 Internal Server Error
    }
});

// Get Course by ID (GET /api/courses/:courseId) - Public endpoint
app.get('/api/courses/:courseId', async (req, res) => {
    try {
        const courseId = parseInt(req.params.courseId); // Extract courseId from path parameter

        // 1. Validate courseId (basic integer check)
        if (isNaN(courseId) || courseId <= 0) {
            return res.status(400).json({ error: "Invalid course ID" }); // 400 Bad Request
        }

        // 2. Retrieve course from database by ID
        const courseResult = await pool.query(
            'SELECT course_id, course_name, course_code, description FROM courses WHERE course_id = $1',
            [courseId]
        );
        const course = courseResult.rows[0];

        // 3. Check if course found
        if (!course) {
            return res.status(404).json({ error: "Course not found" }); // 404 Not Found
        }

        // 4. Return success response (200 OK) with course data
        res.status(200).json({ course: course });

    } catch (error) {
        console.error("Error getting course by ID:", error);
        res.status(500).json({ error: "Error getting course by ID", details: error.message }); // 500 Internal Server Error
    }
});


// **Middleware function to authenticate JWT token**
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']; // Get Authorization header
    const token = authHeader && authHeader.split(' ')[1]; // Extract token (Bearer <token>)

    if (token == null) {
        return res.sendStatus(401); // 401 Unauthorized if no token
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY || 'your_jwt_secret_key', (err, user) => {
        if (err) {
            return res.sendStatus(403); // 403 Forbidden if token invalid/expired
        }
        req.user = user; // Add user payload to request object
        next(); // Proceed to the next middleware or route handler
    });
}


app.get('/', async (req, res) => { // Test route
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT $1::text as message', ['Hello from PostgreSQL!']);
        const message = result.rows[0].message;
        client.release();
        res.send(`Database says: ${message}`);
    } catch (err) {
        console.error("Error connecting to database", err);
        res.status(500).send("Error connecting to database");
    }
});

app.listen(port, '127.0.0.1', () => {
    console.log(`Minimal Server listening on http://localhost:${port}`);
});
