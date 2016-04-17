(function (PolygonAlgs) {
  'use strict';

  describe('PolygonAlgs', function () {
    describe('#isCovered', function () {
      it('Должен вернуть true когда один полигон накрывает целиком (гео коорлдинаты)', function () {
        var p  = {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-56.736721,79.502541],[-76.597969,81.201027],[-74.45649,82.200592],[-53.047604,80.343918],[-56.736721,79.502541]]]}};
        var d = {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-55.736721,78.502541],[-76.597969,81.201027],[-74.45649,82.200592],[-53.047604,80.343918],[-55.736721,78.502541]]]}};
        var result = PolygonAlgs.isCovered(p, d);
        assert.isTrue(result);
      });

      it('Должен вернуть true когда один полигон накрывает целиком (гео коорлдинаты)', function () {
        var p  = {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-56.736721,79.502541],[-76.597969,81.201027],[-74.45649,82.200592],[-53.047604,80.343918],[-56.736721,79.502541]]]}};
        var d = {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-56.736721,79.502541],[-76.597969,81.201027],[-74.45649,82.200592],[-53.047604,80.343918],[-56.736721,79.502541]]]}};
        var result = PolygonAlgs.isCovered(p, d);
        assert.isTrue(result);
      });

      it('Должен вернуть true когда один полигон накрывает целиком (целые координаты)', function () {
        var p  = {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[1,1],[1,4],[4,4],[4,1],[1,1]]]}};
        var d = {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[0,0],[0,5],[5,5],[5,0],[0,0]]]}};;
        var result = PolygonAlgs.isCovered(p, d);
        assert.isTrue(result);
      });

      it('Должен вернуть true когда полигоны совпадают (целые коорлдинаты)', function () {
        var p = {"type":"Feature","geometry":{"type":"Polygon","coordinates":[([[0,0],[0,5],[5,5],[5,0],[0,0]])]}};;
        var d = {"type":"Feature","geometry":{"type":"Polygon","coordinates":[([[0,0],[0,5],[5,5],[5,0],[0,0]])]}};
        var result = PolygonAlgs.isCovered(p, d);
        assert.isTrue(result);
      });



      it('Должен вернуть true когда один полигон накрывает целиком и ребер ориентированы по часовой стрелке (целые координаты)', function () {
        var p  = {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[1,1],[4,1],[4,4],[1,4],[1,1]]]}};
        var d = {"type":"Feature","geometry":{"type":"Polygon","coordinates":[([[0,0],[0,5],[5,5],[5,0],[0,0]])]}};;
        var result = PolygonAlgs.isCovered(p, d);
        assert.isTrue(result);
      });

    });
/*
{
"type":"FeatureCollection",
"features":[
{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-56.736721,79.502541],[-76.597969,81.201027],[-74.45649,82.200592],[-53.047604,80.343918],[-56.736721,79.502541]]]}},
{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-55.736721,78.502541],[-76.597969,81.201027],[-74.45649,82.200592],[-53.047604,80.343918],[-55.736721,78.502541]]]}},
{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[47.954506,80.722702],[70.071335,82.686768],[77.297005,78.996407],[60.34584,77.564949],[47.954506,80.722702]]]}},
{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-96.827904,19.897907],[-99.194847,20.321608],[-98.84391,22.068865],[-96.44857,21.648794],[-96.827904,19.897907]]]}},
{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[94.583733,-62.176575],[101.554695,-60.51865],[105.339142,-63.530411],[97.796455,-65.356491],[94.583733,-62.176575]]]}}
]
}


*/

      describe('#filterCoveredPolygons', function () {
        it('Должен отфильтровать полигон, который накрывается целиком одним полигоном (гео координаты)', function () {
          var small  = {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-56.736721,79.502541],[-76.597969,81.201027],[-74.45649,82.200592],[-53.047604,80.343918],[-56.736721,79.502541]]]}};
          var big = {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-55.736721,78.502541],[-76.597969,81.201027],[-74.45649,82.200592],[-53.047604,80.343918],[-55.736721,78.502541]]]}};
          var result = PolygonAlgs.filterCoveredPolygons([small, big]);
          assert.deepEqual([big], result);
        });

        it('Должен отфильтровать полигон, который накрывается целиком одним полигоном + есть другие полигоны (гео координаты)', function () {
          var result = PolygonAlgs.filterCoveredPolygons([
          {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-56.736721,79.502541],[-76.597969,81.201027],[-74.45649,82.200592],[-53.047604,80.343918],[-56.736721,79.502541]]]}},
          {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-55.736721,78.502541],[-76.597969,81.201027],[-74.45649,82.200592],[-53.047604,80.343918],[-55.736721,78.502541]]]}},
          {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[47.954506,80.722702],[70.071335,82.686768],[77.297005,78.996407],[60.34584,77.564949],[47.954506,80.722702]]]}},
          {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-96.827904,19.897907],[-99.194847,20.321608],[-98.84391,22.068865],[-96.44857,21.648794],[-96.827904,19.897907]]]}},
          {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[94.583733,-62.176575],[101.554695,-60.51865],[105.339142,-63.530411],[97.796455,-65.356491],[94.583733,-62.176575]]]}}
          ]);

          // это костыль ... надо делать проверку, независимую от порядка, но в mocha этого нет из коробки ..
          result.reverse()

          assert.deepEqual([
          {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-55.736721,78.502541],[-76.597969,81.201027],[-74.45649,82.200592],[-53.047604,80.343918],[-55.736721,78.502541]]]}},
          {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[47.954506,80.722702],[70.071335,82.686768],[77.297005,78.996407],[60.34584,77.564949],[47.954506,80.722702]]]}},
          {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-96.827904,19.897907],[-99.194847,20.321608],[-98.84391,22.068865],[-96.44857,21.648794],[-96.827904,19.897907]]]}},
          {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[94.583733,-62.176575],[101.554695,-60.51865],[105.339142,-63.530411],[97.796455,-65.356491],[94.583733,-62.176575]]]}}
          ],
            result
            , JSON.stringify(result));
        });

        it('Должен отфильтровать полигон, который накрывается целиком двумя пересекающимися полигонами (гео координаты)', function () {
          var result = PolygonAlgs.filterCoveredPolygons([
            {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[4,4],[8,4],[8,8],[4,8],[4,4]]]}},
            {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[2,3],[7,3],[7,9],[2,9],[2,3]]]}},
            {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[6,2],[10,2],[10,10],[6,10],[6,2]]]}}
            ]            );

            // это костыль ... надо делать проверку, независимую от порядка, но в mocha этого нет из коробки ..
            result.reverse()
          assert.deepEqual([
            {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[2,3],[7,3],[7,9],[2,9],[2,3]]]}},
            {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[6,2],[10,2],[10,10],[6,10],[6,2]]]}}
            ], result);
        });

        it('Должен отфильтровать полигон, который накрывается целиком тремя пересекающимися полигонами (гео координаты)', function () {
          var result = PolygonAlgs.filterCoveredPolygons([
            {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[4,4],[8,4],[8,8],[4,8],[4,4]]]}},
            {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[2,5],[7,5],[7,9],[2,9],[2,5]]]}},
            {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[2,3],[7,3],[7,5],[2,5],[2,3]]]}},
            {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[6,2],[10,2],[10,10],[6,10],[6,2]]]}}
            ]            );

            // это костыль ... надо делать проверку, независимую от порядка, но в mocha этого нет из коробки ..
            result.reverse()

          assert.deepEqual([
            {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[2,5],[7,5],[7,9],[2,9],[2,5]]]}},
            {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[2,3],[7,3],[7,5],[2,5],[2,3]]]}},
            {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[6,2],[10,2],[10,10],[6,10],[6,2]]]}}
            ], result);
        });


      });
  });
})(PolygonAlgs);
