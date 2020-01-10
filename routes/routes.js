const app = require('express').Router();

var db = require("../models");

var cheerio = require('cheerio');

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
        result.summary = $(this)
          .children('p')
          .text();
          console.log('summary goes here: '+ result.summary)
        // Create a new Article using the `result` object built from scraping
        db.Article.create(result)
          .then(function(dbArticle) {
            // View the added result in the console
            console.log(dbArticle + 'line 74');
          })
          .catch(function(err) {
            // If an error occurred, log it
            console.log('line 77: ' + err);
          });
      }
      );
      // Send a message to the client
      res.send("Scrape Complete!");
    });
  });
  // Route for getting all Articles from the db
  app.get("/articles", function(req, res) {
    console.log()
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

  module.exports = app