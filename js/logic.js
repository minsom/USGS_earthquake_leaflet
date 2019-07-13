// Store our API endpoint inside URL
//// url for earthquake data for last seven days
var usgsURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
//// url for tectonic plates
var tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";


// define color schemes according to earthquake magnitude
function magColor(mag) {
  return mag >= 5 ? '#bd0026':
         mag >= 4 ? '#f03b20':
         mag >= 3 ? '#fd8d3c':
         mag >= 2 ? '#feb24c':
         mag >= 1 ? '#fed976':
                    '#ffffb2'; // 0-1 mag
}

// Perform a GET request to the earthquake URL
d3.json(usgsURL, function(data) {
  console.log(data);
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});//|
  // |
  // |
function createFeatures(earthquakeData) {

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Give each feature a popup describing the place, magnitude, and time of the earthquake
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: function(feature, layer) {
      layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><p>Magnitude: ${feature.properties.mag}<br>Time: ${new Date(feature.properties.time)}</p>`);
    },
    pointToLayer: function(feature,latlng) {
      return L.circleMarker(latlng, {
        radius: feature.properties.mag*3,
        fillColor: magColor(feature.properties.mag),
        color: "#fff",
        weight: 1.5,
        opacity: 1,
        fillOpacity: 1
      });
    }
  });

  // Sending our geoJSON earthquakes layer to the createMap function
  createMap(earthquakes);
};// |
  // |
  // |
function createMap(earthquakes) {

  // Define base map layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets-basic",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    id: "satellite-streets-v11",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap,
    "Satellite Map": satellitemap
  };


  var tectonicPlates = new L.LayerGroup();
  // fault line data layer
  d3.json(tectonicPlatesURL, function(data) {
    // JSON object for tectonic plates
    L.geoJSON(data, {
        color: "limegreen",
        weight: 2
        }
    ).addTo(tectonicPlates)
  })//tectonic plates d3.json



  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    "Fault Lines": tectonicPlates,
  };

  // console.log(myMap.getPanes())
  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4,
    layers: [darkmap, tectonicPlates, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


  //Create a legend on the bottom right
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function(){
    var div = L.DomUtil.create('div', 'info legend');
    var colorSchemes = ['#ffffb2','#fed976','#feb24c','#fd8d3c','#f03b20','#bd0026'];
    var labels = [];

    var legendTitle = `<h5>Magnitude</h5>`;
    div.innerHTML = legendTitle;  

    for (var i = 0; i < colorSchemes.length; i++) {
      let label = `<li>
                    <div style="width: 22px; height: 22px; background-color: ${colorSchemes[i]}; display: inline-block;"/>
                    </div>
                    <span style="vertical-align: top;">
                      ${i}+
                    </span>
                  </li>`;
      labels.push(label);
    };
    // console.log(labels);
    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
  
  }; // end of leaflet legend

  legend.addTo(myMap);

} //end of createMap()


