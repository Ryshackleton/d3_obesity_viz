var MAP = MAP || {}; 

MAP.worldClickable = function() {
  /* a simple world map module modified heavily from:
   * http://www.digital-geography.com/d3-js-mapping-tutorial-1-set-initial-webmap/#.WEYRScMrJE6
   * and
   * https://gist.github.com/dnprock/bb5a48a004949c7c8c60 */

  /***** PRIVATE ******/
  var mWidth = 1
    , mHeight = 1 
    , mMapSelection
    , mProjection
    , mPath
    , mColorScale
    , mCountryMeans = {}
    , mScaleDenom = 1.0
    , mIsMapScaled = false
    , mBuiltEvent = new CustomEvent('map_built');

  /***** PUBLIC ******/
  var mMapDivTag = ".worldmap";
  
  var countryScale = function(d) {
      if( mIsMapScaled ) {
        var cent = mPath.centroid(d);
        var negativeCent = [ -cent[0], -cent[1] ];
        
        var scale = mCountryMeans.hasOwnProperty(d.properties.adm0_a3)
          ? "scale(" + mCountryMeans[d.properties.adm0_a3] / mScaleDenom + ")"
          : "scale(1.0)";
        var translate = "translate(" + negativeCent.join(",") + ")";
        var translateBack = "translate(" + cent.join(",") + ")";
        
        return translateBack + scale + translate;
      }
      return "scale(1.0)";
  };

  var toggleMapScale = function(){
    d3.json("/data/worldgeojson", function (error, topology) {
      if (error) {
        console.error("map.js MAP.worldClickable.init() - Problem reading countries json file.");
        return;
      }
        mMapSelection.selectAll("path")
          .data(topojson.feature(topology, topology.objects.countries).features)
            .transition()
            .duration(1000)
          .attr("transform", countryScale );
    });
    mIsMapScaled = !mIsMapScaled;
  };
  
  var render = function(divTag,width,height,selectedAtts) {

    mMapDivTag = divTag;
    mWidth = width;
    mHeight = height;

    /* map setup: modified from http://www.digital-geography.com/d3-js-mapping-tutorial-1-set-initial-webmap/#.WEYRScMrJE6 */
    var svg = d3.select(mMapDivTag)
        .attr("width", mWidth)
        .attr("height", mHeight);
    
    mProjection = d3.geoCylindricalEqualArea()
        .scale(mWidth / 1.5 / Math.PI)
        .translate([mWidth / 2, mHeight / 2])
        .precision(.1);

    mPath = d3.geoPath()
       .projection(mProjection);

    /* mouseover functionality - modified from:
     (https://gist.github.com/dnprock/bb5a48a004949c7c8c60) */
    var graticule = d3.geoGraticule();

    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", mPath);

    svg.append("path")
        .datum(graticule)
        .attr("class", "choropleth")
        .attr("d", mPath);
    /* end mouseover functionality */

    /* for zooming functionality */
    if (mMapSelection) {
      mMapSelection.selectAll("g").remove();
    }
    else {
      mMapSelection = svg.append("g");
    }

    d3.json("/data/worldgeojson", function (error, topology) {
      if (error) {
        console.error("map.js MAP.worldClickable.init() - Problem reading countries json file.");
        return;
      }
    
      mCountryMeans = {};
      d3.json(['data','means',selectedAtts.year,selectedAtts.obese_overweight].join("/")
          ,function(error, meanData)
      {
          if(error)
          {
              console.error("BARCHART.obesity.graphUpdate(); - Problem reading csv file. Check file path.");
              return;
          }
          meanData.forEach(function(d) {
              mCountryMeans[d.countrycode] = d.mean;
          });
          
          /* mapping function for colormapper, uses colorbrewer */
          var colors = colorbrewer.Blues[9]
              .map(function(rgb) { return d3.hsl(rgb); });
    
          var md = d3.max(meanData, function(d) { return d.mean; });
          mScaleDenom = d3.median(meanData, function(d) { return d.mean; });
          mColorScale = d3.scaleLinear()
              .range(colors)
              // adding a 2 here at the end of the scale for "no data" values
              .domain([0.0, md*0.1, md*0.2, md*0.3, md*0.4, md*0.5, md*0.6, md*0.7,md*0.8, 100.0]);
    
          /* legend help from: http://zeroviscosity.com/d3-js-step-by-step/step-3-adding-a-legend */
          svg.selectAll('.legend').remove(); // remove any existing legend
    
          var legendRectSize = mHeight * 0.8 / mColorScale.domain().length;
          var legendSpacing = 0;
          var legend = svg.selectAll('.legend')
              .append('title')
              .data(mColorScale.domain())
              .enter()
              .append('g')
              .attr('class', 'legend')
              .attr('transform', function(d, i) {
                  var height = legendRectSize + legendSpacing;
                  var offset =  height * mColorScale.domain().length / 2;
                  var horz = 0.3 * legendRectSize;
                  var vert = mHeight / 2 + i * height - offset;
                  return 'translate(' + horz + ',' + vert + ')'});
    
          legend.append('rect')
              .attr('width', legendRectSize)
              .attr('height', legendRectSize)
              .style('fill', mColorScale)
              .style('stroke', 'black');
    
          legend.append('text')
              .attr('x', legendRectSize + legendSpacing)
              .attr('y', legendRectSize - legendSpacing)
              .text(function(d) {
                  if(d>1.0) {
                      return "no data";
                  } else {
                      return Math.floor(d * 100) + "%";
                  }})
              .attr('transform', 'translate(5,'+(-legendRectSize/4)+')');
          /* legend help from: http://zeroviscosity.com/d3-js-step-by-step/step-3-adding-a-legend */
    
          mMapSelection.selectAll("path").remove();// remove existing path
    
          mMapSelection.selectAll("path")
              .data(topojson.feature(topology, topology.objects.countries).features)
              .enter()
              .append("path")
              .attr("id", "countries")
              .attr("d", mPath )
              .attr("class", "active")
              .attr("fill", function (d) {
                  return mCountryMeans.hasOwnProperty(d.properties.adm0_a3)
                      ? mColorScale(mCountryMeans[d.properties.adm0_a3]) : mColorScale(100);
              })
              .attr("fill-opacity", "0.95")
              .attr("stroke-width",function(d) {
                  return selectedAtts.countrycode === d.properties.adm0_a3
                      ? "1px" : "0.2px" ;
              })
              .attr("stroke", function(d) {
                  return selectedAtts.countrycode === d.properties.adm0_a3
                      ? "yellow" : "black" ;
              })
             .attr("transform", countryScale )
              /* use click event to trigger external updates */
              .on("click", function (d) {
                  var countryClickEvent = new CustomEvent("countryclick", {
                      detail: {
                          countrycode: d.properties.adm0_a3,
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
              .on("mousemove", function (d) {
                  $(this).attr("class", ".active");
                  var html = "";
                  var mean = mCountryMeans.hasOwnProperty(d.properties.adm0_a3)
                      ? Math.floor(mCountryMeans[d.properties.adm0_a3] * 100) + "%" : 'no data';
                  html += "<div class=\"tooltip_kv\">";
                  html += "<span class=\"tooltip_key\">";
                  html += d.properties.name_long;
                  html += ": " + mean;
                  html += "</span>";
                  html += "</div>";
            
                  $("#tooltip-container").html(html);
                  $(this).attr("fill-opacity", "0.6");
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
              .on("mouseout", function () {
                  $(this).attr("fill-opacity", "0.95");
                  $("#tooltip-container").hide();
              });
          /* end mouseover functionality */
      });
    
    });
          
    /* zoom and pan (from: http://www.digital-geography.com/d3-js-mapping-tutorial-1-set-initial-webmap/#.WEYRScMrJE6) */
    var zoom = d3.zoom()
        .on("zoom", function () {
          mMapSelection.attr("transform", d3.event.transform);
          mMapSelection.selectAll("path")
              .attr("d", mPath.projection(mProjection));
        });
    svg.call(zoom);
    
    // d3.select(mMapDivTag).node().dispatchEvent(mBuiltEvent);
      document.dispatchEvent(mBuiltEvent);
  };

  return {
    /* variables */
    mMapDivTag: mMapDivTag,

    /* functions */
    init: render,
    toggleMapScale: toggleMapScale,
    getColorScale: function(){ return mColorScale; }
  };

}();
