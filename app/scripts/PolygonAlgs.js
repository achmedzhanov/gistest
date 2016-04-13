var PolygonAlgs = {};

(function (PolygonAlgs, PolyK) {
  "use strict";

  function coordinatesToArray(coordinates) {
    let popLastCoordinates = coordinates.length > 1
        && (coordinates[0][0] == coordinates[coordinates.length-1][0]
        && coordinates[0][1] == coordinates[coordinates.length-1][1])
    let ret = new Array((coordinates.length - (popLastCoordinates ? 1 : 0) ) *2);
    // некогжа выснять порядок вершин - по часовой стрелке или притив часвой
    // поэтому допускаем вольность и ...
    // предполагаем что вершины полигоа расположены по часовой стрелке
    coordinates = coordinates.reverse();

    var i = ret.length/2;
    while(i--) {
      ret[i*2] = coordinates[i][0];
      ret[i*2+1] = coordinates[i][1];
    }
    return ret;
  }

  function isCovered(condidate, destination) {
      //  TODO оптимизация с вписыванием в квадрат!
      let cPoints = condidate.geometry.coordinates[0];
      //TODO кэшируем массив координат
      //TODO первоначальная проверка пересечания (покрытия?) обрамляющих прямоугольников

      let dPoints = coordinatesToArray(destination.geometry.coordinates[0]);
      // TODO кешировать Array
      var covered = true;
      for(var i = 0; i < cPoints.length; i++) {
        // если точка не попадает в проверяемый полигон то false
        if(!PolyK.ContainsPoint(dPoints, cPoints[i][0], cPoints[i][1])) {
          return false;
        }
        // TODO пропускать последнюю точку если она совпадает с первой
      }
      // если проверяемый полигон выпуклый, то достаточно проверить только вхождения точек
      if(PolyK.IsConvex(dPoints)) {
        return true;
      }
      // иначе проверяем пересечение всех ребер
      console.log('Проверка ребер не реализована');
      PolyK.IsConvex(dPoints);
      return false;
  }

  PolygonAlgs.isCovered = isCovered;
})(PolygonAlgs, PolyK);
