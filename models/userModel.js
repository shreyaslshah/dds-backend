import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

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
    password: {
        type: String,
        required: true,
    },
    listings: {
        type: [listingsSubSchema],
        required: true,
        unique: true,
        default: [],
    },
});

var User = mongoose.model('User', userSchemaWithListings);
export default User;