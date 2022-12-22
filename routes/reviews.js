const express = require('express');
const router = express.Router({mergeParams:true}); //brings forward :id type params bc its in our app.js file
const Review = require('../models/review');
const Campground = require('../models/campground');
const catchAsync = require('../utilities/catchAsync');
const ExpressError = require('../utilities/expressError');
const { reviewSchema } = require('../schemas.js');

const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error) {
        const msg=error.details.map(el=>el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

router.post('/', validateReview, catchAsync( async (req, res) =>{
    const review = new Review(req.body.review);
    const campground = await Campground.findById(req.params.id);
    campground.reviews.push(review);
    console.log(campground, review);
    await review.save();
    await campground.save();
    req.flash('success', "You successfully created a review");
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', "You successfully deleted the review");
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;