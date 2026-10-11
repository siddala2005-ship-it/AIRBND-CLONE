const express = require("express");
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");

const router = express.Router();
const DEFAULT_IMAGE_URL =
  "https://metropolitan.realestate/wp-content/uploads/2023/05/fairway-villas-06.jpg";

// Convert the form's price to a number; null signals invalid input.
function normalizePrice(value) {
  if (value === undefined || value === null || value === "") {
    return 0;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

// Accept either the nested "Listing" form shape or a direct listing object.
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

// Keep form values separate from database values so invalid forms can be
// re-rendered while valid values are ready to save.
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

// Landing page redirects to the listings index.
router.get("/", (req, res) => {
  res.redirect("/listings");
});

// List all listings, newest first.
router.get("/listings", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({}).sort({ _id: -1 });
  res.render("index.ejs", { allListings });
}));

// Show the form used to create a listing.
router.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs", { listingData: {}, error: null });
});

// Validate and save a new listing, returning form data with any errors.
router.post("/listings", wrapAsync(async (req, res) => {
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

// Show one listing and load its reviews for the detail page.
router.get("/listings/:id", async (req, res) => {
  const { id } = req.params;
  const list = await Listing.findById(id).populate("reviews");

  if (!list) {
    return res.status(404).send("Listing not found.");
  }

  res.render("listings/show.ejs", { list });
});

// Show the edit form for an existing listing.
router.get("/listings/:id/edit", async (req, res) => {
  const { id } = req.params;
  const list = await Listing.findById(id);

  if (!list) {
    return res.status(404).send("Listing not found.");
  }

  res.render("listings/edit.ejs", { list, error: null });
});

// Update a listing and preserve submitted values if validation or saving fails.
router.put("/listings/:id", wrapAsync(async (req, res) => {
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
  }

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

// Legacy delete link: retain support for existing links that use GET.
router.get("/listings/:id/delete", wrapAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
}));

// Delete a listing using the method-override DELETE form.
router.delete("/listings/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
}));

module.exports = router;