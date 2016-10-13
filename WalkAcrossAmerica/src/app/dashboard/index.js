import '../../../ammap/maps/js/worldHigh.js'

export default class DashboardCtrl {
  constructor($http, $stomp) {

    let paretoChart;
    let paretoBarGraph;
    let paretoLine;

    const writeAlarmPareto = data => {
      const {
        total,
        alarms
      } = data;

      // Set cumulative percentage
      let runningTotal = 0;

      alarms.forEach(alarm => {
        runningTotal += alarm.count;
        alarm.cumulativePercentage = runningTotal / total * 100;
      });

      paretoChart.dataProvider = alarms;
      paretoChart.write('pareto');
      paretoChart.validateData();
    };

    AmCharts.handleLoad();

    // Alarm pareto
    AmCharts.ready(() => {
      paretoChart = new AmCharts.AmSerialChart();
      paretoChart.categoryField = "name";

      var yAxis = new AmCharts.ValueAxis();
      yAxis.position = "left";
      paretoChart.addValueAxis(yAxis);

      var yAxis2 = new AmCharts.ValueAxis();
      yAxis2.position = "right";
      paretoChart.addValueAxis(yAxis2);

      paretoBarGraph = new AmCharts.AmGraph();
      paretoBarGraph.valueField = "count";
      paretoBarGraph.type = "column";
      paretoBarGraph.fillAlphas = 1;
      paretoBarGraph.lineColor = "#f0ab00";
      paretoBarGraph.valueAxis = yAxis;
      paretoChart.addGraph(paretoBarGraph);

      paretoLine = new AmCharts.AmGraph();
      paretoLine.valueField = "cumulativePercentage";
      paretoLine.type = "line";
      paretoLine.lineColor = "#cb0044";
      paretoLine.valueAxis = yAxis2;
      paretoChart.addGraph(paretoLine);

      paretoChart.write('pareto');

      $http.get("http://localhost:8081/dashboard/pareto")
        .then(response => writeAlarmPareto(response.data));
    });

    AmCharts.isReady = true;

    // Map
    var map = AmCharts.makeChart( "map", {
      /**
       * this tells amCharts it's a map
       */
      "type": "map",

      /**
       * create data provider object
       * map property is usually the same as the name of the map file.
       * getAreasFromMap indicates that amMap should read all the areas available
       * in the map data and treat them as they are included in your data provider.
       * in case you don't set it to true, all the areas except listed in data
       * provider will be treated as unlisted.
       */
      "dataProvider": {
        "map": "worldHigh",
        "getAreasFromMap": true
      },

      /**
       * create areas settings
       * autoZoom set to true means that the map will zoom-in when clicked on the area
       * selectedColor indicates color of the clicked area.
       */
      "areasSettings": {
        "autoZoom": true,
        "selectedColor": "#3095b4",
        "color": "#5c7f92",
        "rollOverOutlineColor": "#8e258d"
      },

      /**
       * let's say we want a small map to be displayed, so let's create it
       */
      "smallMap": {
        "backgroundColor": "#8b8178",
        "mapColor": "#d5d2ca"
      },

      "zoomControl": {
        "buttonRollOverColor": "#d5d2ca"
      },

      "imagesSettings": {
        "labelColor": "#8b8178",
        "labelRollOverColor": "#8e258d"
      }
    } );

    this.alarms = {
      urgent: 1,
      warning: 10,
      information: 100,
      maintenance: 1000
    };

    // Color array to correspond with the MapPoint.state property
    const colors = [
      "#8b8178",
      "#a0d200",
      "#cb0044",
      "#f0ab00"
    ];

    $http.get("http://localhost:8081/dashboard/map")
      .then(response => {
        /*
          Create two circles for each map point.
          The top image has a thick white outline.
          The bottom image is larger with no outline.
          The effect is like a "bull's eye", so there's a circle with a colored ring, white ring, and colored center.
          This is easier to stop on the map than a solid circle.
         */
        const images = response.data.map(point => {
          console.log("map point "  + JSON.stringify( point ) );  
          return {
            latitude: point.latitude,
            longitude: point.longitude,
            title: point.name,
            color: colors[point.state],
            idBase: point.id,
            id: `${point.id}.1`
          }
        });

        images.forEach(image => {
          image.type = "circle";
          image.scale = 1.125;
          image.outlineColor = "#FFFFFF";
          image.outlineThickness = 3;
        });

        // Place the larger circle under the smaller one by inserting at the beginning of the array.
        images.unshift(...images.map(image => {
          return {
            latitude: image.latitude,
            longitude: image.longitude,
            type: image.type,
            color: image.color,
            title: image.title,
            scale: 1.75,
            bringForwardOnHover: false,
            id: `${image.idBase}.2`
          }
        }));

        map.dataProvider.images = images;
        map.validateData();
      });

    $stomp.connect('http://localhost:8081/dashboard')
      .then(() => {
        $stomp.subscribe('/topic/map', points => {
          points.forEach(point => {
            console.log(`${point.name} state = ${point.state}`);
            console.log("point in JSON "+ JSON.stringify(point) );
            
            // Change the color for each map point. Re-render the #2 circle first to preserve the z-order.
            for (let i = 2; i >= 1; i--) {
              var objectId = `${point.id}.${i}`;
              console.log("object by id "+  objectId );
              const image = map.getObjectById(objectId);
              image.color = colors[point.state];
              image.validate();
            }
          })
        })
      })
  }
}

DashboardCtrl.$inject = ['$http', '$stomp'];