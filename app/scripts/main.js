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
    $(window).on('resize', () => {
        $('#map').height($('body').height()).width($('body').width());
        map.invalidateSize();
    }).trigger('resize');

	let state = {
		filterEnabled: false,
		data: null,
		filteredData: null
	}

	// включить/отключить фильтрацию
	$(() => {
		$('.input-filter').click(() => {
			state.filterEnabled = ! state.filterEnabled;
			$('.input-filter').toggleClass('input-filter_enabled', state.filterEnabled);

			showJsonOnMap(getDataForMap());
		});
	})

	// $(() => {
	// 	// загрузка файла
	//
	// });

    // ручноЙ ввод JSON
    $(() => {
        $('.input-json').magnificPopup({
            type: 'inline',
            preloader: false,
            focus: '.input-json-form__jeojson'
        });

        $('.input-json-form__ok').click(() => {
            let text = $('.input-json-form__jeojson').val();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                alert('Неверный формат JSON. Ошибки: ' + e);
                return false;
            }

            // закрываем попап
            $.magnificPopup.instance.close();

            // показвываем данные на карте
            loadData(data);
            return false;
        });
    });

	function getDataForMap() {
		if(state.data != null) {
			 if(state.filterEnabled) {
				 if(state.filteredData == null) {
					 let start = performance.now();
					 state.filteredData = PolygonAlgs.filterCoveredPolygons(state.data.features);
					 let time = (performance.now() - start);
					 console.log(`Время фильтрации ${time}ms`);
				 }
				 return state.filteredData;
			 } else {
				 return state.data;
			 }
		}
		return null;
	}

	function loadData(data) {
		state.data = data;
		state.filteredData = null;
		showJsonOnMap(getDataForMap());
	}

    function showJsonOnMap(data) {
        // очистить слои
        for (i in map._layers) {
            if (map._layers[i]._path != undefined) {
                try {
                    map.removeLayer(map._layers[i]);
                } catch (e) {
                    console.log("problem with " + e + map._layers[i]);
                }
            }
        }
        // добавить полигоны на карту
		if(data) {
			L.geoJson(data).addTo(map); // работает на удивление довольно быстро ...
		}
    }

	// для удобства отладки
	// если в query string указан URL файла, то сразу загружаем его
	// примеры
	//	file=/task1_example.geojson
	//	file=/task1_example_small.geojson
	let fileUrl = $.url(window.location.href).param('file');
	if(fileUrl) {
		console.log('Загружаем файл', fileUrl);
		$.getJSON(fileUrl )
	        .then((data) => {
				console.log('Получены данные');
	            loadData(data);
	        })
	        .fail((e) => {
	            console.log(`Ошибка загрузки файла ${fileUrl}`, e);
	        });
	}

})(L, $, PolygonAlgs, console);
