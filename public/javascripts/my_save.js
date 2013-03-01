var map, markerArray = [], infowindow = new google.maps.InfoWindow();

function initialize() 
{
	var curlatlngarr = splitLatLng($(".curLatLng").attr("id"));
	var curlatlng = new google.maps.LatLng(curlatlngarr[0], curlatlngarr[1]);
	
	var mapOptions = 
	{
		center: curlatlng,
		zoom: 14,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	
	map = new google.maps.Map(document.getElementById("map"), mapOptions);
	
	google.maps.event.addListener(map, "click", function()
	{
		infowindow.close();
	});
	
	setMarker(curlatlngarr, true);
	setAllMarkers();
}

function setAllMarkers()
{
	var tab = new Array();
	$(".latLngList").each(function() 
	{
		tab = splitLatLng($(this).attr("id"));
		setMarker(tab, false);
	});
}

function setMarker(latlngarr, current) 
{
	var latlng = new google.maps.LatLng(latlngarr[0], latlngarr[1]), latlngstr = latlngarr[0] + "," + latlngarr[1];
	var cont = $("ul#addrlist li#" + latlngstr).text();
	var pinColor = "FE7569";
	
	if(current) 
		pinColor = "2297E9"; // Set blue color to current user's marker

	var markerOptions = 
	{
		position: latlng,
		animation: google.maps.Animation.DROP,
		map: map,
		icon: new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
			new google.maps.Size(21, 34),
			new google.maps.Point(0, 0),
			new google.maps.Point(10, 34)
		),
		shadow: new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
			new google.maps.Size(40, 37),
			new google.maps.Point(0, 0),
			new google.maps.Point(12, 35)
		),
		title: cont,
		html: cont,
		zIndex: 2
	}
	
	var marker = new google.maps.Marker(markerOptions);
	
	markerArray[latlngstr] = marker;
}

function splitLatLng(str)
{
	var tab = str.split(",");
	tab[0] = parseFloat(tab[0]); tab[1] = parseFloat(tab[1]);
	return tab;
}

$(document).ready(function() 
{
	initialize();

	$("ul#addrlist li").on("click", function() 
	{
		var tab = splitLatLng($(this).attr("id"));
		var latlng = new google.maps.LatLng(tab[0], tab[1]);
		
		map.setZoom(13);
		map.setCenter(markerArray[$(this).attr("id")].getPosition());
		
		infowindow.setContent($(this).text());
		infowindow.open(map, markerArray[$(this).attr("id")]);
	});
});