const mongoose = require('mongoose');

// Define the listing schema
const listingSchema = new mongoose.Schema({
    image: { type: String, required: true },  // Store Base64 encoded image data
    title: { type: String, required: true },
    description: { type: String, required: true },
    bids: { type: [Number], default: [] }, // Array of bid values (integers)
    minBidValue: { type: Number, required: true }
});

// Define the user schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    listings: { type: [listingSchema], default: [] }  // Array of listings
});

// Create and export the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
