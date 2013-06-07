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
  
        draw(data,{
              backgroundColor:'#141414',
              legend: {textStyle: {color: '#B0C4DE'}},
              slices:[{color:'#00008B'}, {color:'#8B0000'}, {color:'#006400'}]});

      $("#stats").html("Total: " + total + "<br>" + "Geo-tagged: " + data.geotagged);
    },
    "json"
  ).fail(function() {
  console.log("chart load failed");
  }).done(function() {
  //console.log("chart done");
  });
}