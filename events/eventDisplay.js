
// This function will display the downloaded event data, in a list format.
function displayEventData() {
	if ( eventData.length == 0 ) {
		// Call the ajax script:
		loadWaterfrontEvents( appendEventDataToList );
	} else {
		// Do not load events if they are already loaded.
		drawEventList();
	}
}

// This function will do the actual displaying of event data.
function appendEventDataToList( data ) {
	// Parse the data:
	data = jQuery.parseJSON( data );
	console.log( data );
	data = data.results;
	data = filterEventsForWaterfrontOnly( data );
	
	for ( var i in data ) {
		var match = false;
		for ( var a in eventData ) {
			if ( eventData[ a ].event_name == data[ i ].event_name ) {
				match = true;
				break;
			}
		}
		
		if ( match == false ) {
			eventData.push( data[ i ] );
		}
	}
	
	drawEventList();
}

var currentEventListing = null;
function drawEventList() {
	var data = eventData;
	document.getElementById( "event_content" ).innerHTML = "";
	for ( var i = 0; i < data.length; i++ ) {
		var entry = data[ i ];
		var elem = document.createElement( "li" );
		d = "event_" + i;
		elem.innerHTML = "<img src=\"images/" + entry.category.toLowerCase() + "_icon.png\" style='width:60px; height:60px; float:left'>"
		+ "<a href=\"eventpage.html\" id=\"" + d + "\"><h1>" + entry.event_name + "</h1></a>";
		document.getElementById( "event_content" ).appendChild( elem );
		$("#" + d).bind( "click", uniqueEventListingFunction( entry ) );
	}
	// Refresh the list:
	document.getElementById( "loading_text" ).style.display = "none";
	$("ul").listview("refresh");
	
	function uniqueEventListingFunction( listing ) {
		return function() {
			currentEventListing = listing;
		}
	}
}

function initEventListingPage() {
	document.getElementById( "l_event_name" ).innerHTML = currentEventListing.event_name;
	document.getElementById( "l_event_name_2" ).innerHTML = currentEventListing.event_name;
	document.getElementById( "l_img" ).src = "http://vulcan.seidenberg.pace.edu/~sb12-scholars-s04/NY%20Waterfront/events/images/" + currentEventListing.category.toLowerCase() + "_icon.png";
	document.getElementById( "l_event_description" ).innerHTML = currentEventListing.web_description;
	var recurDays = "";
	if ( typeof currentEventListing.recur_days !== "undefined" )
		recurDays = "<b>Every week on:</b> " + currentEventListing.recur_days.join( ", " );
	document.getElementById( "l_event_time_description" ).innerHTML = "<div><b>Dates:</b> " + currentEventListing.date_time_description + "<br />" + recurDays + "</div>";
	var latlng = currentEventListing.geocode_latitude + "," + currentEventListing.geocode_longitude;
	document.getElementById( "l_map_preview" ).src = "http://maps.googleapis.com/maps/api/staticmap?center=" + latlng + "&zoom=16&size=200x200&markers=" + latlng + "&sensor=false";
	$( "#l_event_link" ).attr("href", "javascript:window.open('" +
			currentEventListing.event_detail_url + "')" );
}

function dateToNiceString( date ) {
	var days = [ "Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat." ];
	var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
	var str = days[ date.getDay() ] + " " + months[ date.getMonth() ] + " " + date.getDate() + ", " + date.getFullYear();
	return str;
}	