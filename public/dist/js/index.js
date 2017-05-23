/* sets up the ui for the obesity age group page */

var yearSelect = document.getElementById( 'yearselect' )
    , countrySelect = document.getElementById( 'countryselect' )
    , obeseSelect = document.getElementById( 'obeseselect' )
    , worldMap = MAP.worldClickable
    , asterPlot
    /* mapping function for colormapper, uses colorbrewer */
    , asterColors = colorbrewer.Blues[9]
        .map(function(rgb) { return d3.hsl(rgb); })
    , asterColorFunction = d3.scaleLinear()
                            .range(asterColors)
;

/* build selector with year list */
for(var i=1990;i<2014;i++) {
  yearSelect.add(new Option(i));
}
yearSelect.selectedIndex = yearSelect.options.length-1;
yearSelect.addEventListener("change", updateAsterAndMap);

/* build selector with obesity vs overweight-ness  */
obeseSelect.add(new Option("obese"));
obeseSelect.add(new Option("overweight"));
obeseSelect.addEventListener("change", updateAsterAndMap);

/* window resize triggers update */
window.addEventListener("resize", updateAsterAndMap );

/* add a listener for the countryclick event, which is dispatched
 * when a country is clicked on in the map */
window.addEventListener("countryclick", function(countryclick) {
  updateCountrySelect(countryclick.detail.countrycode);
  updateAsterAndMap();
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
updateAsterAndMap();

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
  updateAsterAndMap();
  animate = setTimeout(advanceYear, 1500);
}

/* sets up the bars and maps based on the 'page-content' width */
function updateAsterAndMap() {

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
      updateAsterPlot();
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
  countrySelect.addEventListener("change",updateAsterAndMap);
}

/* updates the bar graph with the currently selected attributes */
function updateAsterPlot() {
    if( asterPlot === undefined )
    {
        var asterOptions = {
            width: 400,
            height: 400,
            showHeightLabels: true,
            showWidthLabels: true,
            showOuterArc: false,
            innerRadius: 50,
            transitionMethod: "narrowSlice"
        };
        // customize height labels
        asterPlot = new d3.aster(asterOptions);
        var customBarLabelsFunc = function(d) {
            var sliceData = d.data; // access to data for each slice
            var str = sliceData.age_group;
            str = str.replace( / yrs/ , "");
            return  str;
        };
        // customize arc labels
        asterPlot.heightLabelsFunc(customBarLabelsFunc);
        var customArcLabelsFunc = function(d) {
            var sliceData = d.data; // access to data for each slice
            var str = (+sliceData.height_var * 100).toFixed(0) + " %";
            return  str;
            
        };
        asterPlot.arcLabelsTextFunc(customArcLabelsFunc);
        // sort by ascending age
        var sortF = function(a,b){
                                var aval = a.age_group.match(/^\d+/)[0]; // get the first few digits of the age_group string
                                var bval = b.age_group.match(/^\d+/)[0];
                                return +aval > +bval;
                    };
        asterPlot.pieSortFunc(sortF);
        
        var myTooltipFunction = function(d)
        {
            var sliceData = d.data;
            return sliceData.age_group + ": "
                + "<span style='color:"+sliceData.color+"'>"
               + (sliceData.height_var * 100).toFixed(0) + "% </span> "
                 + sliceData.obese_overweight;
        };
        asterPlot.tooltipHTMLFunc(myTooltipFunction);
    }
    
    var bodyWidth = document.getElementById('page-content').offsetWidth;
    asterPlot.width(bodyWidth * 0.35);
    asterPlot.height(bodyWidth * 0.35);
    asterPlot.innerRadius(asterPlot.width() * 0.1);
    
    var atts = this.atts();
    
    d3.json(['data','agegroup',atts.countrycode,atts.year,atts.obese_overweight].join('/'), function(error,data)
        {
            if(error)
            {
                console.error("index.updateAsterPlot(); - Problem reading json from server.");
                return;
            }
    
            var md = d3.max(data, function(d) { return d.mean; });
            asterColorFunction
                .domain([0.0, md * 0.1, md*0.2, md*0.3, md*0.4, md*0.5, md*0.6, md*0.7, 2]);
    
            var countryFull = "null";
            data = data.map(function(d) {
                countryFull = d.countryname;
                return {
                    height_var: d.mean,
                    color: asterColorFunction(d.mean),
                    age_group: d.age_group,
                    label_arc_long: d.countryname,
                    label_arc_short: d.countrycode,
                    obese_overweight: d.obese_overweight
                };
            });
            
            d3.select(".asterHeader")
                .text("Prevalence of "+atts.obese_overweight+" population by age in "+ countryFull);
            
            d3.select(".obesityAster")
                .datum(data)
                .call(asterPlot);
        });
}

/* returns an object with the currently selected attribute values */
function atts() {
  return {
    countrycode: countrySelect.value,
    sex: "both",
    obese_overweight: obeseSelect.value,
    year: yearSelect.value
  };
}

