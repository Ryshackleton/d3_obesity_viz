var BARCHART = BARCHART || {};

BARCHART.obesity = function() {
  /* module that produces a vertical barchart of obesity/overweight
   * prevalence with the bars representing age groups from a 
   * csv file formatted as shown below.
   *
   * Bars are colored and have labels containing the name
   * of the age group and the value as a %
   *
   * CSV file formatting as follows:
   * location_id    location    location_name    year    age_group_id    age_group    age_start    age_end    sex_id    sex    unit    metric    measure    mean    lower    upper
   * 160    AFG    Afghanistan    1990    34    2 to 4 yrs    2    4    3    both    pct    overweight    prevalence    0.18    0.14    0.228
   * 160    AFG    Afghanistan    1990    34    2 to 4 yrs    2    4    3    both    pct    obese    prevalence    0.056    0.041    0.076
   * 160    AFG    Afghanistan    1990    36    2 to 19 yrs, age-standardized    2    19    3    both    pct    obese    prevalence    0.051    0.044    0.059
   *
   * usage:  
   *  var attributes = { countryname: "Afghanistan", sex: "both", obese_overweight: "obese", year: 1990 }; 
   *  var barChart = BARCHART.obesity
   *  barChart.sizeUpdate(...);
   *  barChart.init(obesityCSVFile,atts());
   */

  /***** PRIVATE *****/

  /* returns the default scale for the bars, scaled from 1 to 0 */
  var barscale = function(data) {
    return d3.scale.linear()
          .domain([1, 0])
          .range([mSvgHeight, 0]);
  };
  
  /* mapping function for colormapper, uses colorbrewer */
  var colors = colorbrewer.Blues[9]
    .map(function(rgb) { return d3.hsl(rgb); });


  /***** PUBLIC *****/
  
  var mCSVFile = ""
    , mBarDivTag = '.myBars'
    , mSvgHeight = 100
    , mSvgWidth = 100
    , mBarMargin = 2;

  /* update the graph's size parameters
   * usage: var sizes = { width: 5, height: 10, barMargin: 1 };
   * sizeUpdate(sizes);
   * graphUpdate(); // to re compute the graph
   */
  var sizeUpdate = function(widthHeight) {
    mSvgHeight = widthHeight.height;
    mSvgWidth = widthHeight.width;
    mBarMargin = widthHeight.barMargin;
  };

  /* init function to set the barchart up with the appropriate file 
   * useage: init(divTag,'filename.csv',attributes);
   *
  */
  var init = function(divTag,csvFile,attributes){
    mBarDivTag = divTag;
    mCSVFile = csvFile;
    graphUpdate(attributes);
  };
  
  /* graph update function: parses the csv for the appropriate data
   given the selected object attributes
   usage:
      var atts = {
        countryname: "United States",
        sex: "both",
        obese_overweight: "obese",
        year: "2013"
      };
      graphUpdate(atts);
  */
  var graphUpdate = function(atts){
    d3.csv(mCSVFile, function(d) {
      if( d.location_name === atts.countryname 
        && d.sex === atts.sex && d.metric === atts.obese_overweight
        && d.year === atts.year && !d.age_group.includes("standard") ) {
          return {
              "mean": +d.mean,
              "age_group": d.age_group
          };
      }
    }, function(error,data) {
      if( error ) {
        console.error("BARCHART.obesity.graphUpdate(); - Problem reading csv file. Check file path.");
        return;
      }

      var x = barscale(data);
      
      var md = d3.max(data, function(d) { return d.mean; });
      var color = d3.scale.linear()
        .range(colors)
        .domain([md * 0.1, md*0.2, md*0.3, md*0.4, md*0.5, md*0.6, md*0.7, md*0.8, md*0.9]);

      var chartDivs = d3.select(mBarDivTag)
        .selectAll("div")
        .data(data);

      // check for first load, if so append elements first
      if( chartDivs.size() < 1 ) {
        chartDivs
          .enter()
          .append("div")
            .style("font","11px sans-serif")
            .style("height", function(d) { return x(d.mean) + "px"; })
            .style("width", 0 )
            .style("margin-left", mBarMargin+"px")
            .style("margin-right", mBarMargin+"px")
            .style("float","left");
      }

      var barWidth = (mSvgWidth * 0.99 - (chartDivs.size() * (mBarMargin*2))) / (chartDivs.size());

      chartDivs
        .transition()
        .duration(1500)
        .style("background-color", function(d) { return color(d.mean); })
        .style("height", function(d) { return x(+d.mean) + "px"; })
        .style("width", barWidth + "px")
        .text(function(d) { return d.age_group + "\n" + (100 * d.mean).toFixed(0) + "%"; })
          .style("color", "darkgray")
          .style("text-align", "center");
    });
  };
 
  return {
    /* variables */
    mBarDivTag: mBarDivTag, 
    mCSVFile: mCSVFile,
    mSvgHeight: mSvgHeight,
    mSvgWidth: mSvgWidth,
    mBarMargin: mBarMargin,

    /* functions */
    init: init,
    sizeUpdate: sizeUpdate,
    graphUpdate: graphUpdate
  };

}();
                 
