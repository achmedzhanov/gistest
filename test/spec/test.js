(function (PolygonAlgs) {
  'use strict';

  describe('PolygonAlgs', function () {
    describe('#isCovered', function () {
      it('Should return true for covered polygon', function () {
        var p  = {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-56.736721,79.502541],[-76.597969,81.201027],[-74.45649,82.200592],[-53.047604,80.343918],[-56.736721,79.502541]]]}};
        var d = {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-55.736721,78.502541],[-76.597969,81.201027],[-74.45649,82.200592],[-53.047604,80.343918],[-55.736721,78.502541]]]}};
        var result = PolygonAlgs.isCovered(p, d);
        assert.isTrue(result);
      });
      it('Should return true for covered polygon #simple', function () {
        var p  = {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[1,1],[1,4],[4,4],[4,1],[1,1]]]}};
        var d = {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[0,0],[0,5],[5,5],[5,0],[0,0]]]}};;
        var result = PolygonAlgs.isCovered(p, d);
        assert.isTrue(result);
      });

      it('Should return true for covered polygon #simple equals points', function () {
        var p = {"type":"Feature","geometry":{"type":"Polygon","coordinates":[([[0,0],[0,5],[5,5],[5,0],[0,0]])]}};;
        var d = {"type":"Feature","geometry":{"type":"Polygon","coordinates":[([[0,0],[0,5],[5,5],[5,0],[0,0]])]}};
        var result = PolygonAlgs.isCovered(p, d);
        assert.isTrue(result);
      });

      it('Should return true for covered polygon #simple', function () {
        var p  = {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[1,1],[4,1],[4,4],[1,4],[1,1]]]}};
        var d = {"type":"Feature","geometry":{"type":"Polygon","coordinates":[([[0,0],[0,5],[5,5],[5,0],[0,0]])]}};;
        var result = PolygonAlgs.isCovered(p, d);
        assert.isTrue(result);
      });

      it('Should return афдыу for covered polygon #simple clockwise', function () {
        var p  = {"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[1,1],[4,1],[4,4],[1,4],[1,1]]]}};
        var d = {"type":"Feature","geometry":{"type":"Polygon","coordinates":[([[0,0],[0,5],[5,5],[5,0],[0,0]])]}};;
        var result = PolygonAlgs.isCovered(p, d);
        assert.isTrue(result);
      });

    });
  });
})(PolygonAlgs);
