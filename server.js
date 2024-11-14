const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

// MongoDB connection string (replace with your actual MongoDB connection URI)
const mongoURI = 'mongodb+srv://shreyaslshah:shreyasshah@cluster0.ya2to.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB using Mongoose
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((err) => {
    console.error('MongoDB connection error:', err);
});

// Body parser middleware to handle incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Import routes from app.js
const routes = require('./app');
app.use('/', routes);

// Start the server
const PORT = 3000; // You can change this port number if needed
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
