//Dependencisnode
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server

var routes = require('./routes/routes')

// var axios = require("axios");
// var cheerio = require("cheerio");
// // Require models
// var db = require("./models");

//use port 3000
var PORT = process.env.PORT || 3000;
// Initialize Express
var app = express();
// Configure middleware
// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
//url encoded over net/json formal
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app uses public static folder
app.use(express.static("./public"));

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines1";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use('/', routes)
// Start server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});


