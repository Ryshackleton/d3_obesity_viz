/* sets up the ui for the obesity age group page */

var yearSelect = document.getElementById( 'yearselect' )
  , countrySelect = document.getElementById( 'countryselect' )
  , obeseSelect = document.getElementById( 'obeseselect' )
  , barChart = BARCHART.obesity
  , worldMap = MAP.worldClickable
  , obesityCSVFileRoot = "/data/IHME_GBD_BOTHSEX_"
  , locationsCSVFile = "/data/locations.csv"
  , animation;

/* build selector with year list */
for(var i=1990;i<2014;i++) {
  yearSelect.add(new Option(i));
}
yearSelect.selectedIndex = yearSelect.options.length-1;
addEventListeners(yearSelect);

/* build selector with obesity vs overweight-ness  */
obeseSelect.add(new Option("obese"));
obeseSelect.add(new Option("overweight"));
addEventListeners(obeseSelect);

/* initialize the bar chart and map */
initBarsAndMaps();
/* window resize triggers update */
window.addEventListener("resize", initBarsAndMaps );

/* add a listener for the countryclick event, which is dispatched
 * when a country is clicked on in the map */
window.addEventListener("countryclick", function(countryclick){
    updateCountrySelect(countryclick.detail.countryname);
    barChart.graphUpdate(countryclick.detail);
});

/* setup simple animation to toggle through the year select */
var startButton = document.getElementById("animationButton");
setupAnimation();

/* sets up the animation and sets up appropriate click events */
function setupAnimation() {
  startButton.value = "Animate Years";
  if(startButton.addEventListener) {
      startButton.addEventListener("click", startAnim);
  }
  else if(startButton.attachEvent) {
      startButton.attachEvent("onclick", startAnim);
  }
  else {
      startButton.onchange = startAnim; 
  }
}

/* starts animation and sets up appropriate click events */
function startAnim() {
  startButton.value = "Stop Animation";
  if(startButton.addEventListener) {
      startButton.removeEventListener("click", startAnim);
      startButton.addEventListener("click", stopAnim);
  }
  else if(startButton.attachEvent) {
      startButton.removeEvent("onclick", startAnim);
      startButton.attachEvent("onclick", stopAnim);
  }
  else {
      startButton.onclick = stopAnim; 
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
  updateBarGraph();
  animate = setTimeout(advanceYear, 1500);
}

/* sets up the bars and maps based on the 'page-content' width */
function initBarsAndMaps() {
  /** initialize world map
    * then link the bar chart update to the 
    * map's click functionality
    */
  var bodyWidth = document.getElementById('page-content').offsetWidth;
  worldMap.init(".worldmap", bodyWidth, bodyWidth / 3 );

  /* build selector with country list */
  d3.csv(locationsCSVFile, function(error,data) {
    if(error) {
      console.error("ui.js - Problem reading locations.csv file");
    }
    else {
      /* soverign countries have 3 letter country codes
       * as opposed to regions, which have numbers or < 3 letters
       *  so omit the regions from our selector
      */
      var strict3LetterCountryCode = /[A-Z]{3}/;
      data.forEach(function(d) {
        if( strict3LetterCountryCode.test(d.location) ) {
          countrySelect.add(new Option(d.location_name));
        }
      });
      addEventListeners(countrySelect);

      barChart.sizeUpdate({width:bodyWidth, height:bodyWidth/2, barMargin: 2});
      barChart.init('.obesityBar', obesityCSVFileRoot, atts());
    }
  });
}

/* updates the bar graph with the currently selected attributes */
function updateBarGraph()
{
  barChart.graphUpdate(atts());
}

/* returns an object with the currently selected attribute values */
function atts(){
  return {
    countryname: countrySelect.value,
    sex: "both",
    obese_overweight: obeseSelect.value,
    year: yearSelect.value
  };
}

/* sets the countrySelect to the specified country name */
function updateCountrySelect(newCountryName)
{
  var ops = countrySelect.options;
  for(var i=0;i<ops.length;i++){
    if(ops[i].text === newCountryName) {
      countrySelect.selectedIndex = i;
      break;
    }
  }
}

/* add event listeners safely to the selectors */
function addEventListeners(myListener) {
  if(myListener.addEventListener) {
      myListener.addEventListener("change", updateBarGraph);
  }
  else if(myListener.attachEvent) {
      myListener.attachEvent("onchange", updateBarGraph);
  }
  else {
      myListener.onchange = updateBarGraph; 
  }
}

