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

        it('Должен отфильтровать полигон, который накрывается целиком тремя непоследовательно пересекающимися полигонами (гео координаты)', function () {
          var result = PolygonAlgs.filterCoveredPolygons([
            {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[1,1],[6,1],[6,3],[1,3],[1,1]]]}},
            {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[2,0],[5,0],[5,5],[2,5],[2,0]]]}},
            {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[4,0],[7,0],[7,5],[4,5],[4,0]]]}},
            {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[0,0],[3,0],[3,5],[0,5],[0,0]]]}}
            ]            );

            // это костыль ... надо делать проверку, независимую от порядка, но в mocha этого нет из коробки ..
            result.reverse()

          assert.deepEqual([
            {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[2,0],[5,0],[5,5],[2,5],[2,0]]]}},
            {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[4,0],[7,0],[7,5],[4,5],[4,0]]]}},
            {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[0,0],[3,0],[3,5],[0,5],[0,0]]]}}
            ], result);
        });

        it('Не Должен отфильтровать полигон, который не накрывается', function () {
          var d = [
            {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[2,0],[5,0],[5,5],[2,5],[2,0]]]}},
            {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[4,0],[7,0],[7,5],[4,5],[4,0]]]}},
            {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[0,0],[3,0],[3,5],[0,5],[0,0]]]}},
            {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-55.736721,78.502541],[-76.597969,81.201027],[-74.45649,82.200592],[-53.047604,80.343918],[-55.736721,78.502541]]]}},
            {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[47.954506,80.722702],[70.071335,82.686768],[77.297005,78.996407],[60.34584,77.564949],[47.954506,80.722702]]]}},
            {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-96.827904,19.897907],[-99.194847,20.321608],[-98.84391,22.068865],[-96.44857,21.648794],[-96.827904,19.897907]]]}},
            {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[94.583733,-62.176575],[101.554695,-60.51865],[105.339142,-63.530411],[97.796455,-65.356491],[94.583733,-62.176575]]]}}
          ];
          var result = PolygonAlgs.filterCoveredPolygons(d);

            // это костыль ... надо делать проверку, независимую от порядка, но в mocha этого нет из коробки ..
            result.reverse()

          assert.deepEqual(d, result);
        });

        // it('Должен отфильтровать полигон, который накрывается сложными  полигонами (гео координаты)', function () {
        //   var result = PolygonAlgs.filterCoveredPolygons([
        //     {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-43.946152,-72.285004],[-52.816589,-69.883179],[-46.2789,-67.088402],[-37.960777,-69.195351]]]}},
        //     {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-42.157578,-68.373001],[-34.014065,-66.331345],[-32.010582,-67.366219],[-40.375908,-69.49884]]]}},
        //     {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-15.967052,-72.742828],[-25.01753,-75.577591],[-30.723701,-78.652336],[-45.796516,-76.423859],[-46,-76],[-55.662262,-73.759247],[-59.102505,-72.434914],[-50.278103,-70.024223],[-46.278103,-71.1903],[-36.662262,-73.461143],[-27,-75],[-34.298782,-72.571625],[-40.375385,-69.499153],[-32.007812,-67.365837],[-25.298782,-70.136627]]]}}
        //     ]            );

            // это костыль ... надо делать проверку, независимую от порядка, но в mocha этого нет из коробки ..
            //result.reverse()

          // assert.deepEqual([
          //   {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[2,0],[5,0],[5,5],[2,5],[2,0]]]}},
          //   {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[4,0],[7,0],[7,5],[4,5],[4,0]]]}},
          //   {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[0,0],[3,0],[3,5],[0,5],[0,0]]]}}
          //   ], result);
        //});

      });
  });
})(PolygonAlgs);
