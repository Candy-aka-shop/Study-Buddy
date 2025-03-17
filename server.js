const express = require('express');
const app = express(); // **Crucially, this line must be present and executed before you use 'app'**
const port = process.env.PORT || 3000;
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const dbConfig = require('./db.config'); 

app.use(express.json()); // Middleware - usually placed after 'app' initialization
 
try {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
} catch (error) {
  console.error("Error starting the server:", error);
}
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


app.get('/', async (req, res) => { // Keep the test route
  // ... (your existing test route code) ...
});

app.listen(port, () => {
  // ... (your existing server listen code) ...
});
