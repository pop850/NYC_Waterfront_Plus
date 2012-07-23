// This function calls the callback function with an array of events in the NYC waterfront area.
// { name, description, Location }
function loadWaterfrontEvents() {
	var event_key = "3493984b763b38283a1bf81b7acc0923:8:66341856";
	var latlong = "40.664167,-73.938611";
	
	// Event Listings
	var URL = "http://api.nytimes.com/svc/events/"
	+ "v2" // version
	+ "/listings"
	+ ".json?"
	+ "ll=" + latlong
	+ "&api-key=" + event_key
	+ "&radius=1000000";
	
	console.log( "Sending request to " + URL );
	ajaxRequest( URL, waterfrontCallback );
}

function waterfrontCallback( data ) {
	document.getElementById( "display" ).innerHTML = data;
	console.log( data );
}

// This function calls the callback function with an array of restaurants in the waterfront area.
function loadWaterfrontRestaurants( callback ) {
	// YELP API 2.0 Access
	var consumer_key =		"VW0RoJTEi445WQs5tbqV3A";
	var consumer_secret =	"LYKOE4ciD0JJODF6G98vnD-NKB4";
	var token =				"jmF88hBqD_9E5x9pGjxKB2LXjEy1P0T4";
	var token_secret =		"m3_yR2N-IAi6x09JHy41Sb8iVYw";
	var timestamp = Math.floor( (new Date()).getTime() / 1000 );
	var random = Math.random() + "";
	
	var URL = "http://api.yelp.com/v2/search?"
	+ "term=" + "food"
	+ "&location=" + "New+York+City"
	+ "&oauth_consumer_key" + consumer_key
	+ "&oauth_token" + token
	+ "&oauth_signature_method=" + "hmac-sha1"
	+ "&oauth_signature=" + ""
	+ "&oauth_timestamp=" + timestamp
	+ "&oauth_nonce=" + random;
}

// This function runs an ajax request that will return a json object to the callback
// function.
function ajaxRequest( url, callback ) {
	var ajaxRequest = new XMLHttpRequest();
	ajaxRequest.onreadystatechange = callback( ajaxRequest.responseText );
	ajaxRequest.open( "GET", url, true );
	ajaxRequest.send( null );
}