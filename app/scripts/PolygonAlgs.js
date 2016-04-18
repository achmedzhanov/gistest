var PolygonAlgs = {};

(function(PolygonAlgs, PolyK, rbush, ClipperLib) {
    "use strict";

    function coordinatesToArray(coordinates) {
        //пропускаем последнюю точку если она совпадает с первой
        let popLastCoordinates = coordinates.length > 1 && (coordinates[0][0] == coordinates[coordinates.length - 1][0] && coordinates[0][1] == coordinates[coordinates.length - 1][1])
        let ret = new Array((coordinates.length - (popLastCoordinates ? 1 : 0)) * 2);
        // некогжа выснять порядок вершин - по часовой стрелке или притив часвой
        // поэтому допускаем вольность и ...
        // предполагаем что вершины полигоа расположены по часовой стрелке
        coordinates = coordinates.slice(0).reverse();

        let i = ret.length / 2;
        while (i--) {
            ret[i * 2] = coordinates[i][0];
            ret[i * 2 + 1] = coordinates[i][1];
        }
        return ret;
    }

    function getBoundingBox(coordinates) {
        let left = coordinates[0][0];
        let right = left;
        let top = coordinates[0][1];
        let bottom = top;
        let i = coordinates.length;
        while (i-- > 0) {
            left = Math.min(left, coordinates[i][0]);
            right = Math.max(right, coordinates[i][0]);
            bottom = Math.min(bottom, coordinates[i][1]);
            top = Math.max(top, coordinates[i][1]);
        }

        return {
            left: left,
            right: right,
            top: top,
            bottom: bottom
        };
    }

    function isCoveredBox(candidateBox, destinationBox) {
        return candidateBox.left >= destinationBox.left && candidateBox.right <= destinationBox.right && candidateBox.bottom >= destinationBox.bottom && candidateBox.top <= destinationBox.top;
    }

    function getBoundingBoxArray(coordinates) {
        let left = coordinates[0][0];
        let right = left;
        let top = coordinates[0][1];
        let bottom = top;
        let i = coordinates.length;
        while (i-- > 0) {
            left = Math.min(left, coordinates[i][0]);
            right = Math.max(right, coordinates[i][0]);
            bottom = Math.min(bottom, coordinates[i][1]);
            top = Math.max(top, coordinates[i][1]);
        }

        return [left, bottom, right, top];
    }


    function isCoveredBoxArray(candidateBox, destinationBox) {
        return candidateBox[0] >= destinationBox[0] && candidateBox[2] <= destinationBox[2] && candidateBox[3] <= destinationBox[3] && candidateBox[1] >= destinationBox[1];
    }

    function isPointInRect(x, y, a) {
        return x >= a[0] && y >= a[1] && x <= a[2] && y <= a[3];
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
                index: i
            });
            return a;
        });


        let tree = rbush(4);
        tree.load(ractangles);

        let filtered = [];
        let current, intersected, j, covered, filteredIntersected;
        for (let i = ractangles.length - 1; i >= 0; i--) {
            current = ractangles[i];
            covered = false;
            intersected = tree.search(current);
            //console.log('intersected.length ' + intersected.length);
            filteredIntersected = [];
            for (j = 0; j < intersected.length; j++) {
                if (intersected[j][4].index <= current[4].index ||
                    intersected[j][4].covered) {
                    continue;
                    //console.log('index continue');
                }

                filteredIntersected.push(intersected[j]);

                if (!isCoveredBoxArray(current, intersected[j])) {
                    continue;
                    //console.log('isCoveredBoxArray continue');
                }

                // TODO здесь надо сделать последовательное отсечение!

                if (_isCovered(current[4], intersected[j][4])) {
                    //console.log('_isCovered break');
                    covered = true;
                    break;
                }
            }

            if (filteredIntersected.length > 1 && !covered) {
                //console.log('MULTI COVERED ' + filteredIntersected.length);
                /*if(filteredIntersected.length > 500) {
                  console.log('mega intersection');
                  console.log(JSON.stringify(current[4].feature));
                  console.log(JSON.stringify(filteredIntersected.map((v) => v[4].feature)));
                }*/

                if (_isCoveredMulti(current, filteredIntersected)) {
                    //console.log('multi covered ' + true)
                    covered = true;
                }
            }

            if (!covered) {
                filtered.push(current[4]);
            } else {
                current.covered = true;
            }
        }
        console.log('data.length=' + features.length + ' filtered.length=' + filtered.length)
        return filtered.map(v => v.feature);
    }

    function toClipperPath(coordinates) {
        let result = new Array((coordinates[0][0] == coordinates[coordinates.length - 1][0] && coordinates[0][1] == coordinates[coordinates.length - 1][1]) ? coordinates.length - 1 : coordinates.length);
        let i = result.length;
        while (i--) {
            result[i] = {
                X: coordinates[i][0] * 100 /* 65536 */ ,
                Y: coordinates[i][1] * 100 /* 65536 */
            }
        }
        return result;
    }

    function _isCoveredMulti(candidate, destinations) {
        console.log('_isCoveredMulti');

        // проверям попадают ли все вершины в множетство прямоугольников из пересечений

        // let cc = candidate[4].feature.geometry.coordinates[0];
        // let included = false;
        // for(let i = 0; i < cc.length; i++) {
        //   false;
        //   for(let j = 0; j < destinations.length; j++) {
        //     if(isPointInRect(cc[i][0], cc[i][1], destinations[j])) {
        //       included = true;
        //       break;
        //     }
        //   }
        //   if(!included) {
        //     //console.log('cc false');
        //     return false;
        //   }
        // }

      //   let subj = toClipperPath(candidate[4].feature.geometry.coordinates[0]);
      //   // let filteredDestinations = [];
      //   // let cc = candidate[4].feature.geometry.coordinates[0];
      //   // let included = false;
      //   // for(let j = 0; j < destinations.length; j++) {
      //   //     included = false;
      //   //     for(let i = 0; i < cc.length; i++) {
      //   //         if(isPointInRect(cc[i][0], cc[i][1], destinations[j])) {
      //   //           included = true;
      //   //           break;
      //   //         }
      //   //     }
      //   //     if(included) {
      //   //         filteredDestinations.push(destinations[j]);
      //   //     }
      //   // }
      //   //console.log('filteredDestinations ' + filteredDestinations.length + ' destinations ' + destinations.length);
      //   //let clips = filteredDestinations.map((destination) => toClipperPath(destination[4].feature.geometry.coordinates[0]));
      //   let clips = destinations.map((destination) => toClipperPath(destination[4].feature.geometry.coordinates[0]));
      //   // if(clips.length > 50) {
      //   //   return false;
      //   // }
       //
      //   //console.log('call clipper ' + Math.round(clips.length / 100));
      //   var p = performance.now();
      //   var c = new ClipperLib.Clipper();
       //
      //   var difference = new ClipperLib.Paths();
      //   //console.log('subj' , subj);
      //   c.AddPath(subj, ClipperLib.PolyType.ptSubject, true);
      //   c.AddPaths(clips, ClipperLib.PolyType.ptClip, true);
      //   if (!c.Execute(ClipperLib.ClipType.ctIntersection, difference, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero)) {
      //       console.log('Clipper Execute failed');
      //       return false;
      //   }
       //
      //   //console.log('clipper execution ' + (performance.now() - p));
       //
      //   //console.log('difference' , difference);
       //
      //  return difference.length == 0;



        let subj = toClipperPath(candidate[4].feature.geometry.coordinates[0]);
        let clips = destinations.map((destination) => toClipperPath(destination[4].feature.geometry.coordinates[0]));
        var union = new ClipperLib.Paths();
        var c = new ClipperLib.Clipper();
        //  c.AddPath(clips[0],  ClipperLib.PolyType.ptSubject, true);
        //  c.AddPath(clips[1],  ClipperLib.PolyType.ptClip, true);
        c.AddPath(clips[0],  ClipperLib.PolyType.ptSubject, true);
        c.AddPaths(clips.slice(1),  ClipperLib.PolyType.ptClip, true);
        c.Execute(ClipperLib.ClipType.ctUnion, union, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);

        // TODO:perf надо накапдивать unions в дереве и дополнять их
        // тогда все будет пучком ...
        // TODO:perf другие типы заливок
        // TODO:perf попробовать попарное объединение вместо массового
        // TODO:perf попробовать последовательное отсечение вместо массового

        //console.log('union' , union);
        //c.Clear();
        c = new ClipperLib.Clipper();

        var difference = new ClipperLib.Paths();
        //console.log('subj' , subj);
        c.AddPath(subj,  ClipperLib.PolyType.ptSubject, true);
        c.AddPaths(union,  ClipperLib.PolyType.ptClip, true /* true ???? */);
        //c.Execute(ClipperLib.ClipType.ctDifference, difference);
        callDiff(c, difference);
        //console.log('difference' , difference);

        return difference.length == 0;
    }

    function callDiff(c, difference) {
      return c.Execute(ClipperLib.ClipType.ctDifference, difference);
    }

    function _isCovered(candidate, destination) {
        //console.log('_isCovered');
        let cPoints = candidate.feature.geometry.coordinates[0];

        // быстрая проверка по включению обрамляющего прямоугольника
        // if(!isCoveredBox(candidate.boundingBox, destination.boundingBox)) {
        //   return false;
        // }

        //кэшируем массив координат
        if (destination.cArray == undefined) {
            destination.cArray = coordinatesToArray(destination.feature.geometry.coordinates[0]);
        }
        //кэшируем признак выпуклости
        if (destination.isConvex == undefined) {
            destination.isConvex = PolyK.IsConvex(destination.cArray) || PolyK.IsConvex(coordinatesToArray(destination.feature.geometry.coordinates[0].slice(0).reverse()));
        }

        let covered = true;
        for (let i = 0; i < cPoints.length; i++) {
            // если точка не попадает в проверяемый полигон то false
            if (!PolyK.ContainsPoint(destination.cArray, cPoints[i][0], cPoints[i][1])) {
                return false;
            }
        }
        // если проверяемый полигон выпуклый, то достаточно проверить только вхождения точек
        if (destination.isConvex) {
            return true;
        }
        // иначе проверяем пересечение всех ребер
        console.log('Проверка ребер не реализована');

        return false;
    }

    function isCovered(candidate, destination) {
        return _isCovered({
            feature: candidate,
            boundingBox: getBoundingBox(candidate.geometry.coordinates[0])
        }, {
            feature: destination,
            boundingBox: getBoundingBox(destination.geometry.coordinates[0])
        });
    }

    PolygonAlgs.isCovered = isCovered;
    PolygonAlgs.filterCoveredPolygons = filterCoveredPolygons;

})(PolygonAlgs, PolyK, rbush, ClipperLib);
