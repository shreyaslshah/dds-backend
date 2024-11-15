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

const multer = require('multer');
const path = require('path');

//Below code for posting a new listing
// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Make sure this directory exists
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage: storage });

// Route to post a new listing
router.post('/new-listing', upload.single('image'), async (req, res) => {

    console.log("Request Body:", req.body);
    console.log("Uploaded File:", req.file);
    const { title, description, minBidValue, username } = req.body;
    const image = req.file;

    if (!title || !description || !minBidValue || !username || !image) {
        return res.status(400).send('All fields are required');
    }

    try {
        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Create a new listing
        const newListing = {
            title,
            description,
            minBidValue: parseFloat(minBidValue),
            image: image.path // Store the image path
        };

        // Add the listing to the user's profile and save
        user.listings.push(newListing);
        await user.save();

        res.status(201).json({
            message: 'Listing created successfully',
            data: newListing
        });
    } catch (err) {
        console.error('Error creating listing:', err);
        res.status(500).send('Error creating listing');
    }
});

// Route to get all listings from all users
router.get('/all-listings', async (req, res) => {
    try {
        // Retrieve all users from the database
        const users = await User.find();

        // Extract all listings from all users
        const allListings = users.reduce((acc, user) => {
            return acc.concat(user.listings); // Concatenate each user's listings to the accumulator
        }, []);

        // Return the array of all listings
        res.json(allListings);
    } catch (err) {
        console.error('Error retrieving listings:', err);
        res.status(500).send('Error retrieving listings');
    }
});

// Route to get all listings for a specific user based on their username
router.get('/my-listings', async (req, res) => {
    const { username } = req.query;  // Get username from query parameters

    if (!username) {
        return res.status(400).send('Username is required');
    }

    try {
        // Find the user by their username
        const user = await User.findOne({ username });

        // If no user is found, return an error message
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Return the user's listings
        res.json(user.listings);  // Send the array of listings
    } catch (err) {
        console.error('Error retrieving user listings:', err);
        res.status(500).send('Error retrieving listings');
    }
});

router.delete('/delete-listing', async (req, res) => {
    const { username, listingId } = req.body;  // Get username and listingId from the request body

    if (!username || !listingId) {
        return res.status(400).send('Username and listingId are required');
    }

    try {
        // Find the user by their username
        const user = await User.findOne({ username });

        // If no user is found, return an error
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Find the index of the listing to delete using the MongoDB _id field
        const listingIndex = user.listings.findIndex(listing => listing._id.toString() === listingId);

        // If the listing doesn't exist, return an error
        if (listingIndex === -1) {
            return res.status(404).send('Listing not found');
        }

        // Remove the listing from the listings array
        user.listings.splice(listingIndex, 1);

        // Save the updated user document
        await user.save();

        // Send a success message
        res.send('Listing deleted successfully');
    } catch (err) {
        console.error('Error deleting listing:', err);
        res.status(500).send('Error deleting listing');
    }
});

router.post('/post-bid', async (req, res) => {
    const { username, listingId, bidValue } = req.body;  // Get username, listingId, and bidValue from the request body

    if (!username || !listingId || !bidValue) {
        return res.status(400).send('Username, listingId, and bidValue are required');
    }

    try {
        // Find the user by their username
        const user = await User.findOne({ username });

        // If no user is found, return an error
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Find listing across ALL USERS using listingID
        const userWithListing = await User.findOne({ 'listings._id': listingId });

        if (!userWithListing) {
            return res.status(404).send('Listing not found');
        }

        // Locate the specific listing within that user's listings array
        const listing = userWithListing.listings.id(listingId);

        // If no listing is found, return an error
        if (!listing) {
            return res.status(404).send('Listing not found');
        }

        // Ensure the bidValue is greater than the minimum bid value
        if (bidValue <= listing.minBidValue) {
            return res.status(400).send(`Bid value must be greater than the minimum bid value of ${listing.minBidValue}`);
        }

        // Manually construct the bid as a plain object without Mongoose's _id generation
        const newBid = {
            bidValue: Number(bidValue),
            username: String(username)
        };

        console.log("New bid constructed as plain object:", newBid);

        // Add the bid to the listing's bids array
        listing.bids.push(newBid);

        // Run validation synchronously to catch errors before saving
        const validationError = userWithListing.validateSync();
        if (validationError) {
            console.error('Validation Error:', validationError);
            return res.status(400).send(`Validation Error: ${validationError.message}`);
        }

        // Save the updated user document
        await userWithListing.save();

        // Send a success message
        res.send('Bid placed successfully');
    } catch (err) {
        console.error('Error placing bid:', err);
        res.status(500).send('Error placing bid');
    }
});

router.post('/sell-item', async (req, res) => {
    const { sellerUsername, listingId } = req.body;

    if (!sellerUsername || !listingId) {
        return res.status(400).send('Seller username and listingId are required');
    }

    try {
        // Verify that the seller exists
        const seller = await User.findOne({ username: sellerUsername });
        if (!seller) {
            return res.status(404).send('Seller not found');
        }

        // Find listing under the seller's listings
        const listing = seller.listings.id(listingId);
        if (!listing) {
            return res.status(404).send('Listing not found for this seller');
        }

        // Check if there are bids on the listing
        if (listing.bids.length === 0) {
            return res.status(400).send('No bids available for this listing');
        }

        // find the highest bid
        const highestBid = listing.bids.reduce((max, bid) => (bid.bidValue > max.bidValue ? bid : max), listing.bids[0]);

        // Complete sale transaction
        listing.sold = true; // Add a `sold` flag to indicate the item has been sold
        listing.soldTo = highestBid.username; // Add `soldTo` field to record the buyer's username
        listing.soldPrice = highestBid.bidValue; // Record the final selling price

        // Save the updated seller document
        await seller.save();

        // Step 6: Return a success message with sale details
        res.status(200).json({
            message: 'Item sold successfully',
            listingId: listingId,
            soldTo: highestBid.username,
            soldPrice: highestBid.bidValue
        });
    } catch (err) {
        console.error('Error selling item:', err);
        res.status(500).send('Error selling item');
    }
});


// Export routes
module.exports = router;
