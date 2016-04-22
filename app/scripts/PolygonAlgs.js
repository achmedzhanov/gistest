var PolygonAlgs = {};

(function(PolygonAlgs, PolyK, rbush, ClipperLib) {
    "use strict";


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

    // множитель задает точность вычислений перекрытий полигонов
    // 1 - 0 знаков после запятой
    // 10 -1 знак после запятой
    // 100 - 2 знака после запятой
    const clipperFactor = 10;

    function filterCoveredPolygons(features) {
        // алгоритм вычисления
        // 1. Для каждого полиговы вычисляется обрамляющий прямоугольник
        // 2. По прямоугольникам строим пространственный индекс
        // 3. Для каждого тполигона:
        // 3.1 Через пространственный индекс находим список полиговнов, с которыми данный полигон может пересекаться
        // 3.2 Из списка удалем те, которые ужгое невилимы и которые рисуются после данного полигона
        // 3.3 Последовательно вычитаем из данного полигона полингоы из спеска, если результат вычитания пустой считаем чтоданный  поллигон невилим

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

        // строим пространственный индекс
        let tree = rbush(4);
        tree.load(ractangles);

        let filtered = [];
        let current, intersected, j, covered, filteredIntersected;
        let clipper = new ClipperLib.Clipper();
        for (let i = ractangles.length - 1; i >= 0; i--) {
            current = ractangles[i];
            covered = false;
            // поиск в пространственном индексе
            intersected = tree.search(current);
            //console.log('intersected.length ' + intersected.length);
            filteredIntersected = [];
            let currentDifference = [current[4].clipperPath];

            for (j = 0; j < intersected.length; j++) {
                if (intersected[j][4].index <= current[4].index ||
                    intersected[j][4].covered) {
                    continue;
                }

                let candidate = current;
                let currentIntersected = intersected[j][4];
                let difference = new ClipperLib.Paths();
                clipper.Clear();
                clipper.AddPaths(currentDifference,  ClipperLib.PolyType.ptSubject, true);
                clipper.AddPath(currentIntersected.clipperPath,  ClipperLib.PolyType.ptClip, true);
                clipper.Execute(ClipperLib.ClipType.ctDifference, difference /*, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero*/);
                //console.log('* diff 1');
                //console.log('difference', difference);


                // если накрывает целиком, то останавливаем цикл
                if(difference.length == 0) {
                  //console.log('* difference=0');
                  covered = true;
                  break;
                }

                currentDifference = difference;

                // ориентация результат вычитания может быть другой
                // поэтому приводим ее к общей
                if(ClipperLib.Clipper.Orientation(currentDifference)) {
                    //console.log('reverse diff path');
                    ClipperLib.Clipper.ReversePaths(currentDifference);
                    //currentDifference.reverse();
                }
            }

            if (!covered) {
                filtered.push(current[4]);
            } else {
                current.covered = true;
            }
        }

        console.log(`filterCoveredPolygons: Количество полигонов ${features.length}, видимые  ${filtered.length}`);
        return filtered.map(v => v.feature);
    }

    function toClipperPath(coordinates) {
        let result = new Array((coordinates[0][0] == coordinates[coordinates.length - 1][0] && coordinates[0][1] == coordinates[coordinates.length - 1][1]) ? coordinates.length - 1 : coordinates.length);
        let i = result.length;
        while (i--) {
          // если умножать координаты, то фильтруется меньше полигонов и дольше
          // почему непонятно ...
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

    PolygonAlgs.filterCoveredPolygons = filterCoveredPolygons;

})(PolygonAlgs, PolyK, rbush, ClipperLib);
