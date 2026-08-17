const mongoose = require("mongoose");
const initData = require("./data");
const Listing = require("../models/listing");

// Connect to the MongoDB database before seeding data
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wonderlust");
  console.log("database connected");
}

// Clear old listings and insert the starter sample data
const initDB = async () => {
  await Listing.deleteMany({});
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

// Run the database connection and initialization process
main()
  .then(initDB)
  .catch((err) => console.log(err));

