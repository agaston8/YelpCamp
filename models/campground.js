const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    name: String,
    image: String,
    price: Number,
    description: String,
    location: String
})

//this compiles and exports the schema
module.exports = mongoose.model('Campground', CampgroundSchema);

