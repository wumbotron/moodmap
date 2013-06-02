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
	      center: [-104.87,39.67],
	      zoom: 5,//11,
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
                "url": "/static/img/twitter-icon-green.png",
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

        //create a feature layer based on the feature collection
        featureLayer = new FeatureLayer(featureCollection, {
          id: 'flickrLayer',
          infoTemplate: popupTemplate
        });

        //associate the features with the popup on click
        featureLayer.on("click", function(evt) {
          map.infoWindow.setFeatures([evt.graphic]);
        });

        map.on("layers-add-result", function(results) {
          requestPhotos();
        });
        //add the feature layer that contains the flickr photos to the map
        map.addLayers([featureLayer]);

      function requestPhotos() {
        //get geotagged photos from flickr
        //tags=flower&tagmode=all
        var requestHandle = esriRequest({
          url: "http://api.flickr.com/services/feeds/geo?&format=json",
          callbackParamName: "jsoncallback"
        });
        requestHandle.then(requestSucceeded, requestFailed);
      }

      function requestSucceeded(response, io) {
        //loop through the items and add to the feature layer
        var features = [];
        array.forEach(response.items, function(item) {
          var attr = {};
          attr["description"] = item.description;
          attr["title"] = item.title ? item.title : "Flickr Photo";

          var geometry = new Point(item);

          var graphic = new Graphic(geometry);
          graphic.setAttributes(attr);
          features.push(graphic);
        });

        featureLayer.applyEdits(features, null, null);
      }

      function requestFailed(error) {
        console.log('failed');
      }
    });