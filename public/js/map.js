var width = 600,
    height = 300; 

var svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height);

var projection = d3.geo.mercator()
    .scale((width + 1) / 2 / Math.PI)
    .translate([width / 2, height / 2])
    .precision(.1);
;

var path = d3.geo.path()
    .projection(projection);

var g = svg.append("g");

// for mouseover functionality - modified from:
// (https://gist.github.com/dnprock/bb5a48a004949c7c8c60)
var graticule = d3.geo.graticule();

svg.append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", path);

svg.append("path")
 .datum(graticule)
 .attr("class", "choropleth")
 .attr("d", path);
// end mouseover functionality

d3.json("/data/countries.topo.notrans.json", function(error, topology) {
  
  g.selectAll("path")
      .data(topojson.feature(topology, topology.objects.countries).features)
    .enter()
      .append("path")
      .attr("id", "countries")
      .attr("d", path)
      .attr("class", "active")
      .on("click", function(d) {
        var atts = {
          countryname: d.properties.name_long,
          sex: "both",
          obese_overweight: obeseSelect.value,
          year: yearSelect.value 
        };
        BAR_CHART.graphUpdate(atts);
        updateCountrySelect(d.properties.name_long);
      })
      // mouseover functionality modified from
      // (https://gist.github.com/dnprock/bb5a48a004949c7c8c60)
      .on("mousemove", function(d) {
        $(this).attr("class", ".active");
        var html = "";

        html += "<div class=\"tooltip_kv\">";
        html += "<span class=\"tooltip_key\">";
        html += d.properties.name_long;
        html += "</span>";
        html += "</div>";

        $("#tooltip-container").html(html);
        $(this).attr("fill-opacity", "0.8");
        $("#tooltip-container").show();

        var map_width = $('.choropleth')[0].getBoundingClientRect().width;

        if (d3.event.pageX < map_width / 2) {
          d3.select("#tooltip-container")
            .style("top", (d3.event.layerY + 15) + "px")
            .style("left", (d3.event.layerX + 15) + "px");
        } else {
          var tooltip_width = $("#tooltip-container").width();
          d3.select("#tooltip-container")
            .style("top", (d3.event.layerY + 15) + "px")
            .style("left", (d3.event.layerX - tooltip_width - 30) + "px");
        }
    })
    .on("mouseout", function() {
            $(this).attr("fill-opacity", "1.0");
            $("#tooltip-container").hide();
    });
    // end mouseover functionality
});

// zoom and pan (from: http://www.digital-geography.com/d3-js-mapping-tutorial-1-set-initial-webmap/#.WEYRScMrJE6)
var zoom = d3.behavior.zoom()
    .on("zoom",function() {
        g.attr("transform","translate("+ 
            d3.event.translate.join(",")+")scale("+d3.event.scale+")");
        g.selectAll("path")  
            .attr("d", path.projection(projection)); 
  });

svg.call(zoom);
