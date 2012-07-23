// This function loads the news page:
function initNewsPage() {
	var width = $(window).width();
	var src = "http://p3k.org/rss/index.js?url=http%3A%2F%2Fwww.waterfrontalliance.org%2Frss.xml&amp;maxItems=7&amp;width=350&amp;radius=5&amp;align=none&amp;frameColor=%23b3a28e&amp;titleBarColor=%2390a8b3&amp;titleBarTextColor=%23ffead2&amp;boxFillColor=%23ffead2&amp;textColor=%2395412b&amp;linkColor=%232c7395&amp;showXmlButton=true&amp;fontFace=10pt%20sans-serif";
	var script = document.createElement("script");
	script.type="text/javascript";
	script.src = src;
	document.getElementById( "news_page" ).appendChild( script );
}