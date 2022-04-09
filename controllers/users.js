////require User model
const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
    res.render("users/register");
}

module.exports.userRegister = async (req, res, next) => {
    try {
        const { email, username, password } = req.body; //taking email,username,password from the request body
        const user = new User({ email, username }); //creating new user instance. remember username,password fields are created in the User model by passport-local-mongoose. also notice we do not enter password field's value here. 
        const registeredUser = await User.register(user, password); // using this passport method UserModel.register(userInstance,passwordString)

        ////for good user experience, automatically login user after registration. Passport provides req.login(registeredUser, errorHandlingCallbackFunction)
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err); //leading  to error handling middleware
            }
            req.flash("success", "Welcome to BlazeCamp!");
            res.redirect("/campgrounds");
        })

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/register");
    }
}

module.exports.renderLogin = (req, res) => {

    res.render("users/login");
}

module.exports.login = (req, res) => {
    req.flash("success", "Welcome Back!");

    ////We check to see if we remember where the user was headed to (if he was asked to login-first) using req.session.returnTo |or| if the user is logging in wilfully we redirect him to /campground
    const redirectUrl = req.session.returnTo || '/campgrounds'
    delete req.session.returnTo; //we delete returnTo from the session once done...
    res.redirect(redirectUrl);

}

module.exports.logout =  (req, res) => {
    req.logout(); //passport gives logout() on the request object

    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
}


