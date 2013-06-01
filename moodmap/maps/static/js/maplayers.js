var map;
var heatLayer;
var featureLayer;

require(["esri/map", "esri/layers/FeatureLayer", "dojo/domReady!"], function(Map) { 
	// map = new Map("mapDiv", {
 //      center: [-56.049, 38.485],
 //      zoom: 3,
 //      basemap: "streets"
 //    });

	console.log('init the map');
    init();

    // get the features within the current extent from the feature layer
    function getFeatures() {
        // set up query
        var query = new esri.tasks.Query();
        // only within extent
        query.geometry = map.extent;
        // give me all of them!
        query.where = "1=1";
        // make sure I get them back in my spatial reference
        query.outSpatialReference = map.spatialReference;
        // get em!
        featureLayer.queryFeatures(query, function (featureSet) {
            var data = [];
            // if we get results back
            if (featureSet && featureSet.features && featureSet.features.length > 0) {
                // set data to features
                data = featureSet.features;
            }
            // set heatmap data
            heatLayer.setData(data);
        });
    }

	function init() {
	    // initial extent of map
	    var initExtent = new esri.geometry.Extent({
	        xmax: -13624229.32056175,
	        xmin: -13625120.886837104,
	        ymax: 4548374.604660432,
	        ymin: 4547966.144290476,
	        "spatialReference": {
	            "wkid": 102100
	        }
	    });
	    // create map
	    map = new esri.Map("map", {
	        extent: initExtent,
	        sliderStyle: "small"
	    });
	    //Add the topographic layer to the map. View the ArcGIS Online site for services http://arcgisonline/home/search.html?t=content&f=typekeywords:service
	    var basemap = new esri.layers.ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer");
	    map.addLayer(basemap);
	    // once map is loaded
	    dojo.connect(map, 'onLoad', function (theMap) {
	    	console.log('map onLoad');
	        //resize the map when the browser resizes
	        dojo.connect(dijit.byId('map'), 'resize', map, map.resize);
	        // create heat layer
	        heatLayer = new HeatmapLayer({
	            config: {
	                "useLocalMaximum": true,
	                "radius": 40,
	                "gradient": {
	                    0.45: "rgb(000,000,255)",
	                    0.55: "rgb(000,255,255)",
	                    0.65: "rgb(000,255,000)",
	                    0.95: "rgb(255,255,000)",
	                    1.00: "rgb(255,000,000)"
	                }
	            },
	            "map": map,
	            "domNodeId": "heatLayer",
	            "opacity": 0.85
	        });
	        // add heat layer to map
	        map.addLayer(heatLayer);
	        // resize map
	        map.resize();
	        // create feature layer to get the points from
	        featureLayer = new esri.layers.FeatureLayer("http://servicesbeta.esri.com/arcgis/rest/services/SanFrancisco/SFStreetTreesRendered/MapServer/0", {
	            mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
	            visible: false
	        });
	        map.addLayer(featureLayer);
	        // get features from this layer
	        getFeatures();
	        // on map extent change
	        dojo.connect(map, "onExtentChange", getFeatures);
	        dojo.connect(dojo.byId('tog'), "onclick", function () {
	            if (heatLayer.visible) {
	                heatLayer.hide();
	            } else {
	                heatLayer.show();
	            }
	        });
	        dojo.connect(dojo.byId('tog2'), "onclick", function () {
	            if (featureLayer.visible) {
	                featureLayer.hide();
	            } else {
	                featureLayer.show();
	            }
	        });
	        dojo.connect(dojo.byId('tog3'), "onclick", function () {
	            if (heatLayer.config.useLocalMaximum) {
	                this.innerHTML = 'Local Max Off'
	                heatLayer.config.useLocalMaximum = false;
	            } else {
	                this.innerHTML = 'Local Max On'
	                heatLayer.config.useLocalMaximum = true;
	            }
	        });
	    });
	}

});

           

            
            