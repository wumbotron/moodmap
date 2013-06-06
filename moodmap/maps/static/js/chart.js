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

    // Create and populate the data table.
    var data = google.visualization.arrayToDataTable([
      ['sentiments', 'values'],
      ['Positive', data.positive],
      ['Negative', data.negative],
      ['Neutral', data.neutral],
    ]);
    
    // Create and draw the visualization.
    new google.visualization.PieChart(document.getElementById('visualization')).
        draw(data, {title:"moodmap sentiments"});

      $("#stats").html("Total: " + total + "<br>" + "Geo-tagged: " + data.geotagged);
    },
    "json"
  ).fail(function() {
  console.log("chart load failed");
  }).done(function() {
  //console.log("chart done");
  });
}