function initMap() {
	'use strict';

	jQuery( document ).ready(function( $ ) {
		var data;

		// Data connection to server
		var jqxhr = $.getJSON( '/data/', function( data ) {

			// The google map
			var map = null;

			// Constructor for a City use: new City(##item##);
			var City = function(data, isActive) {
				this.city = ko.observable(data.city);
				this.longitude = ko.observable(data.longitude);
				this.latitude = ko.observable(data.latitude);
				this.locations = ko.observable(data.locations);
				this.active = ko.observable(isActive);
			};

			// Constructor for a Location.
			var Location = function(data) {
				this.name = data.name;
				this.latitude = data.latitude;
				this.longitude = data.longitude;
				this.pin = data.pin;
				this.marker = new google.maps.Marker({
					name: this.name,
					position: {lat: this.latitude, lng: this.longitude},
					animation: google.maps.Animation.DROP,
					id: this.latitude + this.longitude,
					icon: {
						url: this.pin,
						scaledSize: new google.maps.Size(20, 20)
					}
				});
				// A InfoWindow for a Location.
				this.marker.infowindow = new google.maps.InfoWindow({
					maxWidth: 400,
					content: '<div id="iwContent"><h2>' + this.name + '</h2>' +
							'<div id="detail"></div></div>'
				});

			};

			Location.prototype.stopAnimation = function() {
				this.marker.setAnimation(null);
			};

			/* Shows locations in a City on a google Maps.
			 * The Locations can filterd direktly show on the Map.
			 * Select a city of your choice to see there lokation.
			 * Second Informations a comes from yelp.com
			 */
			var ViewModel = function() {
				var self = this;

				// List of all Cities
				self.cityList = ko.observableArray([]);
				// Fill CityList
				data.forEach(function(item) {
					self.cityList.push( new City(item) );
				});

				// List of all Locations from a city
				self.locationList = ko.observableArray([]);

				// current City filled in with default
				self.currentCity = ko.observable(self.cityList()[0]);

				// setCurrentCity
				self.setCurrentCity = function(city) {
					// remove active
					ko.utils.arrayForEach(self.cityList(), function(item) {
						item.active(false);
					});
					city.active(true); // set active for Highlight.
					self.currentCity(city);
					self.setCityLocations();
				};

				// Set the location for a City
				self.setCityLocations = function() {
					self.locationList.removeAll(); // reset locationList

					// add a google marker for a Location
					self.currentCity().locations().forEach(function(location) {
						var item = new Location(location);
						// Add click Event for the marker
						google.maps.event.addListener(item.marker, 'click', function() {
							self.openCloseMarkerDetails(item);
						});
						self.locationList.push(item);


					});
				};

				// query search Field for an City
				self.query = ko.observable('');

				// Search for a city.
				self.onEnter = function(d,e) {
					var query = self.query(),
						location;
					//get Geocode
					$.getJSON('https://maps.googleapis.com/maps/api/geocode/json?address=' + query, function( data ) {
						var item = {
							city: data.results[0].formatted_address,
							latitude: data.results[0].geometry.location.lat,
							longitude: data.results[0].geometry.location.lng,
							active: false,
							locations: []
						};
						var place = data.results[0].geometry.location;
						var service = new google.maps.places.PlacesService(map);
						service.nearbySearch({
						    location: place,
						    radius: 3000,
						    types: ['cafe']
							}, function(result, status) {
								if (status === google.maps.places.PlacesServiceStatus.OK) {
								    for (var i = 0; i < result.length; i++) {
								    	var loc = {
								    		name: result[i].name,
								    		latitude: result[i].geometry.location.lat(),
									    	longitude: result[i].geometry.location.lng(),
									    	pin: result[i].icon
								    	};
								    	item.locations.push( new Location(loc) );
								    }
								}
								self.setCurrentCity( new City(item) );
							}
						);

					});

				};



				// Filter for the Location of a City
				self.filter = ko.observable('');
				self.filtereditems = ko.computed(function() {
					var filter = self.filter().toLowerCase();
					if(!filter) {
						return self.locationList();
					} else {
						return ko.utils.arrayFilter(self.locationList(), function(item) {
							return item.name.toLowerCase().indexOf(filter) !== -1;
						});
					}
				});

				// all Markers on the Map
				self.mapMarkers = ko.observableArray([]);

				// Add a Marker to the Map for any location in a City
				self.addMarker = ko.computed(function() {
					// Reset Marker Array
					self.mapMarkers().forEach(function(item) {
						item.setMap(null);
						self.mapMarkers([]);
					});

					// create Marker for all Elements in filtereditems
					self.filtereditems().forEach(function(item) {
						if(self.mapMarkers.indexOf(item) === -1) {
							item.marker.setMap(map);
							self.currentMarkers.push(item.marker);

							self.mapMarkers.push(item.marker);
						}
					});

				});

				self.currentMarkers = ko.observableArray([]);

				// Create a map object and specify the DOM element for display.
				self.renderMap = ko.computed(function() {

					var map_center = {lat: self.currentCity().latitude(), lng: self.currentCity().longitude()};


				  	map = new google.maps.Map(document.getElementById('map'), {
					    center: map_center,
					    scrollwheel: false,
					    zoom: 14
				  	});

				  	// Center the Map
				  	google.maps.event.addDomListener(window, 'resize', resize);

				  	function resize() {
						map.setCenter(map_center);
					}

				});

				// open InfoWindows
				self.allInfoWindows = [];

				// Open a InfoWindow from the ListView.
				self.listInfoWindow = function(id) {
					self.openCloseMarkerDetails(this);
				};

				// Open Close logic for the Map Marker
				self.openCloseMarkerDetails = function(location) {
					var detail,
						marker = location.marker;

					// Set a Animation for the Marker.
					marker.setAnimation(google.maps.Animation.BOUNCE);
					// remove Animation.
					setTimeout(function(){
						location.stopAnimation();
					}, 2000);

					if(marker.infowindow.getMap()) {
						marker.infowindow.close(map);
					} else {
						self.allInfoWindows.forEach(function(item) {
							item.infowindow.close();
						});
						marker.infowindow.open(map, marker);
						detail = $('#detail');
						var query = '/api/'+ self.currentCity().city() + '/' + marker.name;

						$.getJSON( query , function( data ) {
							var text, rating, phone, yelpUrl, img;
							if(data.businesses[0]) {

								img = '<img class="yelp_img" src="' + data.businesses[0].image_url + '" alt="">';

								rating = 'Rating: <img class="rating" src="' + data.businesses[0].rating_img_url + '" alt="Rating" /> ' +
							    			data.businesses[0].review_count + ' recommended posts<br/><br/>';

							    if(data.businesses[0].snippet_text) {
							   		text = '<p>' + data.businesses[0].snippet_text + '</p>';
							    }

							    phone = '<p>phone: ' + data.businesses[0].phone + '</p>';

							    yelpUrl = '<p><a href="' + data.businesses[0].mobile_url + '">Yelp Url</a></p>';
							    detail.empty().append(img, rating,text,phone,yelpUrl);

							} else {
								text = '<p>No Detail Informations on yelp.com available.</p>';
								detail.empty().append(text);
							}

						}).error(function(e) {
							detail.text('Detail Informations are not available!');
						});
						// If not in Array add it.
						if(self.allInfoWindows.indexOf(marker) === -1) {
							self.allInfoWindows.push(marker);
						}
					}

					map.setCenter(marker.getPosition());

				};

				// set a Initial city
				self.setCurrentCity(self.currentCity());


			};
			if(data) {
				ko.applyBindings(new ViewModel());
				// self.mapInit = ko.computed(function() {
				// 	if(mapinit()) {

				// 	}
				// });
			}

		});

		// open/Close the sidebar Navigation
		$('#handle').on('click', function(e) {
			e.preventDefault();
			var nav = $(this).parent();
			if(nav.hasClass('open')) {
				nav.removeClass('open');
			} else {
				nav.addClass('open');
			}
		});

	});

}

function googleMapError() {
  	// and this will be called when there was an error
  	console.log('error');
}