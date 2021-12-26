const express=require('express');
const Campground = require("../models/campground");
const catchAsync = require("../utils/catchAsync.js");
const ExpressError=require('../utils/ExpressError.js');
const methodOverride = require("method-override");
const {campgroundSchema}=require('../schemas.js');
const {isLoggedIn}=require('../middleware');
const router=express.Router();

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
      
      
      const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
  }

router.get("/",catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
}))

router.post("/",isLoggedIn,validateCampground,catchAsync( async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success','Successfully made a new campground');
    res.redirect(`/campgrounds/${campground._id}`);
  }));
  
  
  router.get("/new",isLoggedIn,(req, res) => {
     
    res.render("campgrounds/new");
  });
  
  /*
  //getting "cannot set headers after they sent to the client" error
  router.get("/new",isLoggedIn,catchAsync((req, res) => {
     
    res.render("campgrounds/new");
  }));
  
  */ 
  
  router.get("/:id/edit",isLoggedIn,catchAsync( async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground)
    {
      res.flash('error','Cannot find that campground');
      return res.redirect('/campgrounds');
    }
    res.render("campgrounds/edit", { campground });
    
  }));


  
  
  
  router.put(
    "/:id",isLoggedIn,validateCampground,
    catchAsync(async (req, res,next) => {
      const { id } = req.params;
      const { campground } = req.body;
    
  
      const EditedCampground = await Campground.findByIdAndUpdate(id, campground);
     
      req.flash('success','Successfully edited campground');
      res.redirect(`/campgrounds/${EditedCampground._id}`);
    })
  );
  
  
  router.get("/:id", catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    if(!campground)
    {
      req.flash('error','Cannot find that campground');
      return res.redirect('/campgrounds');
    }
    res.render("campgrounds/show", { campground });
   
  }));
  
  router.delete("/:id",isLoggedIn,catchAsync( async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully deleted campground');
    res.redirect("/campgrounds");
  }));

  module.exports=router;