const mongoose = require("mongoose");
const initData = require("./data");
const Listing = require("../models/listing");

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wonderlust");
  console.log("database connected");
}

const initDB = async () => {
  await Listing.deleteMany({});
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

main()
  .then(initDB)
  .catch(err => console.log(err));

