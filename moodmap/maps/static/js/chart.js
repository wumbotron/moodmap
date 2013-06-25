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
        var Gdata = google.visualization.arrayToDataTable([
            ['sentiments', 'values'],
            ['Positive', data.positive],
            ['Negative', data.negative],
            ['Neutral', data.neutral],
            ]);

        // Create and draw the visualization.
        console.log("data count:%d" ,total);
        $("#stats").html("Tweet Statistics: " + "Total: " + total + " | " + "Geo-tagged: " + data.geotagged);
        new google.visualization.PieChart(document.getElementById('visualization')).
        draw(Gdata, {title: 'Sentiments',
            titleTextStyle: {color: 'white'},
            width: '100%', height: 266,
            is3D:true,
            chartArea: {left:30,top:30, width:"80%",height:"100%"},
            backgroundColor: { fill:'transparent' },
            legend: {alignment: 'center', textStyle: {color: 'white'}},
            pieSliceTextStyle: {'color': 'white', 'fontName': 'garmond', 'fontSize': 12},
            slices: {0: {color: 'green'}, 1: {color:'red'}, 2: {color: 'gray'}}
        });


    },
    "json").fail(function() {
        console.log("chart load failed");
     }).done(function() {
     //console.log("chart done");
     });
}
