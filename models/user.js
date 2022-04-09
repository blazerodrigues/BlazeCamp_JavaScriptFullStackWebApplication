const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    }
});

//// !!! Plugin passport into the user schema !!!
////passport will add username,password,etc,etc,etc,validations,helper methods  

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);

