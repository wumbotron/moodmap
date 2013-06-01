var map;

require(["esri/map", "dojo/domReady!"], function(Map) { 
	map = new Map("mapDiv", {
      center: [-104.87,39.67],
      zoom: 11,
      basemap: "streets",
      autoResize: true
    });
});
