const express = require("express");
const router = express.Router();

//requiring mongoose model "Campground"
const Campground = require("../models/campground") // . current directory reference

////requiring catchAsync - utility method to help in ASYNC method error handling
const catchAsync = require("../utils/catchAsync");

////require  middleware 
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

////requiring the CONTROLLER campground !!!!
const campgrounds = require("../controllers/campgrounds");

////setup MULTER. This will be used in middleware to help us to parse multipart/form-data (text and files)
const multer = require("multer");
const {storage} = require("../cloudinary"); //inside cloudinary folder index.js is considered by default by nodejs
// const upload = multer({dest:"uploads/"}); //files will be stored at this path (disk storage in this case)
const upload = multer({storage}); //storing files to cloudinary storage instance

//-------------below are the routes------------

////router.route("path").get(callbackFunctions).post(callbackFunctions) //this is used to chain verbs that have the same path , one after the other...
router.route("/")
    .get(catchAsync(campgrounds.index)) //// GET /campgrounds route to display ALL campgrounds
    .post(isLoggedIn, upload.array("image"), validateCampground, catchAsync(campgrounds.createCampground)); //// create campground POST request // triggered when above form is submitted //when we use multer, upload.array("name") middle ware gives us access to normal-form-fields in req.body and file-form-fields in req.files.


///router.verb("path",callbackFunctions) //this is used to define an individual route, without chaining
router.get("/new", isLoggedIn, campgrounds.renderNewForm);//// form to create campground //isLoggedIn is a custom middleware to check if the user is logged in (by taking help of passport)


router.route("/:id")
    .get(catchAsync(campgrounds.showCampground)) //// display ONE campground details
    .put(isLoggedIn, isAuthor, upload.array("image"), validateCampground, catchAsync(campgrounds.updateCampground)) //// PUT route to update campground after above form is submitted
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground)); ////Deleting a campground

    
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm)); //// FORM to EDIT a campground


module.exports = router;
