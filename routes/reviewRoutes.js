const express=require('express');
const {reviewSchema}=require('../schemas.js');
const catchAsync = require("../utils/catchAsync.js");
const ExpressError=require('../utils/ExpressError.js');
const methodOverride = require("method-override");
const Campground = require("../models/campground");
const Review=require('../models/review');
const router=express.Router({mergeParams:true});
const {validateReview}=require('../middleware');

router.post("/review",validateReview,catchAsync(async(req,res)=>{
    const {id}=req.params;
    const campground=await Campground.findById(id);
    const review=new Review(req.body.review);
   
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success','Successfully added review');
    res.redirect(`/campgrounds/${id}`);
  }))
  
  
  
  router.delete("/reviews/:reviewId",async(req,res)=>{
  
    const {id,reviewId}=req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully deleted review');
    res.redirect(`/campgrounds/${id}`);
      
  })

  module.exports=router;




