var PolygonAlgs = {};

(function (PolygonAlgs, PolyK, rbush, ClipperLib) {
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
    coordinates = coordinates.slice(0).reverse();

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

  function getBoundingBoxArray(coordinates) {
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

    return [left, bottom, right, top];
  }


  function isCoveredBoxArray(candidateBox, destinationBox) {
    return candidateBox[0] >= destinationBox[0]
    &&  candidateBox[2] <= destinationBox[2]
    && candidateBox[3] <= destinationBox[3]
    &&  candidateBox[1] >= destinationBox[1];
  }


  function filterCoveredPolygons(features) {
      // для начала простой алгоритм
      // проверям накрывание только одним полигоном
      // посколькку полигоны выпуклые, то чтобы проверить вхождение A в B досаточно проверить что все точки A находятся внутри полигона B

      // идем в обратном порядке
      // пвый полигон виден всегда
      // второй может перекрываться первым и т.д.


      let ractangles = features.map((f, i) => {
        var a = getBoundingBoxArray(features[i].geometry.coordinates[0]);
        a.push({
          feature: f,
          cArray: undefined,
          isConvex: undefined,
          covered: false,
          index: i});
        return a;
      });


      let tree = rbush(4);
      tree.load(ractangles);

      let filtered = [];
      let current, intersected, j,covered, filteredIntersected;
      for(let i=ractangles.length-1; i>= 0; i--) {
        current = ractangles[i];
        covered = false;
        intersected = tree.search(current);
        //console.log('intersected.length ' + intersected.length);
        filteredIntersected = [];
        for(j = 0; j < intersected.length; j++) {
          if(intersected[j][4].index <= current[4].index ||
              intersected[j][4].covered) {
              continue;
              //console.log('index continue');
          }

          filteredIntersected.push(intersected[j]);

          if(!isCoveredBoxArray(current, intersected[j])) {
              continue;
              //console.log('isCoveredBoxArray continue');
          }

          // TODO здесь надо сделать последовательное отсечение!

          if(_isCovered(current[4], intersected[j][4])) {
              //console.log('_isCovered break');
              covered = true;
              break;
          }
        }

        if(filteredIntersected.length > 1 && !covered) {
          //console.log('MULTI COVERED ' + filteredIntersected.length);
          /*if(filteredIntersected.length > 500) {
            console.log('mega intersection');
            console.log(JSON.stringify(current[4].feature));
            console.log(JSON.stringify(filteredIntersected.map((v) => v[4].feature)));
          }*/

          if(_isCoveredMulti(current, filteredIntersected)) {
            //console.log('multi covered ' + true)
            covered = true;
          }
        }

        if(!covered) {
            filtered.push(current[4]);
        } else {
          current.covered = true;
        }
      }
      console.log('data.length=' + features.length + ' filtered.length=' + filtered.length)
      return filtered.map(v => v.feature);
  }

  function _isCoveredMulti (candidate, destinations) {
    //console.log('_isCoveredMulti');
    //var cpr = new ClipperLib.Clipper();
    //ClipperLib.
    // let c = candidate[4].feature.geometry.coordinates[0].map((v) => ({X: v[0], Y: v[1]}));
    // let d = destination[0][4].feature.geometry.coordinates[0].map((v) => ({X: v[0], Y: v[1]}));
    // let r = ClipperLib.Clipper.MinkowskiDiff(c, d);

    // var subj = [[{X:10,Y:10},{X:110,Y:10},{X:110,Y:110},{X:10,Y:110}],
    //                 [{X:20,Y:20},{X:20,Y:100},{X:100,Y:100},{X:100,Y:20}]];
    // var clips = [[{X:50,Y:50},{X:150,Y:50},{X:150,Y:150},{X:50,Y:150}],
    //                 [{X:60,Y:60},{X:60,Y:140},{X:140,Y:140},{X:140,Y:60}]];



    //  let subj = candidate[4].feature.geometry.coordinates[0].map((v) => ({X: v[0], Y: v[1]}));
    //  let clips = destinations.map((destination) => destination[4].feature.geometry.coordinates[0].map((v) => ({X: v[0], Y: v[1]})));
    //  console.log('clips' , clips);
     //
    //  var union = new ClipperLib.Paths();
    //  var c = new ClipperLib.Clipper();
    //  c.AddPaths(clips,  ClipperLib.PolyType.ptClip, true);
    //  c.Execute(ClipperLib.ClipType.ctUnion, union);
    //  console.log('union' , union);
    //  c.Clear();
     //
    //  var intersection = new ClipperLib.Paths();
    //  console.log('subj' , subj);
    //  c.AddPath(subj,  ClipperLib.PolyType.ptSubject, true);
    //  c.AddPaths(union,  ClipperLib.PolyType.ptClip, true /* true ???? */);
    //  c.Execute(ClipperLib.ClipType.ctIntersection, intersection);
    //  console.log('intersection' , intersection);




     //
    //  let subj = candidate[4].feature.geometry.coordinates[0].map((v) => ({X: v[0], Y: v[1]}));
    //  let clips = destinations.map((destination) => destination[4].feature.geometry.coordinates[0].map((v) => ({X: v[0], Y: v[1]})));
    //  console.log('clips' , clips);
     //
    //  var solution = new ClipperLib.Paths();
    //  var c = new ClipperLib.Clipper();
    //  c.AddPath(subj,  ClipperLib.PolyType.ptSubject, true);
    //  c.AddPaths(clips,  ClipperLib.PolyType.ptClip, true);
    //  c.Execute(ClipperLib.ClipType.ctDifference, solution);
    //  console.log('solution' , solution);

    let scale = (v) => ({X: v[0] * 100 /* 65536 */ , Y: v[1] * 100 /* 65536 */ });

     let subj = candidate[4].feature.geometry.coordinates[0].map(scale);
     let clips = destinations.map((destination) => destination[4].feature.geometry.coordinates[0].map(scale));
     //console.log('clips' , clips);

     var union = new ClipperLib.Paths();
     var c = new ClipperLib.Clipper();
    //  c.AddPath(clips[0],  ClipperLib.PolyType.ptSubject, true);
    //  c.AddPath(clips[1],  ClipperLib.PolyType.ptClip, true);
     c.AddPath(clips[0],  ClipperLib.PolyType.ptSubject, true);
     c.AddPaths(clips.slice(1),  ClipperLib.PolyType.ptClip, true);
     c.Execute(ClipperLib.ClipType.ctUnion, union, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
     //console.log('union' , union);
     //c.Clear();
     c = new ClipperLib.Clipper();

     var difference = new ClipperLib.Paths();
     //console.log('subj' , subj);
     c.AddPath(subj,  ClipperLib.PolyType.ptSubject, true);
     c.AddPaths(union,  ClipperLib.PolyType.ptClip, true /* true ???? */);
     c.Execute(ClipperLib.ClipType.ctDifference, difference);
     //console.log('difference' , difference);

    return difference.length == 0;
  }

  function _isCovered(candidate, destination) {
      //console.log('_isCovered');
      let cPoints = candidate.feature.geometry.coordinates[0];

      // быстрая проверка по включению обрамляющего прямоугольника
      // if(!isCoveredBox(candidate.boundingBox, destination.boundingBox)) {
      //   return false;
      // }

      //кэшируем массив координат
      if(destination.cArray == undefined) {
        destination.cArray = coordinatesToArray(destination.feature.geometry.coordinates[0]);
      }
      //кэшируем признак выпуклости
      if(destination.isConvex == undefined) {
        destination.isConvex = PolyK.IsConvex(destination.cArray)
        || PolyK.IsConvex(coordinatesToArray(destination.feature.geometry.coordinates[0].slice(0).reverse())) ;
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

})(PolygonAlgs, PolyK, rbush, ClipperLib);
