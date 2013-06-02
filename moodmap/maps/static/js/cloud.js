$(document).ready(function() {
      
    drawTagCloud();

});

function drawTagCloud() {
  var tags = [];
  $.get("/api/tags.json", function(data) {
      //console.debug('tags', data);
      for (var i = 0, length = data.length; i < length; i++) {
        var tag = {};
        tag.text = data[i].text;
        var weight = Math.round(data[i].weight * 100) / 100;
        if (weight >= 15 && weight <= 20 && tag.text.toString().indexOf(' ') < 0) {
          tag.weight = 8;
          tags.push(tag);
        } else if (weight >= 1) { //} && tag.text.toString().indexOf(' ') < 0) {
          //console.log('text: ', tag.text, 'weight: ', weight);
          tag.weight = weight;
          tags.push(tag);
        } 
        
      }
      $("#jqtagcloud").jQCloud(tags);
    },
    "json"
  ).fail(function() {
	  		console.log("tag cloud load failed");
	  	}).done(function() {
	  		console.log("tag cloud done");
	  	});

  var word_array = [
          {text: "Lorem", weight: 8},
          {text: "Ipsum", weight: 9, link: "http://jquery.com/"},
          {text: "Dolor", weight: 3, html: {title: "I can haz any html attribute"}},
          {text: "Sit", weight: 2},
          {text: "Amet", weight: 5}
          // ...as many words as you want
      ];

  

}