// This function is called when the maps page is loaded.
var map = null;
function initMapsPage() {
	$("#map_canvas").height( $(document).height() );
	$("#r-check").bind("click", function(evt){updateShownPointsOnMap()} );
	$("#e-check").bind("click", function(evt){updateShownPointsOnMap()} );
	$("#t-check").bind("click", function(evt){updateShownPointsOnMap()} );
	
	$('#map_canvas').gmap().bind('init', function(ev, map_c) {
		console.log( "Init map with size:" + $("#map_canvas").width() + ", " + $("#map_canvas").height() );
		$('#map_canvas').gmap('addMarker', {'position': '40.706018,-74.014721', 'bounds': true});
		$('#map_canvas').gmap('option', 'zoom', 12);
		map = map_c;
		
		// Load map events:
		loadMapEvents();
		
		// Load other events later:
		setTimeout( function() {
			// Load ferries
			loadFerryData();
		
			// Load restaurants:
			loadRestaurants();
		}, 2000 );
			navigator.geolocation.getCurrentPosition ( 
				function(position) {
					var clientPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
					//$('#map_canvas').gmap('get', 'map').panTo( clientPosition );
					$('#map_canvas').gmap('addShape', 'Circle', { 
						'strokeWeight': 0.5,
						'fillColor': "rgb(0, 184, 245)", 
						'fillOpacity': 0.25, 
						'center': clientPosition, 
						'radius': 1000, 
						'clickable': false 
					});
					$('#map_canvas').gmap('addShape', 'Circle', { 
						'strokeWeight': 1,
						'fillColor': "rgb(112, 220, 255)", 
						'fillOpacity': 1, 
						'center': clientPosition, 
						'radius': 20, 
						'clickable': false 
					});
					
				}, 
				function(error) {
					   console.log( "Geolocation not enabled!" );
				} 
			);
			
			
			
		});
		
		//loadMapEvents();
}

// Returns an array of events.
function loadMapEvents() {
	loadWaterfrontEvents( appendEventsOnMap );
}

var eventData = []
function appendEventsOnMap( data ) {
	data = jQuery.parseJSON( data );
	console.log( data );
	
	// Filter data for only waterfront events:
	data = data.results;
	data = filterEventsForWaterfrontOnly( data );
	
	// Add the events to the saved data:
	for ( var i in data )
		eventData.push( data[ i ] );
	
	updateShownPointsOnMap();
}

// Load restaurant data:
var restaurantData = [];
var restaurantLocOn = 0;
function loadRestaurants() {
	var bounds = [
	new google.maps.LatLngBounds(
		new google.maps.LatLng( 40.713956,-74.062958 ),
		new google.maps.LatLng( 40.817967,-73.855591 )
	),
	new google.maps.LatLngBounds(
		new google.maps.LatLng( 40.580585,-74.071198 ),
		new google.maps.LatLng( 40.718119,-73.970947 )
	),
	new google.maps.LatLngBounds(
		new google.maps.LatLng( 40.592057,-74.198914 ),
		new google.maps.LatLng( 40.709792,-74.043732 )
	),
	];
	
	var request = {
	  bounds: bounds[ restaurantLocOn ],
	  types: ['restaurant', 'cafe', 'food']
	};
	var service = new google.maps.places.PlacesService(map);
	service.search(request, restaurantDataCallback );
}

function restaurantDataCallback( data, status, pagination ) {
	console.log( "Recieved restaurant data" );
	
	// Save this data to the restaurant data:
	for ( var i in data ) {
		data[ i ].geocode_latitude = data[ i ].geometry.location.lat();
		data[ i ].geocode_longitude = data[ i ].geometry.location.lng();
		//console.log( data[ i ] );
	}
	data = filterEventsForWaterfrontOnly( data );
	for ( var i in data )
		restaurantData.push( data[ i ] );
	
	// Load more data:
	if ( pagination.hasNextPage ) {
		pagination.nextPage();
	} else if ( restaurantLocOn == 0 ) {
		restaurantLocOn = 1;
		loadRestaurants();
	} else if ( restaurantLocOn == 1 ) {
		restaurantLocOn = 2;
		loadRestaurants();
	}
	
	updateShownPointsOnMap();
}

// Load ferry data:
var ferryData = [];
function loadFerryData() {
	var bounds = new google.maps.LatLngBounds(
		new google.maps.LatLng( 40.621249,-74.097977 ),
		new google.maps.LatLng( 40.795618,-73.924255 )
	)
	
	var request = {
	  bounds: bounds,
	  keyword: "ferry"
	};
	var service = new google.maps.places.PlacesService(map);
	service.search(request, ferryDataCallback );
}

function ferryDataCallback( data, status, pagination ) {
	console.log( "Recieved ferry data" );
	
	// Save this data to the ferry data:
	/*
	for ( var i in data ) {
		data[ i ].geocode_latitude = data[ i ].geometry.location.lat();
		data[ i ].geocode_longitude = data[ i ].geometry.location.lng();
		//console.log( data[ i ] );
	}
	data = filterEventsForWaterfrontOnly( data );
	*/
	for ( var i in data )
		ferryData.push( data[ i ] );
	
	// Load more data:
	if ( pagination.hasNextPage ) {
		pagination.nextPage();
	}
	
	updateShownPointsOnMap();
}


function updateShownPointsOnMap() {
	console.log( "updating" );
	document.getElementById( "map_loading_message" ).style.display = "none";
	$("#map_canvas").gmap( "clear", "markers" );
	
	// Display events:
	var data = [];
	if ( isChecked( "e-check" ) )
		data = eventData;

	for ( var i = 0; i < data.length; i++ ) {
		var pt = data[ i ];
		var title = data[ i ].event_name;
		var description = data[ i ].web_description;
		var content = "<div style='font-size:14px; height:350px; overflow:auto'>"
			+ "<div style='font-size:150%'>" + title + "</div>";
		var cat = "";
		if ( typeof pt.subcategory !== "undefined" )
			cat = "(" + pt.subcategory + ")";
		content += "<div>" + cat + "</div>"
			+ "<div>" + pt.venue_name + "<br />" + pt.street_address + "</div><br />";
		var recurDays = "";
		if ( typeof pt.recur_days !== "undefined" )
			recurDays = "<b>Every week on:</b> " + pt.recur_days.join( ", " );
		content += "<div><b>Dates:</b> " + pt.date_time_description + "<br />" + recurDays + "</div>"
			+ "<div><b>Phone:</b> " + pt.telephone + "</div>"
			+ "<p>" + description + "</p>"
			+ "<div><a href=\"javascript:window.open('" + pt.event_detail_url + "')\"><b>More Information</b></a></div>"
			+ "</div>";
		
		var latlong = data[ i ].geocode_latitude + "," + data[ i ].geocode_longitude;
		$('#map_canvas').gmap('addMarker', {'position': latlong, 'bounds': false, icon: "eventPin.png"}).click( uniquePopupFunction( content ) );
			
	}
	
	// Display restaurants
	data = [];
	if ( isChecked( "r-check" ) )
		data = restaurantData;
	
	for ( var i in data ) {
		var pt = data[ i ];
		var latlng = pt.geometry.location;
		
		$('#map_canvas').gmap('addMarker', {'position': latlng, 'bounds': false, icon: "restaurantPin.png"}).click( uniquePopupFunctionForRestaurant( pt.reference ) );
	}
	
	// Display Ferry ports
	data = [];
	if ( isChecked( "t-check" ) )
		data = ferryData;
	
	for ( var i in data ) {
		var pt = data[ i ];
		var latlng = pt.geometry.location;
		
		$('#map_canvas').gmap('addMarker', {'position': latlng, 'bounds': false, icon: "ferryPin.png"}).click( uniquePopupFunctionForRestaurant( pt.reference ) );
	}
	
	function isChecked( idname ) {
		return document.getElementById( idname ).checked;
	}
}

function uniquePopupFunctionForRestaurant( reference ) {
	return function(evt) {
		var service = new google.maps.places.PlacesService(map);
		var obj = this;
		service.getDetails( {reference:reference}, function(pt) {
			console.log( pt );
			var name = pt.name;
			var address = pt.formatted_address;
			var rating = pt.rating;
			var stars = Math.round( rating );
			var emptyStars = 5 - stars;
			var phone = "-";
			if ( typeof pt.formatted_phone_number !== "undefined" )
				phone = pt.formatted_phone_number;
			var website = "None";
			if ( typeof pt.website !== "undefined" )
				website = "<a href=\"javascript:window.open('" + pt.website + "')\">" + pt.website + "</a>";
			
			var content = "<div style='font-size:14px; height:350px; overflow:auto'>"
			+ "<div style='font-size:150%'>" + name + "</div>"
			+ "<div>" + address + "</div>";
			if ( typeof pt.rating !== "undefined" ) {
				content += "<div>";
				for ( var a = 0; a < stars; a++ )
					content += "<img src='star.png'>";
				for ( var a = 0; a < emptyStars; a++ )
					content += "<img src='empty_star.png'>";
				content += "</div>"
			}
			+ "<div><b>Phone:</b> " + phone + "</div>"
			+ "<div><b>Website:</b> " + website + "</div><br />";
			if ( typeof pt.reviews !== "undefined" ) {
				content += "<div>" + pt.reviews.length + " Review";
				if ( pt.reviews.length != 1 ) content += "s";
				content += ":</div>";
				content += "<div style='margin-left:5px; padding:5px; border-radius:5px; border:1px solid; border-color:rgb(230,230,230)'>";
				for ( var i = 0; i < pt.reviews.length; i++ ) {
					content += "<div><b>" + pt.reviews[ i ].author_name + "</b></div>"
					+ "<div>" + pt.reviews[ i ].text + "</div>"
					+ "<div style='margin-top:8px; margin-bottom:8px; width:100%; height:1px; background-color:rgb(230,230,230)'></div>";
				}
				content += "</div>";
			}
			+ "</div>";
			$('#map_canvas').gmap('openInfoWindow', {'content': content }, obj );
		} );
	}
}

function uniquePopupFunction( content ) {
	return function() {
		$('#map_canvas').gmap('openInfoWindow', {'content': content }, this);
	}
}

function filterEventsForWaterfrontOnly( data ) {
	var points = [
	40.51954115033359,-74.1353988647461,
	40.538068780531134,-74.09317016601562,
	40.57328324298056,-74.0591812133789,
	40.60170214544077,-74.03926849365234,
	40.636622594719725,-74.0536880493164,
	40.662149873038814,-74.05025482177734,
	40.769101775774935,-73.9434814453125,
	40.74517613004631,-73.96373748779297,
	40.71577741296778,-73.9712905883789,
	40.70562793820589,-73.99429321289062,
	40.79353864997009,-73.98811340332031,
	40.763121171621314,-74.01008605957031,
	40.73112880602221,-74.0200424194336,
	40.70562793820589,-74.02708053588867,
	40.682981227710584,-74.03411865234375,
	40.705888,-73.998413,
	40.691572,-74.000816,
	40.684283,-74.009056,
	40.69782,-74.050255,
	40.690791,-74.070854,
	40.676212,-74.082184,
	40.657722,-74.084587,
	40.632714,-74.062958,
	40.752459,-73.965111,
	40.740494,-73.975067
	];
	
	var accepted = [];
	
	for ( var a in data ) {
		var point = new Point( parseFloat( data[ a ].geocode_latitude ),
							   parseFloat( data[ a ].geocode_longitude ) );
							   
		for ( var i = 0; i < points.length; i += 2 ) {
			var p2 = new Point( points[ i ], points[ i + 1 ] );
			var dist = distanceFrom( point, p2 );
			if ( dist <= 0.013 ) {
				accepted.push( data[ a ] )
				break;
			}
		}
	}
	return accepted;

	function distanceFrom( a, b ) {
		return Math.sqrt( Math.pow( a.x - b.x, 2 ) + Math.pow( a.y - b.y, 2 ) );
	}
	
	function Point( x, y ) {
		this.x = x;
		this.y = y;
	}
}
