var dojoConfig = { parseOnLoad: true };
      var map;
      require([
        "esri/map",
        "esri/layers/FeatureLayer",
        "esri/dijit/PopupTemplate",
        "esri/dijit/Legend",
        "esri/dijit/Scalebar",
        "esri/request",
        "esri/geometry/Point",
        "esri/graphic",
        "esri/arcgis/utils",
        "dojo/on",
        "dojo/_base/array",
        "dojo/domReady!"
      ], function(
        Map, 
        FeatureLayer, 
        PopupTemplate,
        Legend,
        Scalebar,
        esriRequest,
        Point,
        Graphic,
        Utils,
        on,
        array
      ) {
        var featureLayer;

       //  map = new Map("map", {
	      // center: [-104.87,39.67],
	      // zoom: 11,
	      // basemap: "streets",
	      // autoResize: true

        var webmapid = "c3a6575205f547788347229fde9c8fb1";

        esri.arcgis.utils.createMap(webmapid, "aboutmap").then(function(response){
          map = response.map;

          var legend = new esri.dijit.Legend({
            map:map,
            layerInfos:(esri.arcgis.utils.getLegendLayers(response))
          },"legend");
          legend.startup();  
        });

	    });

        //hide the popup if its outside the map's extent
        // map.on("mouse-drag", function(evt) {
        //   if (map.infoWindow.isShowing) {
        //     var loc = map.infoWindow.getSelectedFeature().geometry;
        //     if (!map.extent.contains(loc)) {
        //       map.infoWindow.hide();
        //     }
        //   }
        // });

  