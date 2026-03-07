const express = require("express");
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path=require("path");
const ejsMate=require("ejs-mate");
const methodoverride=require("method-override");

const app = express();

//it should always below the all requires
app.engine("ejs",ejsMate);//it should alwaus comes in front of view engine
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));

app.use(methodoverride("_method"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,"/public")));//adding static files to the project


async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wonderlust");
  console.log("database connected");
}
main().then((res)=>{
  console.log(res);
})
.catch(err => console.log(err));

app.get("/",(req,res)=>{
  res.send("the root is created");
});
app.get("/listings", async (req,res)=>{
  let allListings= await Listing.find({});
  res.render("index.ejs",{allListings});
});

app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;

  await Listing.findByIdAndUpdate(
    id,
    req.body.Listing,
    { runValidators: true, new: true }
  );

  res.redirect(`/listings/${id}`);
});

app.get("/listings/new",(req,res)=>{
  res.render("listings/new.ejs");
});

app.post("/listings", async (req, res) => {
  let newListing = new Listing(req.body.Listing);
  await newListing.save();
  res.redirect("/listings");
});


  app.get("/listings/:id/edit",async (req,res)=>{
  let {id}=req.params;
  let list= await Listing.findById(id);
  console.log(list);
  res.render("listings/edit.ejs",{list});
});

app.get("/listings/:id",async (req,res)=>{
  let {id}=req.params;
  console.log(id);
  let list= await Listing.findById(id);
  res.render("listings/show.ejs",{list});
});
app.get("/listings/:id/delete",async (req,res)=>{
  let {id}=req.params;
  let deletedListing=await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
});

 /* await sampleList.save();
  res.send("Listing saved to database");*/


app.listen(5050, () => {
  console.log("server running on port 5050");
});
