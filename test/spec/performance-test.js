(function (PolygonAlgs, window) {
  'use strict';

  function run(data, description) {
    var start = performance.now();
    console.log('run filterCoveredPolygons ' + description);
    var result = PolygonAlgs.filterCoveredPolygons(data);
    console.log('filterCoveredPolygons ' + description + ': '  +  (performance.now() - start) + 'ms');
  }

  describe('PolygonAlgs', function () {
      describe('#filterCoveredPolygons', function () {

        var datas = [
          [window.data100, '100' ],
          [window.data1000, '1000' ],
          [window.data2000, '2000' ],
          [window.data5000, '5000' ]
        ];
        for (let d of datas) {
          let [data, description] = d;
          it(description, function() {
            run(data, description);
          });
        }
      });

  });
})(PolygonAlgs, window);
