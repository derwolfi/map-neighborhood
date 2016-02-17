var express = require('express'),
	yelp = require("node-yelp"),
	mongoose = require('mongoose'),
	app = express(),
	data = require('./seeds/neighborhood.json'),
	Neighborhood = require('./model.js');

// Database connection
mongoose.connect('mongodb://localhost/map_neighborhood');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {

	// Remove the Neigborhood Collection
	Neighborhood.db.db.dropCollection('neighborhood', function(err, result) {
		console.log('Old Data removed.');
	});
	// Insert New Data in the Neighborhood Collection
	Neighborhood.insertMany(data, function(err,docs) {
		console.log('Seeds inserted.');
		db.close();
	});


});

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

// Get the Data from the query
app.get(data, function(req,res) {
	console.log(res);
	res.json(data);
});

// catch 404 and forwarding to error handler
app.use(function(req, res) {
    res.status(404).end('Not Found');
});
