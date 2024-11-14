const express = require('express');
const bcrypt = require('bcrypt');
const User = require('./User'); // Your user model

const router = express.Router();


// Registration route (POST) - handle user registration
router.post('/register', async (req, res) => {
    const { username } = req.body; // Only the username for now

    try {
        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send('Username already taken');
        }

        // Create a new user without password field for now
        const newUser = new User({ username });
        await newUser.save();

        // Return a success message
        res.send('Registration successful!');
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).send('Error during registration');
    }
});


// Login route (POST) - handle login
router.post('/login', async (req, res) => {
    const { username } = req.body; // Only username for now

    try {
        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).send('Invalid username');
        }

        // Login successful, return a message
        res.send('Login successful!');
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).send('Error during login');
    }
});

// Export routes
module.exports = router;
