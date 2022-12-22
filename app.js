const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utilities/expressError');
const session = require('express-session');
const flash = require('connect-flash');

const reviewsRoutes = require('./routes/reviews')
const campgroundsRoute = require('./routes/campgrounds')

mongoose.connect('mongodb://localhost:27017/yelpcamp', {useNewUrlParser: true, useUnifiedTopology:true })
    .then(()=>{
        console.log("Mongo connection open");
    })
    .catch(err => {
        console.log("OH NO Mongo connection error");
        console.log(err);
    });

    app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public'))); //why do we do it like htis again?
app.use(flash());
const sessionConfig = {
    name: 'session',
    secret:'thisshouldbeasecret',
    resave:false,
    saveUninitialized:true,
    cookie: {
        expires: Date.now() + 1000*60*60*24*7, //does it it ms
        maxAge: 1000*60*60*24*7,
        httpOnly:true, //layer of security
    },
}
app.use(session(sessionConfig));

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use('/campgrounds', campgroundsRoute);
app.use('/campgrounds/:id/review', reviewsRoutes);

app.all('*', (req, res, next) =>{
    next(new ExpressError('Page not found', 404));
});

app.use((err, req, res, next) => {
    const{statusCode =500, message="Something went wrong"}=err;
    res.status(statusCode).render('error', {err});
});

app.listen(3000, ()=> {
    console.log("Serving on Port 3000");
});