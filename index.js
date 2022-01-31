const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const passport = require('passport');

//bring all routes
const auth = require("./routes/api/auth");
const profile = require("./routes/api/profile");
const questions = require("./routes/api/questions");


const app = express();

//middleware for bodyparser
app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

//mongoDB configuration
const db = require('./setup/myurl').mongoURL;

//connect to database
mongoose
    .connect(db)
    .then(() => console.log('Database connected successfully') )
    .catch(err => console.log(err));


//Passport middleware
app.use(passport.initialize());

//config for JWT strategy
require("./strategies/jsonwtStrategy")(passport)

//route
//just for testing
app.get('/', (req,res) => {
    res.send('Hey there Big stack');
});

//actual routes
app.use("/api/auth", auth);
app.use("/api/profile", profile);
app.use("/api/questions", questions);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`App is running at ${port}`));
