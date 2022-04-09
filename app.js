////env file for keeping credentials secret
if(process.env.NODE_ENV != "production"){ //for production, things are different
    require("dotenv").config();
}
// console.log(process.env.KEYNAME) //process.secret.KEYNAME will gives us the value against the key

////setting up express!!!!!!!!!!!!!!!!!!!!!!!
const express = require("express");
const app = express();

////setting up HELMET node package. This is for security. Helmet sets various HTTP headers to provide security.
const helmet = require("helmet");
app.use(helmet()); //this triggers 10+ different middleware. Read docs.
// app.use(helmet({
//     contentSecurityPolicy: false //turing off contentSecurityPolicy
// }));
////configuring content security policy for HELMET. Basically we are whitelisting the URLs
const scriptSrcUrls = [ ////array of script urls to be whitelisted
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [ ////array of style urls to be whitelisted
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/"
];
const connectSrcUrls = [ ////array of connect urls to be whitelisted
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = []; ////array of font urls to be whitelisted
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/blazerodrigues/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



////deploying application on port 8080
const port1 = process.env.PORT||8080;
app.listen(port1, () => {
    console.log(`Serving on PORT ${port1}`);
})

////using express-mongo-sanitize to prevent mongo injection attacks. It removes/replaces problematic characters from req.params, req.body, req.query
const mongoSanitize = require("express-mongo-sanitize");
app.use(mongoSanitize({
    replaceWith:"_____"
}));

////mongoose connection
const mongoose = require("mongoose");
const mongoAtlasDbUrl = process.env.DB_URL; //connecting to mongo using mongo atlas cloud DB
const mongoLocalDbUrl = "mongodb://localhost:27017/yelp-camp"; //this is how we connected to the local instance of mongo

const dbUrl= mongoAtlasDbUrl || mongoLocalDbUrl;
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify:false
});


//checking mongoose connection
const db = mongoose.connection; //just to reuse and shorten the syntax later
db.on("error", console.error.bind(console, "(mongoose connection) Connection error... "));
db.once("open", () => {
    console.log("(mongoose connection) Database connected... ");
})


const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
//// ejs-mate helps with ejs. 
const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);

////serving static assets in the public directory 
app.use(express.static(path.join(__dirname,"public"))); 

const methodOverride = require("method-override");
app.use(methodOverride("_method"));

////express middleware - to parse req.body of POST requests
app.use(express.urlencoded({ extended: true }));

//requiring mongoose model "Campground"
const Campground = require("./models/campground") // . current directory reference
//requiring mongoose model "Review"
const Review = require("./models/review");

////requiring ExpressError - this is a error helper class - helps to throw errors
const ExpressError = require("./utils/ExpressError");

////requring express-session
const session = require("express-session");
//setting up session storage in mongo using connect-mongo node package. //sessions are stored in the database and expired sessions are also removed from the database automatically after (i think 14) days
//Otherwise by default session is stored in-memory.
const MongoDBStore = require("connect-mongo")(session); //this is for connect mongo onnect-mongo@3.2.0, for 4.x.x versions syntax is a bit different.
//we are using mongo as our session-store here. 
const secret = process.env.SECRET || "thisshouldbeabettersecret!";
const store = new MongoDBStore({
    url:dbUrl,
    secret:secret,
    touchAfter:24*60*60 //When user refreshes the page, If the user has not made any changes affecting the session and the session is the same THEN the session will not be updated in mongo session store before this time period lapses... this value has to be specified in seconds. 24*60*60 is 24 hours. 
})
store.on("error", function(e){
    console.log("Session Store Error",e);
})
const sessionConfig = {
    store:store, //passing in the mongo session storage definition here. If not passed, then the session is store in-memory.
    name:"someOtherName", //giving the session some other name for security reasons. Default session cookie name is connect.sid
    secret:secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true, //helps to protect against cross site scripting attempting to steal the session cookie
        // secure:true, //we can use session cookies only over https, not http. //this breaks thing in tomcat as localhost is over http. We will use this in production.
        expires:Date.now() + 1000*60*60*24*7,
        maxAge:1000*60*60*24*7 //this value is in milliseconds. Time to live, kinda.
    }
}
app.use(session(sessionConfig));


////integrating passport with the application for authentication
const passport = require("passport");
const LocalStrategy = require("passport-local");
//passport-local-mongoose - that will be used in the User model js file
app.use(passport.initialize());
app.use(passport.session()); //this is required for persistent login sessions //so that user does not have to login for every request // this code should be after MAIN session configuration (express-session configuration)
const User = require("./models/user");
passport.use(new LocalStrategy(User.authenticate())); //authenticate method is added to the User schema by passport-local-mongoose //this does the user authentication
passport.serializeUser(User.serializeUser()); //stores user in a session
passport.deserializeUser(User.deserializeUser()); //removes user from a session


////requiring connect-flash for flash messages
const flash = require('connect-flash');
app.use(flash());
////middleware for passing certainVALUES to EVERY EJS (think of it as globally available)
app.use((req,res,next)=>{
    // console.log(req.query); //checking for mongo injection

    // console.log(req.session); //printing the session to check if we are able to remember the original url in the session object
    res.locals.currentUser = req.user; //we can get the user information using req.user - (passport makes this possible)
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})



////authenticatin fake method
app.get("/fakeUser", async(req,res)=>{
    const user = new User({
        email:"blzzz@gmail.com",
        username:"blzzz"
    })
    ////using below passport method UserModel.register(userInstance,passwordString)
    const newUser = await User.register(user,"chicken");

    res.send(newUser);
})

////requiring routes/users.js for routing
const userRoutes = require("./routes/users");
app.use("/", userRoutes);   
////requiring routes/campgrounds.js for routing
const campgroundRoutes = require("./routes/campgrounds");
app.use("/campgrounds", campgroundRoutes);
////requiring routes/reviews.js for routing
const reviewRoutes = require("./routes/reviews");
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
    // res.send("Hello from BlazeCamp!");
    res.render("home");
})


////app.all() executes for ALL requests. At this location in the code, it will only execute if none of the above routes are executed.
//// "*" means for all routes
app.all("*", (req,res,next)=>{
    next(new ExpressError("Page Not Found", 404)); //effectively, if the request route does not exist, this code will be executed.
})

////error handler middleware - has method signature (err,req,res,next)
app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message){
        err.message = "Oh no, something went wrong"
    }
    res.status(statusCode).render("error",{err}); //sending this back to the client via EJS

     // res.status(statusCode).send(message); //sending a response back to the client
})
