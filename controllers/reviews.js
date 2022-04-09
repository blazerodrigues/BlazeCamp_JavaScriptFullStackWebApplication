//requiring mongoose model "Campground"
const Campground = require("../models/campground") // . current directory reference
//requiring mongoose model "Review"
const Review = require("../models/review");


module.exports.createReview = async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    
    const review = new Review(req.body.review);
    review.author = req.user._id;

    campground.reviews.push(review);

    await review.save();
    await campground.save();

    req.flash("success", "Created new review!");
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async(req,res)=>{
    const {id, reviewId} = req.params;
    
    Campground.findByIdAndUpdate(id,{$pull:{reviews: reviewId}}); //deleting from the campgrounds mongo-collection //the $pull operator removes from an existing array all instances of a value(s) that match a specified condition.

    await Review.findByIdAndDelete(req.params.reviewId); //Deleting from the reviews mongo-collection
    
    req.flash("success", "Successfully deleted review!");
    res.redirect(`/campgrounds/${id}`);
}

