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

    googlemap.addPoint = function(attrs) {
        var coords = attrs.pt;

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(coords.latitude, coords.longitude),
            map: map
        });
    };

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

    function updateModel(data) {
        populateMap(data);
        drawTagCloud();
        refreshChart();

        removeLoader();
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
                updateModel(response);
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
                    updateModel(response);
                },
                "json"
                ).fail(function() {
                    console.log("populate map failed");
                });
    };

    // Initially pull tweets
    googlemap.getTweets();

    // Set up a timer
    window.setInterval(function() {
        googlemap.getTweets();
    }, 15000);
});
