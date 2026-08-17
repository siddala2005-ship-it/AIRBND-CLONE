const mongoose = require("mongoose");

// Define the structure of a listing document stored in MongoDB
const listingSchema = new mongoose.Schema({
  // Main title shown on the listing card and detail page
  title: {
    type: String,
    required: true,
  },

  // Longer description of the property or experience
  description: String,

  // Image details for the listing preview and detail page
  image: {
    filename: String,
    url: {
      type: String,
      default:
        "https://metropolitan.realestate/wp-content/uploads/2023/05/fairway-villas-06.jpg",
    },
  },

  // Price of the listing, with a minimum of zero
  price: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },

  // Location and country for easier searching and display
  location: String,
  country: String,
});

// Create and export the Listing model for use in routes and controllers
module.exports = mongoose.model("Listing", listingSchema);

