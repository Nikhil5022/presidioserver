const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    properties: {
        type:Array,
        default: []
    }
});


const PropertySchema = new mongoose.Schema({
    place: {
        type: String,
        required: true
    },
    area: {
        type: Number,
        required: true
    },
    bedrooms: {
        type: Number,
        required: true
    },
    bathrooms: {
        type: Number,
        required: true
    },
    hospitals: {
        type: String
    },
    colleges: {
        type: String
    },
    parking: {
        type: String,
        enum: ['Yes', 'No'],
        default: 'No'
    },
    propertyType: {
        type: String,
        enum: ['Apartment', 'House', 'Villa'],
        required: true
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    yearBuilt: {
        type: Number
    },
    totalFloors: {
        type: Number
    },
    amenities: {
        type: [String],
        enum: ['Gym', 'Pool', 'Playground']
    },
    furnishedStatus: {
        type: String,
        enum: ['Furnished', 'Unfurnished', 'Semi-Furnished']
    },
    seller:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true

    },
    likes: {
        type: Number,
        default: 0
    },
});

const Property = mongoose.model('Property', PropertySchema);



const User = mongoose.model('User', userSchema);

module.exports = { User, Property };
