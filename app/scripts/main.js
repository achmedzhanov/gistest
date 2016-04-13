console.log('\'Allo \'Allo!');

(function(L, $) {
	"use strict";
	
		var map = L.map('map').setView([39.74739, -105], 13);

		L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
			maxZoom: 18,
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery © <a href="http://mapbox.com">Mapbox</a>',
			id: 'mapbox.light'
		}).addTo(map);

		$(window).on("resize", function() {
			$("#map").height($('body').height()).width($('body').width());
			map.invalidateSize();
		}).trigger("resize");

		var freeBus = {
			"type": "FeatureCollection",
			"features": [
				{
					"type": "Feature",
					"geometry": {
						"type": "LineString",
						"coordinates": [
							[-105.00341892242432, 39.75383843460583],
							[-105.0008225440979, 39.751891803969535]
						]
					},
					"properties": {
						"popupContent": "This is free bus that will take you across downtown.",
						"underConstruction": false
					},
					"id": 1
				},
				{
					"type": "Feature",
					"geometry": {
						"type": "LineString",
						"coordinates": [
							[-105.0008225440979, 39.751891803969535],
							[-104.99820470809937, 39.74979664004068]
						]
					},
					"properties": {
						"popupContent": "This is free bus that will take you across downtown.",
						"underConstruction": true
					},
					"id": 2
				},
				{
					"type": "Feature",
					"geometry": {
						"type": "LineString",
						"coordinates": [
							[-104.99820470809937, 39.74979664004068],
							[-104.98689651489258, 39.741052354709055]
						]
					},
					"properties": {
						"popupContent": "This is free bus that will take you across downtown.",
						"underConstruction": false
					},
					"id": 3
				}
			]
		};

		L.geoJson(freeBus).addTo(map);

})(L, $);