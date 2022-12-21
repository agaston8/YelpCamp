const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utilities/catchAsync');
const ExpressError = require('./utilities/expressError');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const Review =require('./models/review');

mongoose.connect('mongodb://localhost:27017/yelpcamp', {useNewUrlParser: true, useUnifiedTopology:true})
    .then(()=>{
        console.log("Mongo connection open");
    })
    .catch(err => {
        console.log("OH NO Mongo connection error");
        console.log(err);
    });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error) {
        const msg=error.details.map(el=>el.message).join(',');
        throw newExpressError(msg, 400);
    } else {
        next();
    }
}

app.get('/campgrounds', catchAsync( async (req, res) => {    
   const campgrounds = await Campground.find({});
   res.render('./campgrounds/index', {campgrounds});
}));

app.get('/campgrounds/new', (req, res) => {
    res.render('./campgrounds/new');
});

app.post('/campgrounds', validateCampground, catchAsync( async(req, res) =>{
    // if(!req.body.campground) throw new ExpressError('Invalid campground data', 500)
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.get('/campgrounds/:id', catchAsync( async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('./campgrounds/show', {campground});
}));

app.get('/campgrounds/:id/edit',  catchAsync( async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('./campgrounds/edit', {campground});
}));

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const {id} = req.params;
     const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
     res.redirect(`/campgrounds/${id}`);
}));

app.delete('/campgrounds/:id', catchAsync( async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    //is deleting reviews off campground via middleware
    res.redirect(`/campgrounds`);
}));

app.post('/campgrounds/:id/review', validateReview, catchAsync( async (req, res) =>{
    const review = new Review(req.body.review);
    const campground = await Campground.findById(req.params.id);
    campground.reviews.push(review);
    console.log(campground, review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

app.all('*', (req, res, next) =>{
    next(new ExpressError('Page not found', 404));
})

app.use((err, req, res, next) => {
    const{statusCode =500, message="Something went wrong"}=err;
    res.status(statusCode).render('error', {err});
})

app.listen(3000, ()=> {
    console.log("Serving on Port 3000");
})