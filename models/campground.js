const mongoose = require("mongoose");

const Schema = mongoose.Schema; // !!! just to shorten the later calls to mongoose.Schema

const Review = require("./review");

////creating image schema so that it can be used in the campground schema. This was done to set virtual property on the image schema, so that cloudinary-image-transforamtion-url can be generated.
const ImageSchema = new Schema({
    url:String,
    filename:String
})
//this is how a virtual property is defined on a schema. When we use a virtual property later it is just like accessing any Database stored real property (field/column in sql terms)
ImageSchema.virtual("thumbnail").get(function(){
    
    //before: https://res.cloudinary.com/blazerodrigues/image/upload/v1625345301/YelpCamp/waqaogaeooxacnnh9ij8.jpg
    //after:  https://res.cloudinary.com/blazerodrigues/image/upload/w_200/v1625345301/YelpCamp/waqaogaeooxacnnh9ij8.jpg
    return this.url.replace("/upload","/upload/w_200");

});

////creating mongoose schema
const opts = {toJSON:{virtuals:true}}; //options for js object to json conversion. We want to include virtual properties also in the conversion. This is used in the MAP later.
const CampgroundSchema = new mongoose.Schema({
    title: String,
    images: [ImageSchema], //images will be an array of ImageSchema

    geometry:{ //geoData.body.features[0].geometry //this will store the GEOjson which we get from MAPBOX
        type:{
            type:String,
            enum:["Point"], //this means that type can be "Point" only
            required:true
        },
        coordinates:{
            type:[Number], //Array of numbers storing longitude and latitude
            required:true
        }
    },

    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId, //mongoose id type is given using  Schema.Types.ObjectId
        ref: "User" //ref means that this author id would refer to the User mongoose model //kinda like sql join
    },

    reviews: [
        { type: Schema.Types.ObjectId, ref: "Review" }
    ]
},opts);

////creating a virtual property on campground schema so that it can be used later with MAPBOX for /campgrounds index page cluster map. Campground (location) marker when clicked will display this popup.
//the name properties.popUpMarkup is used for NESTED properties campground->properties->popUpMarkup 
CampgroundSchema.virtual("properties.popUpMarkup").get(function(){
    return `<a href="/campgrounds/${this._id}">${this.title}</a>
            <p>${this.description.substring(0,20)}...`;
});

////mongooose-middleware //we are using it here to implement cascading delete. When a campground is deleted , all it's reviews should also get deleted from the database.
CampgroundSchema.post("findOneAndDelete", async function (deletedCampground) {
    // console.log(deletedCampground);

    if (deletedCampground) { //if deletedCampground is truthy
        await Review.deleteMany({ //remove the review from reviews mongoose-collection
            _id: { //this is the review id
                $in: deletedCampground.reviews // IN ... deleted campground's reviews ARRAY
            }
        })
    }

})


////creating mongoose model
const CampgroundModel = mongoose.model("Campground", CampgroundSchema);

////exporting 
module.exports = CampgroundModel;

