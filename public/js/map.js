var MAP = MAP || {}; 

MAP.worldClickable = function() {

  /***** PRIVATE ******/
  var mWidth = 1
    , mHeight = 1 
    , mMapSelection;

  /***** PUBLIC ******/
  var mMapDivTag = ".worldmap"

  var init = function(divTag,width,height) {

    mMapDivTag = divTag;
    mWidth = width;
    mHeight = height;

    var svg = d3.select(mMapDivTag)
        .attr("width", mWidth)
        .attr("height", mHeight);

    var projection = d3.geo.mercator()
        .scale((mWidth + 1) / 2 / Math.PI)
        .translate([mWidth / 2, mHeight / 2])
        .precision(.1);

    var path = d3.geo.path()
        .projection(projection);
    
    /* mouseover functionality - modified from:
     (https://gist.github.com/dnprock/bb5a48a004949c7c8c60) */
    var graticule = d3.geo.graticule();

    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path);

    svg.append("path")
     .datum(graticule)
     .attr("class", "choropleth")
     .attr("d", path);
    /* end mouseover functionality */

    /* for zooming functionality */
    if( mMapSelection ) {
      mMapSelection.selectAll("g").remove();
    }
    else
    {
      mMapSelection  = svg.append("g"); 
    }
    
    d3.json("/data/countries.topo.notrans.json", function(error, topology) {
      if( error ) {
        console.error("map.js MAP.worldClickable.init() - Problem reading countries json file.");
        return;
      }

      mMapSelection.selectAll("path")
          .data(topojson.feature(topology, topology.objects.countries).features)
        .enter()
          .append("path")
          .attr("id", "countries")
          .attr("d", path)
          .attr("class", "active")
          /* use click event to trigger external updates */
          .on("click", function(d) {
            var countryClickEvent = new CustomEvent("countryclick", {
                detail: {
                  countryname: d.properties.name_long,
                  sex: "both",
                  obese_overweight: obeseSelect.value,
                  year: yearSelect.value 
                }
              });
              window.dispatchEvent(countryClickEvent);
          })
          /* mouseover functionality modified from
           (https://gist.github.com/dnprock/bb5a48a004949c7c8c60) */
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
        /* end mouseover functionality */

      /* zoom and pan (from: http://www.digital-geography.com/d3-js-mapping-tutorial-1-set-initial-webmap/#.WEYRScMrJE6) */
      var zoom = d3.behavior.zoom()
          .on("zoom",function() {
              mMapSelection.attr("transform","translate("+ 
                  d3.event.translate.join(",")+")scale("+d3.event.scale+")")
              mMapSelection.selectAll("path")  
                  .attr("d", path.projection(projection)); 
      });
      svg.call(zoom);

    });


  };
  
  return {
    /* variables */
    mMapDivTag: mMapDivTag,

    /* functions */
    init: init
  };

}();
