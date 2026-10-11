const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const listingRoutes = require("./routes/listing");
const reviewRoutes = require("./routes/review");

const app = express();

// Basic server configuration
const PORT = process.env.PORT || 5050;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/wonderlust";

// Configure the template engine and views folder
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// Middleware setup for form handling, overrides, and static assets
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB when the application starts
async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("database connected");
}

main().catch((err) => console.log(err));

app.use("/", listingRoutes);
app.use("/", reviewRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).render("error.ejs", { error: "Page not found." });
});
// Central error handler for runtime issues
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.statusCode || 500)
    .render("error.ejs", { error: err.message || "Something went wrong." });
});

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
