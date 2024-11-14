const express = require('express');
const bcrypt = require('bcrypt');
const User = require('./User'); // Your user model

const router = express.Router();

// Registration route (POST) - handle user registration
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send('Username already taken');
        }

        // Create a new user with password
        const newUser = new User({ username, password });
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
    const { username, password } = req.body;

    try {
        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).send('Invalid username');
        }

        // Compare password with the stored hashed password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).send('Invalid password');
        }

        // Login successful
        res.send('Login successful!');
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).send('Error during login');
    }
});

// Export routes
module.exports = router;
