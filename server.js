import express from 'express';
import bcrypt from 'bcrypt'; // Import bcrypt for password hashing
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
const app = express();

const port = 9000;
app.set('view engine', 'ejs');

mongoose.connect('mongodb://0.0.0.0:27017/userLogin', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

import User from './models/userModel.js';

app.use(bodyParser.urlencoded({ extended: true }));

// Login Route (GET) - render the login form
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// Login Route (POST) - handle login requests
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.render('login', { error: 'Invalid username or password' });
        }
        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { error: 'Invalid username or password' });
        }
        // On successful login
        res.redirect('/dashboard'); // Redirect to a dashboard or home page
    } catch (err) {
        console.error('Error during login:', err);
        res.render('login', { error: 'Login failed' });
    }
});

app.get('/register', (req, res) => {
    res.render('register'); // Render the registration form
});

app.post('/register', async (req, res) => {
       const { username, password } = req.body;

       try {
            // Check if the username already exists
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.render('register', { error: 'Username already taken' });
            }

           // Hash the password
           const hashedPassword = await bcrypt.hash(password, 10);

           // Create a new user with an empty listings array
           const newUser = new User({ username, password: hashedPassword, listings: [] });
           await newUser.save();
           res.redirect('/login'); // Redirect to login after successful registration
       } catch (err) {
           console.error('Error during registration:', err);
           res.render('register', { error: 'Registration failed' }); // Handle errors
       }
   });

app.get('/users', async (req, res) => {
    try {
        const users = await User.find(); // Finds all documents in the 'User' collection
        console.log(users); // Logs documents to the console
        res.json(users);    // Sends documents as JSON response
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).send('Error fetching users');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});