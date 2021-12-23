const express=require('express');
const {reviewSchema}=require('../schemas.js');
const catchAsync = require("../utils/catchAsync.js");
const ExpressError=require('../utils/ExpressError.js');
const methodOverride = require("method-override");
const Campground = require("../models/campground");
const Review=require('../models/review');
const router=express.Router({mergeParams:true});


const validateReview=(req,res,next)=>{
    const {error}=reviewSchema.validate(req.body);
    if (error) {
         const msg = error.details.map(el => el.message).join(',')
          throw new ExpressError(msg, 400)
             } 
      else   {
          next();
           }
}


router.post("/review",async(req,res)=>{
    const {id}=req.params;
    const campground=await Campground.findById(id);
    const review=new Review(req.body.review);
   
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${id}`);
  })
  
  
  
  router.delete("/reviews/:reviewId",async(req,res)=>{
  
    const {id,reviewId}=req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
      
  })

  module.exports=router;




