"use strict";

google.maps.event.addDomListener(window, 'load', function() {
    var DEFAULT_COORDINATES = new google.maps.LatLng(39.7392, -104.9842);
    var map_options = {
        zoom: 2,
        center: new google.maps.LatLng(39.7392, -104.9842),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var container = document.getElementById('map');
    var map = new google.maps.Map(container, map_options);

    var googlemap = {};
    window.googlemap = googlemap;

    googlemap.getMap = function() {
        return map;
    };
    var markersArray = [];
    function clearOverlays() {
        for (var i = 0; i < markersArray.length; i++ ) {
            markersArray[i].setMap(null);
        }
            markersArray = [];
    }
    googlemap.addPoint = function(attrs) {
        var coords = attrs.pt;
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(coords.latitude, coords.longitude),
            map: map,
            icon: "static/img/twitter-pointer-green.png"
        });


        var content = attrs.html;

        var infowindow = new google.maps.InfoWindow({
            content: content,
            maxWidth: 300
        });

        google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map, marker);
       
     });
         markersArray.push(marker);
    }

    function populateMap(data) {
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
                attr.html = data[i].html;
                var sentiment = (data[i].sentiment == "positive") ? "#05bc1e" : (data[i].sentiment == "neutral") ? "#808080" : "#cf1111";
                attr.title = "<span style=\"color: " + sentiment + "\">" + data[i].sentiment + "</span>";
                attr.description = data[i].tweet + " <br><span class=\"label label-info\">" + data[i].user + "</span>";
                attr.tweet = data[i].tweet;
                //attr.geo = JSON.parse(data[i].geo);
                var coord = JSON.parse(data[i].geo);
                attr.pt = {"latitude": coord.coordinates[0], "longitude": coord.coordinates[1]};


                googlemap.addPoint(attr);
            }
        }
    }

    // Use this variable to store current query string
    var search_query = "";

    function displayLoader() {
        $("#loader").css("visibility", "visible");
    }

    function removeLoader() {
        $("#loader").css("visibility", "hidden");
    }

    $("#search-form").submit(function() {
        $("#loader").css("display", "block");

        search_query = $("#search-query").val();
        console.log("Search query is: " + search_query);
        window.googlemap.getTweets();
        return false;
    });


    googlemap.getTweets = function() {
        displayLoader();
        if(search_query === "")
            $.get("/api/data.json", function(response) { 
                clearOverlays();
                populateMap(response);
                removeLoader();
            },
            "json"
            ).fail(function() {
                console.log("populate map failed");
            }).done(function() {
                // crime layer was added here
            });
        else
            $.get("/api/search.json",
                {query: encodeURIComponent(search_query)},
                function(response) {
                    clearOverlays();
                    populateMap(response);
                    removeLoader();
                },
                "json"
                ).fail(function() {
                    console.log("populate map failed");
                });

        drawTagCloud();
        refreshChart();
    };

    // Initially pull tweets
    googlemap.getTweets();

    // Set up a timer
    window.setInterval(function() {
        googlemap.getTweets();
    }, 60000);
});
