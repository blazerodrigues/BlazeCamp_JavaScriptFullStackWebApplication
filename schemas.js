////This schemas.js file is for "Joi" schemas

// Joi is use for schema description and data validation
const baseJoi = require("joi");

//requiring sanitize-html for creating below extension to be used with base Joi
const sanitizeHtml = require("sanitize-html");

////we are using sanitize-html node package to strip the input of any HTML. This is to prevent a type of cross site scripting
const extension = (baseJoi) => ({
    type:"string",
    base: baseJoi.string(),
    messages:{
        "string.escapeHTML": "{{#label}} must not include HTML!"
    },
    rules:{
        escapeHTML:{
            validate(value,helpers){
                const clean = sanitizeHtml(value,{ //using sanitize-html here
                    allowedTags:[],
                    allowedAttributes:{},
                });
                if(clean!==value) return helpers.error("string.escapeHTML",{value})
                return clean;
            }
        }
    }
});

const Joi = baseJoi.extend(extension);


module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),

    deleteImages: Joi.array() //used in edit campground form, array of images to be deleted. It will have array of image-paths that are to be deleted.
})



module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
})

