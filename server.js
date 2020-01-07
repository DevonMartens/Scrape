//Dependencis

var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require models
var db = require("./models");

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
app.use(express.static("public"));

// Connect to the Mongo DB

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);



// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get('https://www.sciencenews.org/topic/archaeology').then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Grab header tag
    $(".post-item-river__content___2Ae_0").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
      .children("h3")
        .children("a")
        .text();
      result.link = $(this)
      .children("h3")
        .children("a")
        .attr("href");
        result.summmary = $(this)
        .children("p")
          .text();

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    
    // Send a message to the client
    res.send("Scrape Complete!");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
 
    // Find all results from the scrapedData collection in the db
    db.Article.find()
      // Throw any errors to the console
      .then(function(dbPopulate) {
        // If any Libraries are found, send them to the client with any associated Books
        res.json(dbPopulate);
      })
      .catch(function(err) {
        // If an error occurs, send it back to the client
        res.json(err);
      });
});

// Route for grabbing an Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  
  // Route finds one article using the -> req.params.id,
  // run populate method with "note",
  // respond with the article with the note included
  db.Article.findById(req.params.id)
  .populate("note")
  .then(function(dbPopulate) {
    // send results to client
    res.json(dbPopulate);
  })
  .catch(function(err) {
    // If an error occurs, send it back to the client
    res.json(err);
  });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {

  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update it's "note" property with the _id of the new note
  db.Note.create(req.body)
    .then(function(dbPopulate) {
//indOneAndUpdate() finds the first document that matches a given filter, applies an update, and returns the document. By default, findOneAndUpdate() returns the document as it was before update was applied.
      return db.Article.findOneAndUpdate({_id: req.params.id}, { $push: { note: dbPopulate._id } }, { new: true });
    })
    .then(function(dbPopulate) {
      // If the Library was updated successfully, send it back to the client
      res.json(dbPopulate);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

// Start server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});