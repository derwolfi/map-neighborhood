var express = require('express'),
	yelp = require("node-yelp"),
	mongoose = require('mongoose'),
	app = express(),
	data,
	Neighborhood = require('./model.js');

// Database connection
mongoose.connect('mongodb://localhost/map_neighborhood');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {

	Neighborhood.find(function (err, neighborhood) {
	  if (err) return console.error(err);
	  data = neighborhood;
	});

});

// Yelp Token/Secrets
var client = yelp.createClient({
  oauth: {
    "consumer_key": "cYtQF-S29PYIt7Y6NscvEg",
    "consumer_secret": "1oXAfIhc6F3Gcz2_CKj4xz-GLFo",
    "token": "40m4RBYW2n3JOwEgOISLF1QaVXJFqi9R",
    "token_secret": "eYXnXEbMserM5Ec1XwLv_vSDkGg"
  },

  // Optional settings:
  httpClient: {
    maxSockets: 25  // ~> Default is 10
  }
});

// Development environment
var env = process.env.NODE_ENV || 'development';
if ('development' === env) {
   app.use(express.static('src'));
   app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// Production environment
app.use(express.static('webapp'));
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});



// Server Request for yelp
app.get('/api/:location/:term/', function(req,res) {
	client.search({
	  term: req.params.term,
	  location: req.params.location,
	  limit: 1
	}).then(function (data) {
	  // var businesses = data.businesses;
	  // var location = data.region;
	  res.json(data);
	}).catch(function (err) {
	  if (err.type === yelp.errorTypes.areaTooLarge) {
	    console.log('The areaTooLarge');
	  } else if (err.type === yelp.errorTypes.unavailableForLocation) {
	    console.log('unavailableForLocation');
	  }
	});
});

// Get the Data from the query
app.get('/data', function(req,res) {
	res.json(data);
});

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});



// Listen under localhost:3000
app.listen(3000, function() {
	console.log('Listen on Port 3000');
});