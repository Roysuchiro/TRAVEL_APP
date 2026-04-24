// models/Place.js

const mongoose = require("mongoose");

const PlaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  // store relative path like: /images/goa.jpg
  image: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  cuisines: {
    type: [String],
    default: []
  },

  touristSpots: {
    type: [String],
    default: []
  },

  averageCost: {
    type: String,
    required: true
  },

  bestTime: {
    type: String
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("Place", PlaceSchema);