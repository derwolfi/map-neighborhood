


jQuery( document ).ready(function( $ ) {
	'use strict';
	var data;

	// Data connection to server
	var jqxhr = $.getJSON( '/data/', function( data ) {

		// Construktor for a City use: new City(##item##);
		var City = function(data, isActive) {
			this.city = ko.observable(data.city);
			this.longitude = ko.observable(data.longitude);
			this.latitude = ko.observable(data.latitude);
			this.locations = ko.observable(data.locations);
			this.active = ko.observable(isActive);
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
				self.locationList.removeAll();
				self.currentCity().locations().forEach(function(location) {
					self.locationList.push(location);
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
					var service = new google.maps.places.PlacesService(self.map);
					service.nearbySearch({
					    location: place,
					    radius: 3000,
					    types: ['cafe']
						}, function(result, status) {
							if (status === google.maps.places.PlacesServiceStatus.OK) {
							    for (var i = 0; i < result.length; i++) {
							    	var loc = {
										name: null,
										latitude: null,
										longitude: null,
										img: null,
										pin: null
									};
							    	loc.name = result[i].name;
							    	loc.latitude = result[i].geometry.location.lat();
							    	loc.longitude = result[i].geometry.location.lng();
							    	loc.pin = result[i].icon;
							    	item.locations.push(loc);
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

			// The google map
			self.map = null;

			// Create a map object and specify the DOM element for display.
			self.renderMap = ko.computed(function() {

				var map_center = {lat: self.currentCity().latitude(), lng: self.currentCity().longitude()};


			  	self.map = new google.maps.Map(document.getElementById('map'), {
				    center: map_center,
				    scrollwheel: false,
				    zoom: 14
			  	});

			  	// Center the Map
			  	google.maps.event.addDomListener(window, 'resize', resize);

			  	function resize() {
					self.map.setCenter(map_center);
				}

			});

			// all the Marker
			self.mapMarker = ko.observableArray([]);

			// open InfoWindows
			self.allInfoWindows = [];

			// Open a InfoWindow from the ListView.
			self.listInfoWindow = function(id) {
				var result = $.grep(self.mapMarker(), function(e){ return e.id == id; });
				self.openCloseMarkerDetails(result[0]);
			};

			// Open Close logic for the Map Marker
			self.openCloseMarkerDetails = function(marker) {
				var detail;


				// Set a Animation for the Marker.
				marker.setAnimation(google.maps.Animation.BOUNCE);
				// remove Animation.
				setTimeout(function(){
					marker.setAnimation(null);
				}, 2000);

				if(marker.infowindow.getMap()) {
					marker.infowindow.close(self.map);
				} else {
					self.allInfoWindows.forEach(function(item) {
						item.infowindow.close();
					});
					marker.infowindow.open(self.map, marker);
					// self.map.setCenter(marker.getPosition());
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

			};


			// Add a Marker to the Map for any location in a City
			self.addMarker = ko.computed(function() {
				// Reset Marker Array
				self.mapMarker().forEach(function(item) {
					item.setMap(null);
					self.mapMarker([]);
				});

				// create Marker for all Elements in filtereditems
				self.filtereditems().forEach(function(item) {
					if(self.mapMarker.indexOf(item) === -1) {
						var marker = new google.maps.Marker({
							name: item.name,
							position: {lat: item.latitude, lng: item.longitude},
							map: self.map,
							animation: google.maps.Animation.DROP,
							id: item.latitude + item.longitude,
							icon: {
								url: item.pin,
								scaledSize: new google.maps.Size(20, 20)
							}
						});
						// A InfoWindow for a Location.
						marker.infowindow = new google.maps.InfoWindow({
							maxWidth: 400,
							content: '<div id="iwContent"><h2>' + item.name + '</h2>' +
									'<div id="detail"></div></div>'
						});

						// Click Event for Map Marker
						google.maps.event.addListener(marker, 'click', function() {
							self.openCloseMarkerDetails(marker);
						});
						self.mapMarker.push(marker);
					}
				});

				// set the map to the marker
				self.mapMarker().forEach(function(item) {
					item.setMap(self.map);
				});

			});

			// set a Initial city
			self.setCurrentCity(self.currentCity());

		};
		if(data) {
			ko.applyBindings(new ViewModel());
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


