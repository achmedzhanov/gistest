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

        return [left*clipperFactor, bottom*clipperFactor, right*clipperFactor, top*clipperFactor];
    }

    function getBoundingBoxArrayFromClipperPath(coordinates) {
      let left = coordinates[0].X;
      let right = left;
      let top = coordinates[0].Y;
      let bottom = top;
      let i = coordinates.length;
      while (i-- > 0) {
          left = Math.min(left, coordinates[i].X);
          right = Math.max(right, coordinates[i].X);
          bottom = Math.min(bottom, coordinates[i].Y);
          top = Math.max(top, coordinates[i].Y);
      }

      return [left, bottom, right, top];
    }

    function isCoveredBoxArray(candidateBox, destinationBox) {
        return candidateBox[0] >= destinationBox[0] && candidateBox[2] <= destinationBox[2] && candidateBox[3] <= destinationBox[3] && candidateBox[1] >= destinationBox[1];
    }

    function isPointInRect(x, y, a) {
        return x >= a[0] && y >= a[1] && x <= a[2] && y <= a[3];
    }

    function isEqualPaths(paths1, paths2) {
      if(paths1.length != paths2.length) {
          return false;
      }
      //if(ClipperLib.Clipper.Area())
      let i = paths1.length;
      while(i--) {
        if(paths1[i].length != paths2[i].length) {
            return false;
        }
        let j = paths1[i].length;
        while(j--) {
          let k = paths1[i].length;
          let found = false;
          while(k--) {
            if(paths1[i][j].X == paths2[i][k].X
            && paths1[i][j].Y == paths2[i][k].Y) {
                found = true;
                break;
            }
          }
          if(!found) {
            return false;
          }
        }
      }
      return true;
    }

    const clipperFactor = 1;

    function filterCoveredPolygons(features) {
        // для начала простой алгоритм
        // проверям накрывание только одним полигоном
        // посколькку полигоны выпуклые, то чтобы проверить вхождение A в B досаточно проверить что все точки A находятся внутри полигона B

        // идем в обратном порядке
        // пвый полигон виден всегда
        // второй может перекрываться первым и т.д.

        // TODO:perf огрубить точность 3 знака после запятой!

        let ractangles = features.map((f, i) => {
            var a = getBoundingBoxArray(features[i].geometry.coordinates[0]);
            a.push({
                feature: f,
                cArray: undefined,
                isConvex: undefined,
                covered: false,
                index: i,
                clipperPath: toClipperPath(features[i].geometry.coordinates[0])
            });
            return a;
        });


        let tree = rbush(4);
        tree.load(ractangles);

        let filtered = [];
        let current, intersected, j, covered, filteredIntersected;

        //let subj = null, clips = null, union = null, clipper = new ClipperLib.Clipper();
        let clipper = new ClipperLib.Clipper();
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

                let candidate = current;
                let currentIntersected = intersected[j][4];
                let difference = new ClipperLib.Paths();
                clipper.Clear();
                clipper.AddPath(current[4].clipperPath,  ClipperLib.PolyType.ptSubject, true);
                clipper.AddPath(currentIntersected.clipperPath,  ClipperLib.PolyType.ptClip, true);
                clipper.Execute(ClipperLib.ClipType.ctDifference, difference, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
                //console.log('difference', difference);

                // если накрывает целиком, то останавливаем цикл
                if(difference.length == 0) {
                  //-console.log('full covered break * feature:' + currentIntersected.feature);
                  covered = true;
                  break;
                }
                //console.log('intersection[0]', difference[0]);
                //console.log('candidate[4].clipperPath', candidate[4].clipperPath);

                // если не накрывает, но пересекает, то добааляем в список на объединение
                if(!isEqualPaths(difference, [candidate[4].clipperPath])) {
                  //-console.log('partialy covered');
                  filteredIntersected.push(intersected[j]);
                } else {
                  //-console.log('not intersected');
                }
            }

            // если есть перечения
            if(!covered &&  filteredIntersected.length > 0 ) {
                // если больше 1, то проверим покрытие через объединение
                clipper.Clear();
                clipper.AddPath(current[4].clipperPath,  ClipperLib.PolyType.ptSubject, true);
                clipper.AddPaths(filteredIntersected.map((v) => v[4].clipperPath),  ClipperLib.PolyType.ptClip, true);
                let difference = new ClipperLib.Paths();
                clipper.Execute(ClipperLib.ClipType.ctDifference, difference, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
                // если накрыто то устанавливаем флаг
                if(difference.length == 0) {
                  //-console.log('union covered break * ' + filteredIntersected.length);
                  covered = true;
                } else {
                    // иначе делаем объединение и перестраиваем дерево
                    //-console.log('change tree *');
                    //-console.log('tree size ' + tree.all().length);
                    let union = new ClipperLib.Paths();
                    clipper.Execute(ClipperLib.ClipType.ctUnion, union, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
                    if(union.length == 1) {
                        // удаляем полигоны входящие в объединение ...
                        tree.remove(current);
                        for(let k = 0; k < filteredIntersected.length; k++) {
                            tree.remove(filteredIntersected[k]);
                        }

                        //-console.log('union attached ' + filteredIntersected.length + ' ' + filteredIntersected.length);

                        if(ClipperLib.Clipper.Orientation(union[0])) {
                            //-console.log('reverse path');
                            union[0].reverse();
                        }

                        // вставляем объединение
                        let newItem = getBoundingBoxArrayFromClipperPath(union[0]);
                        newItem.push({
                            feature: null,
                            cArray: undefined,
                            isConvex: false,
                            covered: false,
                            index: current[4].index,
                            clipperPath: union[0]
                        });
                        tree.insert(newItem);
                        //-console.log('tree size ' + tree.all().length);
                    } else {
                        console.log('объединение пересекающихся полигонов дало несколько контуров ..' /*, union*/);
                        console.log('subj', JSON.stringify(pathToGeo(current[4].clipperPath)));
                        console.log('clip', JSON.stringify(pathToGeo(filteredIntersected.map((v) => v[4].clipperPath))));
                        console.log('filteredIntersected ' + filteredIntersected.length)
                        //console.log('union', JSON.stringify(pathToGeo(union)));
                        console.log('union length', union.length);
                        //console.log('difference', JSON.stringify(pathToGeo(difference)));
                    }
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

    function pathToGeo(path) {
      return path.map((v) => {
        if(Array.isArray(v))
          return pathToGeo(v);
        return [v.X,v.Y];
      });
    }

    function toClipperPath(coordinates) {
        let result = new Array((coordinates[0][0] == coordinates[coordinates.length - 1][0] && coordinates[0][1] == coordinates[coordinates.length - 1][1]) ? coordinates.length - 1 : coordinates.length);
        let i = result.length;
        while (i--) {
          // если приобразовать к целому числу, то получим прирост около 20%
          result[i] = {
                X: coordinates[i][0] * clipperFactor /* 65536 */ ,
                Y: coordinates[i][1] * clipperFactor /* 65536 */
            }
        }
        if(ClipperLib.Clipper.Orientation(result)) {
            console.log('reverse path');
            result.reverse();
        }
        return result;
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
