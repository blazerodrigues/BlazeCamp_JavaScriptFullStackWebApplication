////users.js will have the routes for users registration, authentication etc

////requiring express
const express = require("express");
////setup router
const router = express.Router();
////require User model
const User = require("../models/user");
////require custom error handler catchAsync
const catchAsync = require("../utils/catchAsync");
////require passport for authentication
const passport = require("passport");
////require USERS CONTROLLER!!
const users = require("../controllers/users");

//-------------below are the routes------------

////router.route("path").get(callbackFunctions).post(callbackFunctions) //this is used to chain verbs that have the same path , one after the other...
router.route("/register")
    .get(users.renderRegister) ////render the register form
    .post(catchAsync(users.userRegister)); ////above form will submit to the below POST /register route


router.route("/login")
    .get(users.renderLogin) //// display the login form
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login); ////  /login POST route , after above form is submitted ////passport.authenticate("strategy", {options}) ... this is a passport middleware-function which is doing the authentication+login


///router.verb("path",callbackFunctions) //this is used to define an individual route, without chaining
router.get("/logout", users.logout); //// logout route


module.exports = router;
