
//------------users---------------
//// middleware to check if the user is logged in or not 
module.exports.isLoggedIn = (req,res,next) => {
    
    ////remembering the originalUrl to which the user was headed to before being asked to login-first
    req.session.returnTo = req.originalUrl; //we are storing the originalUrl found on the request object , onto a parameter we create on the session

    if(!req.isAuthenticated()){ // passport puts the isAuthenticate() methdd in the request object
        req.flash("error", "You must be signed in first!");
        return res.redirect("/login");
    }
    next();
}

//-------------campgrounds-------------

////requiring ExpressError - this is a error helper class - helps to throw errors
const ExpressError = require("./utils/ExpressError");
////we are using "joi" in schemas.js // Joi is use for schema description and  data validation
const {campgroundSchema} = require("./schemas.js"); 
////making a middleware method to validate campground schema //middleware methods have a method signature (req,res,next) next is very important here
module.exports.validateCampground = (req,res,next) => {
    const result = campgroundSchema.validate(req.body); //campgroundSchema refers to the JOI campgroundSchema
    const {error} = result;
    if(error){ 
        const msg = error.details.map(element=>element.message).join(", ") // iterates over the map object and returns a string of all values appended to the next one - separated by a comma
        throw new ExpressError(msg,400); //if error occurs, it is thrown and code does not execute further
    } 
    else{
        next(); //otherwise next() is colled to continue normal code execution
    }
}

//requiring mongoose model "Campground"
const Campground = require("./models/campground") 
////middleware function for campground author  -  Authorization
module.exports.isAuthor = async (req,res,next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id); //retrieving the campground from the database
    if(!campground.author.equals(req.user._id)){ //if the found campground's author does not match the logged in user's id
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/campgrounds/${id}`);
    }

    next();
}

//-------------reviews-------------

const {reviewSchema} = require("./schemas.js"); ////we are using "joi" in schemas.js // Joi is use for schema description and  data validation
////making a middleware method to validate review schema 
module.exports.validateReview = (req,res,next)=>{
    const result = reviewSchema.validate(req.body);
    const {error} = result;
    // console.log(error);
    if(error){
        const msg = error.details.map(element=>element.message).join(", ");
        throw new ExpressError(msg,400);
    }
    else{
        next();
    }
}

const Review = require("./models/review"); //mongoose model Review
////middleware function for review author  -  Authorization
module.exports.isReviewAuthor = async (req,res,next) => {
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId); //retrieving the campground from the database
    if(!review.author.equals(req.user._id)){ //if the found campground's author does not match the logged in user's id
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/campgrounds/${id}`);
    }

    next();
}