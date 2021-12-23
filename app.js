const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const Campground = require("./models/campground");
const ejsMate = require("ejs-mate");
const catchAsync = require("./utils/catchAsync.js");
const ExpressError=require('./utils/ExpressError.js');
const {campgroundSchema}=require('./schemas.js');
const Review=require('./models/review');

const app = express();





mongoose
  .connect("mongodb://localhost:27017/yelp-camp")
  .then(() => {
    console.log("connection established");
  })
  .catch((err) => {
    console.log("ohh no error");
    console.log(err);
  });

app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    //console.log('*******************')
    //console.dir(error.details) 
    
    const msg = error.details.map(el => el.message).join(',')
      throw new ExpressError(msg, 400)
  } else {
      next();
  }
}

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/campgrounds",catchAsync(async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
}));


app.post("/campgrounds",validateCampground,catchAsync( async (req, res) => {
  const campground = new Campground(req.body.campground);
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
}));


app.get("/campgrounds/new",catchAsync((req, res) => {
  res.render("campgrounds/new");
}));


app.get("/campgrounds/:id/edit",catchAsync( async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  //res.send("we got your request");
  res.render("campgrounds/edit", { campground });
  // res.send(campground);
}));



app.put(
  "/campgrounds/:id",validateCampground,
  catchAsync(async (req, res,next) => {
    const { id } = req.params;
    const { campground } = req.body;
    //res.send(campground);

    const Editedcampground = await Campground.findByIdAndUpdate(id, campground);
    //console.log("we got the request");
    // res.redirect(`campgrounds/${Editedcampground._id}`);
    res.redirect(`/campgrounds/${Editedcampground._id}`);
  })
);


app.get("/campgrounds/:id", catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id).populate('reviews');
  res.render("campgrounds/show", { campground });
  //res.send(campground)
  // console.log('we got the request');
}));

app.post("/campgrounds/:id/review",async(req,res)=>{
  const {id}=req.params;
  const campground=await Campground.findById(id);
  const review=new Review(req.body.review);
 //const abs={...req.body.review}
 //console.log(abs);
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  res.redirect(`/campgrounds/${id}`);
})

app.delete("/campgrounds/:id",catchAsync( async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect("/campgrounds");
}));

app.delete("/campgrounds/:id/reviews/:reviewId",async(req,res)=>{

  const {id,reviewId}=req.params;
  await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/campgrounds/${id}`);
    
})

app.all('*', ( req, res, next) => {
    

    next(new ExpressError('page not found',404));


});

app.use((err,req,res,next)=>{
      const {statusCode=500}=err;
      if(!err.message){err.message='oh , no something went wrong' ;};
      res.status(statusCode).render('error',{err});

})

app.listen(3000, () => {
  console.log("listening on port 3000");
});
