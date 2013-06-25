"use strict";

(function() {
    var DEFAULT_COORDINATES = new google.maps.LatLng(39.7392, -104.9842)
    google.maps.event.addDomListener(window, 'load', function() {
        var map_options = {
            zoom: 2,
            center: new google.maps.LatLng(39.7392, -104.9842),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        var container = document.getElementById('map');
        var map = new google.maps.Map(container, map_options);

        window.googlemap = {
            map: map
        };
    });
})();
