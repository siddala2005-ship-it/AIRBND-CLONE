const express = require("express");
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const wrapAsync = require("./utils/wrapAsync");
const Review = require("./models/reviews");
const Joi = require("joi");
const { listingSchema, reviewSchema } = require("./schema");



const app = express();

// Basic server configuration
const PORT = process.env.PORT || 5050;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/wonderlust";
const DEFAULT_IMAGE_URL =
  "https://metropolitan.realestate/wp-content/uploads/2023/05/fairway-villas-06.jpg";

// Configure the template engine and views folder
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// Middleware setup for form handling, overrides, and static assets
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Convert an incoming price value into a valid number or a safe fallback
function normalizePrice(value) {
  if (value === undefined || value === null || value === "") {
    return 0;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

// Normalize form data so the create/edit routes use the same shape
function extractListingFormData(body = {}) {
  const listingData = body.Listing || body;
  const imageUrl = listingData?.image?.url?.trim();

  return {
    title: listingData?.title?.trim() || "",
    description: listingData?.description?.trim() || "",
    image: {
      url: imageUrl || "",
    },
    price: listingData?.price ?? "",
    location: listingData?.location?.trim() || "",
    country: listingData?.country?.trim() || "",
  };
}

// Build the final payload for creating or updating a listing
function prepareListingPayload(body = {}) {
  const formData = extractListingFormData(body);
  const imageUrl = formData.image?.url?.trim();
  const price = normalizePrice(formData.price);
  const error = price === null ? "Price must be a valid number." : null;

  return {
    formData,
    data: {
      title: formData.title,
      description: formData.description,
      image: {
        url: imageUrl || DEFAULT_IMAGE_URL,
      },
      price: price ?? 0,
      location: formData.location,
      country: formData.country,
    },
    error,
  };
}

// Connect to MongoDB when the application starts
async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("database connected");
}

main().catch((err) => console.log(err));

// Redirect the home page to the listings view
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// Show all listings on the main page
app.get("/listings", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({}).sort({ _id: -1 });
  res.render("index.ejs", { allListings });
}));

// Render the form for creating a new listing
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs", { listingData: {}, error: null });
});

// Create a new listing from the submitted form
app.post("/listings", wrapAsync(async (req, res) => {
  const payload = prepareListingPayload(req.body);

  if (payload.error) {
    return res.status(400).render("listings/new.ejs", {
      listingData: payload.formData,
      error: payload.error,
    });
  }

  try {
    const newListing = new Listing(payload.data);
    await newListing.save();
    res.redirect("/listings");
  } catch (err) {
    console.log(err);
    res.status(400).render("listings/new.ejs", {
      listingData: payload.formData,
      error: err.message,
    });
  }
}));

// Show one listing in detail
app.get("/listings/:id", async (req, res) => {
  const { id } = req.params;
  const list = await Listing.findById(id);

  if (!list) {
    return res.status(404).send("Listing not found.");
  }

  res.render("listings/show.ejs", { list });
});

// Render the edit form for an existing listing
app.get("/listings/:id/edit", async (req, res) => {
  const { id } = req.params;
  const list = await Listing.findById(id);

  if (!list) {
    return res.status(404).send("Listing not found.");
  }

  res.render("listings/edit.ejs", { list, error: null });
});

// Update an existing listing from the edit form
app.put("/listings/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const payload = prepareListingPayload(req.body);

  if (payload.error) {
    const currentListing = await Listing.findById(id);
    return res.status(400).render("listings/edit.ejs", {
      list: currentListing
        ? {
            ...currentListing.toObject(),
            ...payload.formData,
            image: {
              url: payload.formData.image.url || currentListing.image?.url || DEFAULT_IMAGE_URL,
            },
          }
        : null,
      error: payload.error,
    });
  };

  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      payload.data,
      { runValidators: true, new: true }
    );

    if (!updatedListing) {
      return res.status(404).send("Listing not found.");
    }

    res.redirect(`/listings/${id}`);
  } catch (err) {
    const currentListing = await Listing.findById(id);
    res.status(400).render("listings/edit.ejs", {
      list: currentListing
        ? {
            ...currentListing.toObject(),
            ...payload.formData,
            image: {
              url: payload.formData.image.url || currentListing.image?.url || DEFAULT_IMAGE_URL,
            },
          }
        : null,
      error: err.message,
      
    });
  }
}));

// Delete a listing from the database
app.get("/listings/:id/delete", wrapAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
}));

app.delete("/listings/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
}));

//reviews
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
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
