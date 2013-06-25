
var map;
var featureLayer;


function getInitialTweets() {
  $.get("/api/data.json", function(data) { 
  	populateMap(data); 
  },
  "json"
  ).fail(function() {
  	console.log("populate map failed");
  }).done(function() {
  	// crime layer was added here
  });
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
      var sentiment = (data[i].sentiment == "positive") ? "#05bc1e" : (data[i].sentiment == "neutral") ? "#808080" : "#cf1111";
      attr.title = "<span style=\"color: " + sentiment + "\">" + data[i].sentiment + "</span>";
      attr.description = data[i].tweet + " <br><span class=\"label label-info\">" + data[i].user + "</span>";
      attr.tweet = data[i].tweet;
      //attr.geo = JSON.parse(data[i].geo);
      var coord = JSON.parse(data[i].geo);
      var pt = {"latitude": coord.coordinates[0], "longitude": coord.coordinates[1]};
      
      //console.log(attr.geo.coordinates)
      add_marker(attr);
    }
    
  }
}



function add_marker(attr) {
  var myLatlng = new google.maps.LatLng(attr.pt.latitude, attr.pt.longitude);
  var mapOptions = {
    zoom: 8,
    center: myLatlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  }

  var map = new google.maps.Map(document.getElementById('map'), mapOptions);

  var contentString = '<div id="content">'+
      '<h1 id="firstHeading" class="firstHeading">' + attr.title + '</h1>'+
      '<div id="bodyContent">'+
      '<p>' + attr.description
      '</div>'+
      '</div>';

  var infowindow = new google.maps.InfoWindow({
      content: contentString
  });

  var marker = new google.maps.Marker({
      position: myLatlng,
      map: map,
      title: attr.title
  });
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.open(map, marker);
  });
}

google.maps.event.addDomListener(window, 'load', initialize);
	    

$("#search-form").submit(function() {
	$("#loader").css("display", "block");
  //window.setTimeout(function(){location.reload(true)}, 3000);
	var data = null;
	if($("#search-query").val() != "") {
		data = { query: encodeURIComponent($("#search-query").val()) }
	}

	$.get("/api/search.json", 
		data, 
		function(data) {
      if (data != ""){
				console.log("Data returned: " + data);
				populateMap(data);
        drawTagCloud();
        refreshChart();
      }
      else{
        window.confirm("Sorry, no results returned.");
      }
				$("#loader").css("display", "none");
			}, "json").fail(function() {
				console.log("search failed");
			});
    
	
	
	
	return false;
});
