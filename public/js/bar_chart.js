var BAR_CHART = (function(exports) {
  
  // returns the default scale for the bars, scaled to the max of the mean values of the data
  var barscale = function(data) {
    return d3.scale.linear()
          .domain([0, 1])
//          .domain([0, d3.max(data, function(d) { return d.mean; })])
          .range([0, 800]);
  };
  
  var colors = colorbrewer.Blues[9]
//          .reverse()
    .map(function(rgb) { return d3.hsl(rgb); });
 
  return {
    // graph update function: parses the (massive) csv for the appropriate data
    // given the selected object attributes
    // usage:
    //    var atts = {
    //      countryname: "United States",
    //      sex: "both",
    //      obese_overweight: "obese",
    //      year: "2013"
    //    };
    //    graphUpdateAtts(atts);
    graphUpdate: function(atts){
      
      document.getElementById("statusmessage").innerHTML = "Parsing...";
      
//      d3.csv("/data/IHME_GBD_2013_OBESITY_PREVALENCE_1990_2013_Y2014M10D08.CSV", function(d) {
      d3.csv("/data/IHME_GBD_2013_BOTHSEX.CSV", function(d) {
          if( d.location_name === atts.countryname  && d.sex === atts.sex && d.metric === atts.obese_overweight && d.year === atts.year && !d.age_group.includes("standard") )
              {
                  return {
                      "mean": +d.mean,
                      "age_group": d.age_group
                  };
              }
      }, function(data) {

        var x = barscale(data);
        
        var md = d3.max(data, function(d) { return d.mean; });
        var color = d3.scale.linear()
        .range(colors)
        .domain([md * 0.1, md*0.2, md*0.3, md*0.4, md*0.5, md*0.6, md*0.7, md*0.8, md*0.9]);
        
        d3.select(".chart")
          .selectAll("div")
            .data(data)
            .transition()
            .duration(1500)
            .style("background-color", function(d) { return color(d.mean) })
            .style("width", function(d) { return x(d.mean) + "px"; })
            .text(function(d) { return d.age_group + " - " + (100 * d.mean).toFixed(0) + "%"; });

        document.getElementById("statusmessage").innerHTML = "";
      });
    },
    
    // graph update function: parses the (massive) csv for the appropriate data
    graphInit: function(atts) {
      
      document.getElementById("statusmessage").innerHTML = "Parsing...";
      
//      d3.csv("/data/IHME_GBD_2013_OBESITY_PREVALENCE_1990_2013_Y2014M10D08.CSV", function(d) {
      d3.csv("/data/IHME_GBD_2013_BOTHSEX.CSV", function(d) {
          if( d.location_name === atts.countryname  && d.sex === atts.sex && d.metric === atts.obese_overweight && d.year === atts.year && !d.age_group.includes("standard") )
              {
                  return {
                      "mean": +d.mean,
                      "age_group": d.age_group
                  };
              }
      }, function(data) {

        var x = barscale(data); 
        
        var md = d3.max(data, function(d) { return d.mean; });
        var color = d3.scale.linear()
        .range(colors)
        .domain([md * 0.1, md*0.2, md*0.3, md*0.4, md*0.5, md*0.6, md*0.7, md*0.8, md*0.9]);
        
        d3.select(".chart")
          .selectAll("div")
            .data(data)
          .enter().append("div")
            .style("width", 0 )
            .style("background-color", function(d) { return color(d.mean) })
            .transition()
            .duration(800)
            .style("width", function(d) { return x(+d.mean) + "px"; })
            .text(function(d) { return d.age_group + " - " + (100 * d.mean).toFixed(0) + "%"; });

        document.getElementById("statusmessage").innerHTML = "";
      });
    }
  };
})(this);
                 