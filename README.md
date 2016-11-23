### Решение тестового задания Видимость полигонов на экране

##Видимость полигонов на экране
#Описание
Требуется сделать страничку с картой, которая:
* Позволяет показать на карте пользовательский GeoJSON, состоящий из набора полигонов. Возможные варианты интерфейса: выбор файла для загрузки, перетаскивание файла на карту, отдельное textarea поле, куда пользователь скопирует свой GeoJSON
* Позволяет отобрать только те полигоны, которые будут видны при отрисовке на экране в случае сплошной заливки. Порядок отрисовки задаётся порядком следования Features в GeoJSON файле. Вариант интерфейса: checkbox, при включении которого на экране остаются только видимые полигоны.

#Замечания
* Пример данных:  http://kosmosnimki.ru/downloads/task1_example.geojson (контура космических снимков Sentinel-1 за 2016 год)
* Для отбора полигонов, в том числе для операций с геометрическими объектами, можно использовать сторонние библиотеки
* Важна скорость работы, допустима небольшая погрешность в точности перекрытия экрана отобранными полигонами 
* Можно предполагать, что все полигоны однокомпонентные без дырок и самопересечений. Координаты в географической проекции (долгота-широта)
