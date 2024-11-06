const express = require('express');
const mongoose = require('mongoose'),
      bodyParser = require("body-parser"),
      LocalStrategy = require("passport-local"),
      passportLocalMongoose = 
        require("passport-local-mongoose")

const User = require("./models/User")
const app = express();

const url = "mongodb://localhost:27017";
mongoose.connect(url, { useNewUrlParser: true });
const con = mongoose.connection;

app.use(express.json());

try {
    con.on('open', () => {
        console.log('Connected to the database');
    })
} catch (error) {
    console.log("Error: " + error);
}

const port = 9000;
app.listen(port, () => {
    console.log('Server started on port ' + port);
});