/* sets up the ui for the obesity age group page */

var yearSelect = document.getElementById( 'yearselect' )
  , countrySelect = document.getElementById( 'countryselect' )
  , obeseSelect = document.getElementById( 'obeseselect' )
  , barChart = BARCHART.obesity
  , worldMap = MAP.worldClickable
  , obesityCSVFileRoot = "/data/IHME_GBD_BOTHSEX_"
;

/* build selector with year list */
for(var i=1990;i<2014;i++) {
  yearSelect.add(new Option(i));
}
yearSelect.selectedIndex = yearSelect.options.length-1;
yearSelect.addEventListener("change", updateBarsAndMaps);

/* build selector with obesity vs overweight-ness  */
obeseSelect.add(new Option("obese"));
obeseSelect.add(new Option("overweight"));
obeseSelect.addEventListener("change", updateBarsAndMaps);

/* window resize triggers update */
window.addEventListener("resize", updateBarsAndMaps );

/* add a listener for the countryclick event, which is dispatched
 * when a country is clicked on in the map */
window.addEventListener("countryclick", function(countryclick) {
  updateCountrySelect(countryclick.detail.countrycode);
  updateBarsAndMaps();
  });

/* setup country scale button */
var countryScaleButton = document.getElementById("countryScaleButton");
function setupScale() {
  if(countryScaleButton.addEventListener) {
    countryScaleButton.addEventListener("click", worldMap.toggleMapScale);
  }
}
setupScale();

/* setup simple animation to toggle through the year select */
var startButton = document.getElementById("animationButton");
setupAnimation();

/* main method to initialize the bar chart and map */
updateBarsAndMaps();

/* sets up the animation and sets up appropriate click events */
function setupAnimation() {
  startButton.value = "Animate Years";
  if(startButton.addEventListener) {
      startButton.addEventListener("click", startAnim);
  }
}

/* starts animation and sets up appropriate click events */
function startAnim() {
  startButton.value = "Stop Animation";
  if(startButton.addEventListener) {
      startButton.removeEventListener("click", startAnim);
      startButton.addEventListener("click", stopAnim);
  }
  advanceYear();
}

/* stops a running animation and sets up the animation again */
function stopAnim() {
  clearTimeout(animate);
  setupAnimation();
}

/* advances the year recursively */
function advanceYear() {
  if( yearSelect.selectedIndex < yearSelect.options.length - 1 ){
    yearSelect.selectedIndex++;
  }
  else {
    yearSelect.selectedIndex = 0;
  }
  updateBarsAndMaps();
  animate = setTimeout(advanceYear, 1500);
}

/* sets up the bars and maps based on the 'page-content' width */
function updateBarsAndMaps() {

  /** re-initialize world map
   */
  var bodyWidth = document.getElementById('page-content').offsetWidth;
  worldMap.init(".worldmap", bodyWidth, bodyWidth / 3, atts());

  /* build selector with country list */
  d3.json(['data','locations'].join('/'), function (error, data) {
    if (error) {
      console.error("index.js - Problem reading /data/locations/");
    }
    else {
      if (countrySelect.options === undefined || countrySelect.options.length < 1) {
        buildCountrySelect(data);
      }
    }
    barChart.sizeUpdate({width: bodyWidth, height: bodyWidth / 2, barMargin: 2});
    barChart.init('.obesityBar', obesityCSVFileRoot, atts());
  });
}

/* sets the countrySelect to the specified country name */
function updateCountrySelect(newCountryCode) {
  var ops = countrySelect.options;
  for (var i = 0; i < ops.length; i++) {
    if (ops[i].value === newCountryCode) {
      countrySelect.selectedIndex = i;
      break;
    }
  }
}

/* adds the appropriate name/value pairs to the country select */
function buildCountrySelect(data) {
  var strict3LetterCountryCode = /[A-Z]{3}/;
  data.forEach(function(d) {
    /* sovereign countries have 3 letter country codes
     * as opposed to regions, which have numbers or < 3 letters
     *  so omit the regions from our selector
     */
    if( strict3LetterCountryCode.test(d.location) ) {
      var newOpt = new Option();
      newOpt.value = d.location;
      newOpt.text = d.location_name;
      countrySelect.add(newOpt);
    }
  });
  countrySelect.addEventListener("change",updateBarsAndMaps);
}

/* updates the bar graph with the currently selected attributes */
function updateBarGraph() {
  barChart.graphUpdate(atts());
}

/* returns an object with the currently selected attribute values */
function atts() {
  return {
    countrycode: countrySelect.value,
    countryname: countrySelect.text,
    sex: "both",
    obese_overweight: obeseSelect.value,
    year: yearSelect.value
  };
}

