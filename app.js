const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const Campground = require("./models/campground");
const ejsMate = require("ejs-mate");
const catchAsync = require("./utils/catchAsync.js");
const ExpressError=require('./utils/ExpressError.js');
const {campgroundSchema,reviewSchema}=require('./schemas.js');
const Review=require('./models/review');
const session=require('express-session');
const flash=require('connect-flash');
//added while routing
const campgroundRoutes=require('./routes/campgroundRoutes');
const reviewRoutes=require('./routes/reviewRoutes');


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
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname,'public')));

const sessionOptions={
  secret:'notagoodsecret',
   resave:false,
   saveUninitialized:true,
   cookie:{
     httpOnly:true,
     expires:Date.now*(1000*60*60*7*24),
     maxAge:1000*60*60*7*24
   }
  
}
app.use(session(sessionOptions));
app.use(flash());
app.use((req,res,next)=>{
  res.locals.success=req.flash('success');
  res.locals.error=req.flash('error');
  next();
})

app.get("/", (req, res) => {
  res.render("home");
});


app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id',reviewRoutes);


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





