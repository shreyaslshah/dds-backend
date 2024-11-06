const mongoose = require('mongoose');

const listingsSubSchema = new mongoose.Schema({
   listingId: {
        type: String,
        required: true,
        default: () => nanoid(7),
        index: {unique: true},
   }, 
   image: {
        data: Buffer,
        contentType: String,
   },
   title: {
        type: String,
        required: true,
   },
   description: {
        type: String,
        required: true,
   },
   minBid: {
        type: Number,
        required: true,
   },
   bids: {
        type: [Number],
        required: true,
   },
});


const userSchemaWithListings = mongoose.Schema({
    id: {
        type: String,
        required: true,
        default: () => nanoid(7),
        index: {unique: true},
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    listings: {
        type: [listingsSubSchema],
        required: true,
        unique: true,
    },
});

var userWithListingsData = mongoose.model('userModel', userSchemaWithListings);
module.exports = userWithListingsData;