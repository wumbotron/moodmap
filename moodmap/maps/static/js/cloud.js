var dojoConfig = { parseOnLoad: true };
      var map;
      require([
        "esri/map",
        "esri/layers/FeatureLayer",
        "esri/dijit/PopupTemplate",
        "esri/request",
        "esri/geometry/Point",
        "esri/graphic",
        "dojo/on",
        "dojo/_base/array",
        "dojo/domReady!"
      ], function(
        Map, 
        FeatureLayer, 
        PopupTemplate,
        esriRequest,
        Point,
        Graphic,
        on,
        array
      ) {

        var featureLayer;

        map = new Map("map", {
          basemap: "osm",
          center: [-46.807, 32.553],
          zoom: 3
        });

        //hide the popup if its outside the map's extent
        map.on("mouse-drag", function(evt) {
          if (map.infoWindow.isShowing) {
            var loc = map.infoWindow.getSelectedFeature().geometry;
            if (!map.extent.contains(loc)) {
              map.infoWindow.hide();
            }
          }
        });

        drawTagCloud();

      });

function drawTagCloud() {
  var word_array = [
          {text: "Lorem", weight: 8},
          {text: "Ipsum", weight: 9, link: "http://jquery.com/"},
          {text: "Dolor", weight: 3, html: {title: "I can haz any html attribute"}},
          {text: "Sit", weight: 2},
          {text: "Amet", weight: 5}
          // ...as many words as you want
      ];

  $("#jqtagcloud").jQCloud(word_array);

}