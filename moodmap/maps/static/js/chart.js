$(function() {
	refreshChart();

});

function refreshChart() {
	var data = null;
	if($("#search-query").val() != "") {
		data = { query: $("#search-query").val() }
	}
	$.get("/api/tally.json", data, function(data) {
      //console.debug('tags', data);
      var total = data.positive + data.neutral + data.negative;
      var percents = {"positive": (data.positive / total * 100), "negative": (data.negative / total * 100), "neutral": (data.neutral / total * 100) }
      //console.log(total);
      //console.log(data);
      //console.log(percents);
      $("#positive").width("" + percents.positive + "%").text(data.positive);
      $("#neutral").width("" + percents.neutral + "%").text(data.neutral);
      $("#negative").width("" + percents.negative + "%").text(data.negative);
      
      $("#stats").html("Total: " + total + "<br>" + "Geo-tagged: " + data.geotagged);
    },
    "json"
  ).fail(function() {
	console.log("chart load failed");
  }).done(function() {
	//console.log("chart done");
  });
}