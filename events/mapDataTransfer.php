<?php
if ( isset( $_GET[ "nyc_events" ] ) ) {
	$latlng = $_GET[ "location" ];
	$apiKey = $_GET[ "key" ];
	
	$url = "http://api.nytimes.com/svc/events/"
	. "v2" // version
	. "/listings"
	. ".json?"
	. "ll=" . $latlng
	. "&api-key=" . $apiKey
	. "&radius=200000"
	. "&limit=100";
	
	$data = file_get_contents( $url );
	header( "Content-type: text" );
	echo $data;
	exit;
}

echo( "ERROR" );
	
?>