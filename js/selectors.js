var yearSelect,
    countrySelect,
    obeseSelect;

// build selector with year list
yearSelect = document.getElementById( 'yearselect' );
for(var i=1990;i<2014;i++)
  {
    yearSelect.add(new Option(i));
  }
yearSelect.selectedIndex = yearSelect.options.length-1;
addEventListeners(yearSelect);

// build selector with obesity vs overweight-ness 
obeseSelect = document.getElementById( 'obeseselect' );
obeseSelect.add(new Option("obese"));
obeseSelect.add(new Option("overweight"));
addEventListeners(obeseSelect);

// build selector with country list
countrySelect = document.getElementById( 'countryselect' );
d3.csv("/data/locations.csv", function(data) {
  data.forEach(function(d) {
     countrySelect.add(new Option(d.location_name));
  });
  addEventListeners(countrySelect);

  BAR_CHART.graphInit(atts());
});


function atts(){
  return { countryname: countrySelect.value,
            sex: "both",
            obese_overweight: obeseSelect.value,
            year: yearSelect.value
         };
}

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

function updateBarGraph()
{
  BAR_CHART.graphUpdate(atts());
}

// add event listeners safely
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

