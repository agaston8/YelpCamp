const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground')

mongoose.connect('mongodb://localhost:27017/yelpcamp', {useNewUrlParser: true, useUnifiedTopology:true})
.then(()=>{
    console.log("Mongo connection open")
})
.catch(err => {
    console.log("OH NO Mongo connection error");
    console.log(err)
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/makecampground', async (req, res) => {
    const camp = new Campground({name:"The Backyard"});
    await camp.save();
    res.send(camp)
})

app.get('/', (req, res) => {
    res.render('home')
})

app.listen(3000, ()=> {
    console.log("Serving on Port 3000")
})