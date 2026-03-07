const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,

  image: {
    filename: String,
    url: {
      type: String,
      default:
        "https://metropolitan.realestate/wp-content/uploads/2023/05/fairway-villas-06.jpg"
    }
  },

  price: Number,
  location: String,
  country: String
});

module.exports = mongoose.model("Listing", listingSchema);

