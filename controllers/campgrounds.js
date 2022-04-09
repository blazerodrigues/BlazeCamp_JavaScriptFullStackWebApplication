////This file will have the CAMPGROUND CONTROLLER ! (MVC architecture)

//requiring mongoose model "Campground"
const Campground = require("../models/campground") // . current directory reference

///requiring cloudinary from another file
const {cloudinary} = require("../cloudinary");

////setting up MAPBOX
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding"); //requiring mapbox
const mapBoxToken = process.env.MAPBOX_TOKEN; //this picks the mapbox token defined in the .env file (kinda like .properties file)
const geocoder = mbxGeocoding({accessToken:mapBoxToken});



module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
}

module.exports.renderNewForm = (req, res) => {

    res.render("campgrounds/new");
}

module.exports.createCampground = async (req, res, next) => {   ////validateCampground is a middleware method to validate the campground schema. Middleware methods are passed inside the method() as demonstrated here.             ////ASYNC method error handling requires the 'next' parameter to be passed to the method
    // try {
    // if(!req.body.campground){
    //     throw new ExpressError("Invalid campground data", 400);
    // }

    ////using MAPBOX , forward geocoding
    const geoData = await geocoder.forwardGeocode({
        query:req.body.campground.location,
        limit:1 //this limits the number of suggestions
    }).send();
    // console.log(geoData.body.features[0].geometry);

    ////using JOI for schema description and data validation. This happens before data reaches mongoose. We would expect data from the request to be in this format. 
    const campground = new Campground(req.body.campground); //when we use multer, upload.array("name") middle ware gives us access to normal-form-fields in req.body and file-form-fields in req.files.
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f=>({url:f.path,filename:f.filename})); //.map will call the function for every array element, here every file object in req.files .. here reasult will be array with objects{url, filename} for each file object present in original req.files array.
    campground.author = req.user._id; //adding authorid to the campground instance before saving it in the database. passport makes req.user._id available to us

    await campground.save();
    console.log("Campground is saved", campground);

    ////using flash message just before redirecting
    req.flash("success", "Successfully made a new campground!");

    res.redirect(`/campgrounds/${campground._id}`);
    // } 
    // catch (e) {
    //     next(e); // in ASYNC functions, the error has to be passed inside next ... next(e) so that express error handling middleware can be invoked to handle this.
    // }

}

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
        .populate({ //nested-populate - here we are populating reviews from campgrounds and then then populating the review-author ////populate joins and fetches these fields 
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate("author"); //this populate is to fetch campground-author

    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }

    res.render("campgrounds/show", { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }

    res.render("campgrounds/edit", { campground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    // console.log(req.body);

    //updating the campground
    const campgroundObj = { ...req.body.campground }; //destructuring campground object
    const campground = await Campground.findByIdAndUpdate(id, campgroundObj); // passing id and the new campground object
    const imgs = req.files.map(f=>({url:f.path, filename:f.filename})); //this gives us an array of imgs objects
    campground.images.push(...imgs); // we destructure imgs array to push individual array objects on the ALREADY EXISTING ARRAY OF IMAGES IN THE DATABASE.
    await campground.save(); //saving again , so that the images that are added in here get saved to the database.
    if(req.body.deleteImages){//if there are any elements present in the deleteImages array
        
        for(let filename of req.body.deleteImages){ //deleteImages array is submitted by the edit form and is put in req.body by multer
            await cloudinary.uploader.destroy(filename); //this deletes the image from cloudinary server, on basis of file name that is passed
        }
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}}); //this is used to pull (remove) images where filename in deleteImages array.
    }

    req.flash("success", "Successfully updated campground!");
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);

    req.flash("success", "Successfully deleted campground!");
    res.redirect("/campgrounds");
}
