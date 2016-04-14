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

  function isCoveredBox(candidateBox, destinationBox) {
    return candidateBox.left >= destinationBox.left
    &&  candidateBox.right <= destinationBox.right
    && candidateBox.bottom >= destinationBox.bottom
    &&  candidateBox.top <= destinationBox.top;
  }


  function filterCoveredPolygons(features) {
      // для начала простой алгоритм
      // проверям накрывание только одним полигоном
      // посколькку полигоны выпуклые, то чтобы проверить вхождение A в B досаточно проверить что все точки A находятся внутри полигона B

      // идем в обратном порядке
      // пвый полигон виден всегда
      // второй может перекрываться первым и т.д.

      let filtered = [];
      for(let i=features.length-1; i>= 0; i--) {
        let target = {
          feature: features[i],
          boundingBox: getBoundingBox(features[i].geometry.coordinates[0])
        };

        let fIdx = filtered.length;
        let covered = false;
        while (fIdx--) {
          if(_isCovered(target, filtered[fIdx])) {
            covered = true;
            break;
          }
        }

        if(!covered) {
          filtered.push(target);
        }
      }
      console.log('data.length=' + features.length + ' filtered.length=' + filtered.length)
      return filtered.map((v) => v.feature);
  }

  function _isCovered(candidate, destination) {
      let cPoints = candidate.feature.geometry.coordinates[0];

      // быстрая проверка по включению обрамляющего прямоугольника
      if(destination.boundingBox == undefined) {
        throw "assert: expected boundingBox";
      }
      if(candidate.boundingBox == undefined) {
        throw "assert: expected boundingBox";
      }
      if(!isCoveredBox(candidate.boundingBox, destination.boundingBox)) {
        return false;
      }

      //кэшируем массив координат
      if(destination.cArray == undefined) {
        destination.cArray = coordinatesToArray(destination.feature.geometry.coordinates[0]);
      }
      //кэшируем признак выпуклости
      if(destination.isConvex == undefined) {
        destination.isConvex = PolyK.IsConvex(destination.cArray)
        || PolyK.IsConvex(coordinatesToArray(destination.feature.geometry.coordinates[0].reverse())) ;
      }

      let covered = true;
      for(let i = 0; i < cPoints.length; i++) {
        // если точка не попадает в проверяемый полигон то false
        if(!PolyK.ContainsPoint(destination.cArray, cPoints[i][0], cPoints[i][1])) {
          return false;
        }
      }
      // если проверяемый полигон выпуклый, то достаточно проверить только вхождения точек
      if(destination.isConvex) {
        return true;
      }
      // иначе проверяем пересечение всех ребер
      console.log('Проверка ребер не реализована');

      return false;
  }

  function isCovered(candidate, destination) {
    return _isCovered({feature: candidate, boundingBox: getBoundingBox(candidate.geometry.coordinates[0])},
                      {feature: destination, boundingBox: getBoundingBox(destination.geometry.coordinates[0])});
  }

  PolygonAlgs.isCovered = isCovered;
  PolygonAlgs.filterCoveredPolygons = filterCoveredPolygons;

})(PolygonAlgs, PolyK);
