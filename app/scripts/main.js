
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

		// ручно ввод JSON
		$(function() {
			$('.input-json').magnificPopup({
					type: 'inline',
					preloader: false,
					focus: '.input-json-form__jeojson',

					callbacks: {
						beforeOpen: function() {
							// TODO put last value
						}
					}
				});

				$('.input-json-form__ok').click(function() {
					var text = $('.input-json-form__jeojson').val();
					var data;
					try {
						data = JSON.parse(text);
					} catch(e) {
						alert('Неверный формат JSON. Ошибки: ' + e);
						return false;
					}

					// закрываем попап
					$.magnificPopup.instance.close();

					// показвываем данные на карте
					showJson(data);
					return false;
				});
		});

		function showJson(data) {
			// очистить слои
			for(i in map._layers) {
        if(map._layers[i]._path != undefined) {
            try {
                map.removeLayer(map._layers[i]);
            }
            catch(e) {
                console.log("problem with " + e + map._layers[i]);
            }
        }
    	}
			// добавить полигоны на карту
			L.geoJson(data).addTo(map); // работает на удивление довольно быстро ...
		}

		// загрука данных
		$.getJSON('/task1_example.geojson' /*'/task1_example_small.geojson'*/)
			.then((data) => {
				console.log( "Получены данные" );
				console.log( "Фильтруем данные данные", new Date().toLocaleString()); // TODO заюзать полифил perf.now
				var filteredData =PolygonAlgs.filterCoveredPolygons(data.features.slice(1, 10000 /*50000*/));
				console.log( "Завершилась фильтрация", new Date().toLocaleString());
				showJson(filteredData);
			})
			.fail((e) => {
    		console.log( "error ", e);
  		});


})(L, $, PolygonAlgs, console);
