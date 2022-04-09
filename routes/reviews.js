const express = require("express");
// const router = express.Router(); //this will not allow us to access the ID in /campgrounds/:id/reviews ... which is in app.js file. So we have set {mergeparams:true} in the below line of code
const router = express.Router({mergeParams:true});
//requiring mongoose model "Campground"
const Campground = require("../models/campground") // . current directory reference
//requiring mongoose model "Review"
const Review = require("../models/review");
////requiring ExpressError - this is a error helper class - helps to throw errors
const ExpressError = require("../utils/ExpressError");
////requiring catchAsync - utility method to help in ASYNC method error handling
const catchAsync = require("../utils/catchAsync");
////requiring middleware
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware");
////requiring REVIEWS CONTROLLER
const reviews = require("../controllers/reviews");

//-------------below are the routes------------

router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;