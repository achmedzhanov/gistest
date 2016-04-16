
(function(L, $, PolygonAlgs, console) {
	"use strict";

		var map = L.map('map').setView([39.74739, -105], 3);

		L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
			maxZoom: 18,
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery © <a href="http://mapbox.com">Mapbox</a>',
			id: 'mapbox.light'
		}).addTo(map);


		// растягиваем карту на размер окна
		$(window).on("resize", function() {
			$("#map").height($('body').height()).width($('body').width());
			map.invalidateSize();
		}).trigger("resize");


		// загрука данных
		$.getJSON('/task1_example.geojson' /*'/task1_example_small.geojson'*/)
			.then((data) => {
				console.log( "Получены данные" );
				console.log( "Фильтруем данные данные", new Date().toLocaleString());
				var filteredData =PolygonAlgs.filterCoveredPolygons(data.features.slice(1,50000));
				console.log( "Завершилась фильтрация", new Date().toLocaleString());
				//var filteredData = data;

				// добавить полигоны на карту
				// работает на удивление довольно быстро ...
				L.geoJson(filteredData).addTo(map);
			})
			.fail((e) => {
    		console.log( "error ", e);
  		});


})(L, $, PolygonAlgs, console);
