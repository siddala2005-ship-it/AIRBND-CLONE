const express = require("express");
const Listing = require("../models/listing");
const Review = require("../models/reviews");
const wrapAsync = require("../utils/wrapAsync");
const { reviewSchema } = require("../schema");

const router = express.Router();

// Validate review form data before the route saves it.
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  next();
};

// Add a validated review and associate it with the parent listing.
router.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return res.status(404).send("Listing not found.");
  }

  const reviewData = req.body?.review;
  if (!reviewData) {
    return res.status(400).send("Review data is required.");
  }

  const newReview = new Review(reviewData);
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  res.redirect(`/listings/${listing._id}`);
}));

// Remove a review from its listing's reference array.
router.delete("/listings/:listingId/reviews/:reviewId", wrapAsync(async (req, res) => {
  const { listingId, reviewId } = req.params;
  const listing = await Listing.findById(listingId);
  if (!listing) {
    return res.status(404).send("Listing not found.");
  }

  const review = listing.reviews.find(r => r._id.toString() === reviewId);
  if (!review) {
    return res.status(404).send("Review not found.");
  }

  listing.reviews.pull(reviewId);
  await listing.save();
  res.redirect(`/listings/${listing._id}`);
}));

module.exports = router;