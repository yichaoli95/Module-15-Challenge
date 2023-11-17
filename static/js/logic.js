console.log("app.js")

//base map
var theMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});


var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});


let myMap = L.map("map", {
    center: [
        34.0479, 100.6197
    ],
    zoom: 3,
});

theMap.addTo(myMap);

//over layer
let tectonicplates = new L.LayerGroup();
let earthquakes = new L.LayerGroup();

let baseMaps = {
    "Light Global": theMap,
    "3D Global": topo
};

let overlays = {
    "Tectonic Plates": tectonicplates,
    Earthquakes: earthquakes
};

L
    .control
    .layers(baseMaps, overlays, { collapsed: false })
    .addTo(myMap);

//d3
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }

    function getColor(magnitude) {
        return magnitude > 90 ? '#c27ba0' :
            magnitude > 70 ? '#e06666' :
                magnitude > 50 ? '#f6b26b' :
                    magnitude > 30 ? '#ffd966' :
                        magnitude > 10 ? '#93c47d' :
                            '#7dc4a2';
    }

    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }

        return magnitude * 4;
    }


    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        onEachFeature: function (feature, layer) {
            layer.bindPopup(
                "Magnitude: "
                + feature.properties.mag
                + "<br>Depth: "
                + feature.geometry.coordinates[2]
                + "<br>Location: "
                + feature.properties.place
            );
        }
    }).addTo(earthquakes);

    earthquakes.addTo(myMap);

})


///
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (platedata) {
    
    L.geoJson(platedata, {
      color: "orange",
      weight: 2
    })
      .addTo(tectonicplates);

      tectonicplates.addTo(myMap);
  });

////
  let legend = L.control({
    position: "bottomright"
  });

  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");

    let grades = [-10, 10, 30, 50, 70, 90];

    let colors = [
      "#7dc4a2",
      "#93c47d",
      "#ffd966",
      "#f6b26b",
      "#e06666",
      "#c27ba0"];

       for (let i = 0; i < grades.length; i++) {
      div.innerHTML += "<i style='background: "
        + colors[i]
        + "'></i> "
        + grades[i]
        + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };

  legend.addTo(myMap);