var PolygonAlgs = {};

(function (PolygonAlgs, PolyK) {
  "use strict";

  function coordinatesToArray(coordinates) {
    //пропускаем последнюю точку если она совпадает с первой
    let popLastCoordinates = coordinates.length > 1
        && (coordinates[0][0] == coordinates[coordinates.length-1][0]
        && coordinates[0][1] == coordinates[coordinates.length-1][1])
    let ret = new Array((coordinates.length - (popLastCoordinates ? 1 : 0) ) *2);
    // некогжа выснять порядок вершин - по часовой стрелке или притив часвой
    // поэтому допускаем вольность и ...
    // предполагаем что вершины полигоа расположены по часовой стрелке
    coordinates = coordinates.reverse();

    let i = ret.length/2;
    while(i--) {
      ret[i*2] = coordinates[i][0];
      ret[i*2+1] = coordinates[i][1];
    }
    return ret;
  }

  function getBoundingBox(coordinates) {
    let left = coordinates[0][0];
    let right = left;
    let top = coordinates[0][1];
    let bottom = top;
    let i = coordinates.length;
    while(i-- > 0) {
      left = Math.min(left, coordinates[i][0]);
      right = Math.max(right, coordinates[i][0]);
      bottom = Math.min(bottom, coordinates[i][1]);
      top = Math.max(top, coordinates[i][1]);
    }

    return {left: left, right: right, top: top, bottom: bottom};
  }

  function isCoveredBox(condidateBox, destinationBox) {
    return condidateBox.left >= destinationBox.left
    &&  condidateBox.right <= destinationBox.right
    && condidateBox.bottom >= destinationBox.bottom
    &&  condidateBox.top <= destinationBox.top;
  }

  function isCovered(condidate, destination) {
      let cPoints = condidate.geometry.coordinates[0];

      // быстрая проверка по включению обрамляющего прямоугольника
      if(destination.geometry.cached_boundingBox == undefined) {
        destination.geometry.cached_cached_boundingBox = getBoundingBox(destination.geometry.coordinates[0]);
      }
      condidate.geometry.cached_cached_boundingBox = getBoundingBox(condidate.geometry.coordinates[0]);
      if(!isCoveredBox(condidate.geometry.cached_cached_boundingBox, destination.geometry.cached_cached_boundingBox)) {
        return false;
      }

      // TODO кешировать не должно оказывать побочный эффект на входных данных!

      //кэшируем массив координат
      if(destination.geometry.cached_cArray == undefined) {
        destination.geometry.cached_cArray = coordinatesToArray(destination.geometry.coordinates[0]);
      }
      //кэшируем признак выпуклости
      if(destination.geometry.cached_isConvex == undefined) {
        destination.geometry.cached_isConvex = PolyK.IsConvex(destination.geometry.cached_cArray)
        || PolyK.IsConvex(coordinatesToArray(destination.geometry.coordinates[0].reverse())) ;
      }


      let destinationIsCovex = destination.geometry.cached_isConvex;

      let dPoints = destination.geometry.cached_cArray;

      let covered = true;
      for(let i = 0; i < cPoints.length; i++) {
        // если точка не попадает в проверяемый полигон то false
        if(!PolyK.ContainsPoint(dPoints, cPoints[i][0], cPoints[i][1])) {
          return false;
        }
      }
      // если проверяемый полигон выпуклый, то достаточно проверить только вхождения точек
      if(destinationIsCovex) {
        return true;
      }
      // иначе проверяем пересечение всех ребер
      console.log('Проверка ребер не реализована');

      return false;
  }

  PolygonAlgs.isCovered = isCovered;
})(PolygonAlgs, PolyK);
