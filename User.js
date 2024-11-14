const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the listing schema
const listingSchema = new mongoose.Schema({
    image: { type: String, required: true },  // Store Base64 encoded image data
    title: { type: String, required: true },
    description: { type: String, required: true },
    bids: { type: [Number], default: [] }, // Array of bid values (integers)
    minBidValue: { type: Number, required: true }
});

// Define the user schema with password field
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },  // Added password field
    listings: { type: [listingSchema], default: [] }  // Array of listings
});

// Pre-save middleware to hash password before saving
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Method to compare password during login
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Create and export the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
