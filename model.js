// The Neigborhood model

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var neighborhoodSchema = new Schema({
    city: String,
		latitude: Number,
		longitude: Number,
		locations: [{
			name: String,
			latitude: Number,
			longitude: Number,
			img: String,
			pin: String
		}]
	}, { collection: 'neighborhood' }
);

module.exports = mongoose.model('Neighborhood', neighborhoodSchema);