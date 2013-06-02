$(function() {
	$.get("/api/tally.json", function(data) {
      //console.debug('tags', data);
      var total = data.positive + data.neutral + data.negative;
      var percents = {"positive": (data.positive / total * 100), "negative": (data.negative / total * 100), "neutral": (data.neutral / total * 100) }
      console.log(total);
      console.log(data);
      console.log(percents);
      $("#positive").width("" + percents.positive + "%").text(data.positive);
      $("#neutral").width("" + percents.neutral + "%").text(data.neutral);
      $("#negative").width("" + percents.negative + "%").text(data.negative);
      
      //$("#positive").width("33%");
      //$("#negative").attr();
    },
    "json"
  ).fail(function() {
	console.log("tag cloud load failed");
  }).done(function() {
	console.log("tag cloud done");
  });

});
