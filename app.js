var express = require('express'),
	yelp = require("node-yelp");

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


var app = express();

// Sourcen from the Webapp.
app.use(express.static('webapp'));

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



// Listen under localhost:3000
app.listen(3000, function() {
	console.log('Listen on Port 3000');
});