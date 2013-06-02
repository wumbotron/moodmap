
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

        map = new Map("map", {
	      center: [-104.87,39.67],
	      zoom: 11,
	      basemap: "streets",
	      autoResize: true
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

        //create a feature collection for the flickr photos
        var featureCollection = {
          "layerDefinition": null,
          "featureSet": {
            "features": [],
            "geometryType": "esriGeometryPoint"
          }
        };
        featureCollection.layerDefinition = {
          "geometryType": "esriGeometryPoint",
          "objectIdField": "ObjectID",
          "drawingInfo": {
            "renderer": {
              "type": "simple",
              "symbol": {
                "type": "esriPMS",
                "url": "/static/img/twitter-pointer-green.png",
                "contentType": "image/png",
                "width": 20,
                "height": 20/*,
                "outline": {
                	"type" : "esriSLS", 
					"style" : "esriSLSSolid", 
					"color" : [110,110,110,255], 
					"width" : 1
                }*/
              }
            }
          },
          "fields": [{
            "name": "ObjectID",
            "alias": "ObjectID",
            "type": "esriFieldTypeOID"
          }, {
            "name": "description",
            "alias": "Description",
            "type": "esriFieldTypeString"
          }, {
            "name": "title",
            "alias": "Title",
            "type": "esriFieldTypeString"
          }]
        };

        //define a popup template
        var popupTemplate = new PopupTemplate({
          title: "{title}",
          description: "{description}"
        });
        
        createFeatureLayer();
        initMap();
		
		function createFeatureLayer() {
	        if(featureLayer) map.removeLayer(featureLayer);
	        //create a feature layer based on the feature collection
	        featureLayer = new FeatureLayer(featureCollection, {
	          id: 'flickrLayer',
	          infoTemplate: popupTemplate
	        });
	
	        //associate the features with the popup on click
	        featureLayer.on("click", function(evt) {
	          map.infoWindow.setFeatures([evt.graphic]);
	        });
	
	        
        }
        var runonce = true;
	    function initMap() {
	    	map.on("layers-add-result", function(results) {
	          if(runonce) {
	          	getInitialTweets();
	          	runonce = false;
	          }
	        });
	        //add the feature layer that contains the tweets to the map
	        
	        map.addLayers([featureLayer]);
	        
	    }

      function getInitialTweets() {
        $.get("/api/data.json", function(data) { 
        	populateMap(data); 
        },
	    "json"
	  	).fail(function() {
	  		console.log("populate map failed");
	  	}).done(function() {
	  		 //console.log('add crime layer');
         var crimeLayer = new esri.layers.FeatureLayer("http://services1.arcgis.com/M8KJPUwAXP8jhtnM/arcgis/rest/services/Hot%20Spots%20DenverCrime2012%20-%20crime/FeatureServer/0", {
              mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
              visible: true
          });
        map.addLayer(crimeLayer, 1);
	  	});

        
        /*var requestHandle = esriRequest({
          url: "http://api.flickr.com/services/feeds/geo?&format=json",
          callbackParamName: "jsoncallback"
        });
        requestHandle.then(requestSucceeded, requestFailed);*/
      }
      
      function populateMap(data) {
	      createFeatureLayer();
	      
	      var features = [];
	      //console.debug('tweets ', data);
	      console.log("data.length: " + data.length);
	      for (var i = 0, length = data.length; i < length; i++) {
	        //console.debug("i=" +i + ", " + data[i].geo.toString());
	        if(data[i].geo.toString() !== "") {
		        var attr = {};
		        attr.tweet_id = data[i].tweet_id;
		        attr.score = data[i].score;
		        attr.user = data[i].user;
		        attr.sentiment = data[i].sentiment;
		        attr.datetime = data[i].datetime;
		        //var sentiment = (data[i].sentiment == "positive") ? "#05bc1e" : 
		        attr.title = data[i].sentiment;
		        attr.description = data[i].tweet + " <br><span class=\"label label-info\">" + data[i].user + "</span>";
		        attr.tweet = data[i].tweet;
		        //attr.geo = JSON.parse(data[i].geo);
		        var coord = JSON.parse(data[i].geo);
		        var pt = {"latitude": coord.coordinates[0], "longitude": coord.coordinates[1]};
		        
		        //console.log(attr.geo.coordinates);
		        var geometry = new Point(pt);
		        
		        var graphic = new Graphic(geometry);
		        graphic.setAttributes(attr);
		        features.push(graphic);
	        }
	        
	      }
	      map.addLayers([featureLayer]);
	      featureLayer.applyEdits(features, null, null);
	      featureLayer.refresh();
	    }
	    

		$("#search-form").submit(function() {
			$("#loader").css("display", "block");
			var data = null;
			if($("#search-query").val() != "") {
				data = { query: encodeURIComponent($("#search-query").val()) }
			}

			$.get("/api/search.json", 
				data, 
				function(data) {
					console.log("Data returned: " + data);
					populateMap(data);
					$("#loader").css("display", "none");
				}, "json").fail(function() {
					console.log("search failed");
				});
			
			drawTagCloud();
			refreshChart();
			
			return false;
		});
	    
	    
});
