const cloudinary = require("cloudinary").v2;
//// multer helps with parsing multipart/form-data ,,, multer-storage-cloudinary helps us to store this data to cloudinary
const {CloudinaryStorage} = require("multer-storage-cloudinary"); 

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_KEY,
    api_secret:process.env.CLOUDINARY_SECRET
});

////setting up an instance of cloudinary and then exporting it
const storage = new CloudinaryStorage({

    cloudinary, //cloudinary node package that was required above
    params:{ //for cloudinary
        folder:"YelpCamp", 
        allowedFormats: ["jpeg","png","jpg"]
    }

});

module.exports = {
    cloudinary,
    storage
}
