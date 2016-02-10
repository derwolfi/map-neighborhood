


jQuery( document ).ready(function( $ ) {
	'use strict';

	// Model
	var data = [

		{
			city: 'München',
			latitude: 48.122595,
			longitude: 11.5760318,
			locations: [
				{
					name: 'emilo KAFFEE',
					latitude: 48.1336954,
					longitude: 11.5766188,
					img: '//geo1.ggpht.com/cbk?panoid=UlvAMDNw3aGNh1GmVFfDyw&output=thumbnail&cb_client=search.TACTILE.gps&thumb=2&w=408&h=256&yaw=60.575191&pitch=0'
				},
				{
					name: 'Cafe Cord',
					latitude: 48.1303302,
					longitude: 11.5667481,
					img: '//lh3.googleusercontent.com/-fXkUaIjpRNY/VElJXP2MUNI/AAAAAAAAAC8/f1neQt35MWY/s408-k-no/'
				},
				{
					name: 'Bar Centrale',
					latitude: 48.1322238,
					longitude: 11.5745196,
					img: '//lh6.googleusercontent.com/-e2fNszxQgo0/Ve6gxsxNFHI/AAAAAAAAAGw/3jTM2s7KGpg/s408-k-no/'
				},
				{
					name: 'Caffé Fausto',
					latitude: 48.1097829,
					longitude: 11.5707436,
					img: '//lh6.googleusercontent.com/-RpwSkEU-Q3Y/VME4Hxl1bTI/AAAAAAAAAAU/2KxaIMxUdJA/s408-k-no/'
				},
				{
					name: 'Henry hat Hunger',
					latitude: 48.1266786,
					longitude: 11.5802105,
					img: '//lh4.googleusercontent.com/-mCpJ4MzPy5E/VNgQBEKHNuI/AAAAAAAAAAU/XF0DiEEXOeE/s408-k-no/'
				}
			]
		},
		{
			city: 'Berlin',
			latitude: 52.5340616,
			longitude: 13.4080685,
			locations: [
				{
					name: 'Café Hilde',
					latitude: 52.5325279,
					longitude: 13.4134222,
					img: '//lh4.googleusercontent.com/proxy/LwxhJr0lYDsI-wCzjWGcLkLhffFyLC5lTUdDKYRJyUvl1Igy_68i8ufMc0t_dmJea2VGLD6fQp2E7BrATG18MoEHrNOhPzA8joZxQBqjAiTFQ-X03dHl4zTE7sTToNRKzULS_xkd-kOPEip4Va5Pee43lQ=w455-h256'
				},
				{
					name: 'Café Anna Blume',
					latitude: 52.5363523,
					longitude: 13.4138299,
					img: '//lh3.googleusercontent.com/-M8F3PJu3naE/VlcH7_PX_1I/AAAAAAAACYs/hiJytsetkP0/s455-k-no/'
				},
				{
					name: 'Lass uns Freunde bleiben',
					latitude: 52.5338724,
					longitude: 13.4077145,
					img: '//lh5.googleusercontent.com/-oB92WKm9XPc/VmljuNcVQgI/AAAAAAABpw0/FacoVaFDOrY/s408-k-no/'
				},
				{
					name: 'Kulturkantine Mitte-Prenzlauer Berg',
					latitude: 52.5325279,
					longitude: 13.4107615,
					img: '//lh3.googleusercontent.com/-dVND6MyAGLw/VNvVt9mathI/AAAAAAAAAA0/x57cw6TCFK0/s408-k-no/'
				},
				{
					name: 'Cafe Knorke Bar',
					latitude: 52.532554,
					longitude: 13.4206964,
					img: '//lh5.googleusercontent.com/-phoc9jC1mT0/VNGSDh6-kpI/AAAAAAAAAAk/o8wXhlwbQzc/s408-k-no/'
				}
			]
		}
	];

	var City = function(data, isActive) {
		this.city = ko.observable(data.city);
		this.longitude = ko.observable(data.longitude);
		this.latitude = ko.observable(data.latitude);
		this.locations = ko.observable(data.locations);
		this.active = ko.observable(isActive);
	};

	var Location = function(data) {
		this.name = ko.observable(data.name);
		this.latitude = ko.observable(data.latitude);
		this.locations = ko.observable(data.locations);
	};

	var ViewModel = function() {
		var self = this;

		// List of all Cities
		self.cityList = ko.observableArray([]);
		data.forEach(function(item) {
			self.cityList.push( new City(item) );
		});

		// List of all Locations from a city
		self.locationList = ko.observableArray([]);

		// default City
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
			var markerDetails;


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
				markerDetails = $('#markerDetails');

				var query = '/api/'+ self.currentCity().city() + '/' + marker.name;
				console.log(query);

				markerDetails = $('#markerDetails');
				$.getJSON( query , function( data ) {
					var text, rating, phone, yelpUrl;

					rating = 'Rating: <img class="rating" src="' + data.businesses[0].rating_img_url + '" alt="Rating" /> ' +
				    			data.businesses[0].review_count + ' recommended posts<br/><br/>';

				    if(data.businesses[0].snippet_text) {
				   		text = '<p>' + data.businesses[0].snippet_text + '</p>';
				    }

				    phone = '<p>phone: ' + data.businesses[0].phone + '</p>';

				    yelpUrl = '<p><a href="' + data.businesses[0].mobile_url + '">Yelp Url</a></p>';

				    markerDetails.append(rating,text,phone,yelpUrl);
				    console.log(data.businesses[0]);
				}).error(function(e) {
					markerDetails.text('Detail Informations are not available!');
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
						id: item.latitude + item.longitude
					});
					// A InfoWindow for a Location.
					marker.infowindow = new google.maps.InfoWindow({
						maxWidth: 400,
						content: '<div><h2>' + item.name + '</h2>' +
								'<img class="iwImg" src="'+ item.img +'"><div id="markerDetails"></div></div>'
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

	ko.applyBindings(new ViewModel());

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


