console.log('\'Allo \'Allo!');

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
				data.features = data.features.slice(1,10000);
				var filteredData = filterCoveredPolygons(data);
				console.log( "Завершилась фильтрация", new Date().toLocaleString());
				//var filteredData = data;

				// добавить полигоны на карту
				// работает на удивление довольно быстро ...
				L.geoJson(filteredData).addTo(map);
			})
			.fail((e) => {
    		console.log( "error ", e);
  		});

			function filterCoveredPolygons(data) {
										// для начала простой алгоритм
					// проверям накрывание только одним полигоном
					// посколькку полигоны выпуклые, то чтобы проверить вхождение A в B досаточно проверить что все точки A находятся внутри полигона B

					// идем в обратном порядке
					// пвый полигон виден всегда
					// второй может перекрываться первым и т.д.

					let filtered = [];
					for(let i=data.features.length-1; i>= 0; i--) {
						let p = data.features[i];

						let fIdx = filtered.length;
						let covered = false;
						while (fIdx--) {
							if(PolygonAlgs.isCovered(p, filtered[fIdx])) {
								covered = true;
								break;
							}
						}

						if(!covered) {
							filtered.push(data.features[i]);
						}
					}
					console.log('data.length=' + data.features.length + ' filtered.length=' + filtered.length)
					return filtered;
			}

})(L, $, PolygonAlgs, console);
