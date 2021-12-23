const express=require('express');
const Campground = require("../models/campground");
const catchAsync = require("../utils/catchAsync.js");
const ExpressError=require('../utils/ExpressError.js');
const methodOverride = require("method-override");
const {campgroundSchema}=require('../schemas.js');
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

router.post("/",validateCampground,catchAsync( async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  }));
  
  
  router.get("/new",catchAsync((req, res) => {
    res.render("campgrounds/new");
  }));
  
  
  router.get("/:id/edit",catchAsync( async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    
    res.render("campgrounds/edit", { campground });
    
  }));


  
  
  
  router.put(
    "/:id",validateCampground,
    catchAsync(async (req, res,next) => {
      const { id } = req.params;
      const { campground } = req.body;
    
  
      const Editedcampground = await Campground.findByIdAndUpdate(id, campground);
    
      res.redirect(`/campgrounds/${Editedcampground._id}`);
    })
  );
  
  
  router.get("/:id", catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    res.render("campgrounds/show", { campground });
   
  }));
  
  router.delete("/:id",catchAsync( async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  }));

  module.exports=router;