
//requiring mongoose model "Campground"
const Campground = require("../models/campground") // .. going back one directory

////requiring CITIES
const cities = require("./cities");

////requiring SEEDHELPERS exported values - places, descriptors
 const {places, descriptors} = require('./seedHelpers');

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/yelp-camp",{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true
});

//checking mongoose connection
const db = mongoose.connection; //just to reuse and shorten the syntax later
db.on("error", console.error.bind(console,"(mongoose connection) Connection error... "));
db.once("open", ()=>{
    console.log("(mongoose connection) Database connected... ");
})



////This will select random element from an array
const sample = (array) => array[Math.floor(Math.random() * array.length)];


////seeding the database with dummy values
const seedDB = async () => {
    await  Campground.deleteMany({});
    for(let i = 0 ; i<300 ; i++){ //creating 50 campgrounds
        const random1000 = Math.floor(Math.random() * 1000); //there are  1000 cities in the cities array
        const price = Math.floor(Math.random()*20) + 10;

        const camp = new Campground({
            author: '60dc4ccf0d766f21c86f21b3',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            // image: "https://source.unsplash.com/collection/483251",
            images:[
                {
                  url: 'https://res.cloudinary.com/blazerodrigues/image/upload/v1625345312/YelpCamp/r1zxud2qvbxnbhust38i.jpg',
                  filename: 'YelpCamp/ivhbgyijcl6rwzjurzix'
                },
                {
                  url: 'https://res.cloudinary.com/blazerodrigues/image/upload/v1625345301/YelpCamp/waqaogaeooxacnnh9ij8.jpg',
                  filename: 'YelpCamp/f7wrrvrh3dfiv8hdpyls'
                }
              ],
            description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque repellat, recusandae architecto consequatur deserunt rem, fugit illum magni animi facere totam at porro quae cum aliquid ad atque officiis provident?`,
            price: price,
            geometry:{
                type:"Point",
                coordinates:[ 
                    cities[random1000].longitude,
                    cities[random1000].latitude
                 ]
            }
        })
        await camp.save();
    }
}

////async functions implicitly return a promise , which we can .then()
seedDB()
    .then(()=>{
        mongoose.connection.close(); //closes mongoose mongodb connection 
        console.log("Mongoose connection closed...")
    })

