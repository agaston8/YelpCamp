const  mongoose = require("mongoose");
const Campground = require('../models/campground');
const cities = require('./cities')
const {places, descriptors} = require('./moreseed')

mongoose.connect('mongodb://localhost:27017/yelpcamp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


const rand = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i=0; i<50; i++) {
        const random1000 = Math.floor(Math.random() *1000);
        const price = Math.floor(Math.random() *20)+10;
        const camp = new Campground({
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            name: `${rand(descriptors)} ${rand(places)}`,
            image: 'http://source.unsplash.com/collection/483251',
            description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Cupiditate, placeat! Repellat eos rem tempore in vitae quasi, iste, assumenda dolorem qui quas quis aliquam consequatur consequuntur ullam voluptate labore mollitia.',
            price
        })
        await camp.save();
    }

}



seedDB().then(()=>{
    mongoose.connection.close();
});


