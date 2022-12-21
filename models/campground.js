const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    name: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
});

//this is query middleware
//can do pre/post middleware
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            id: {
                $in:doc.reviews
            }
        });
    }
});

//this compiles and exports the schema
module.exports = mongoose.model('Campground', CampgroundSchema);

