function onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}

var mytiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
});
// Initialise an empty map
var map = L.map('map');
// Read the GeoJSON data with jQuery, and create a circleMarker element for each tweet
// Each tweet will be represented by a nice red dot
$.getJSON("/geo_data.json", function(data) {
    var myStyle = {
        radius: 2,
        fillColor: "red",
        color: "red",
        weight: 1,
        opacity: 1,
        fillOpacity: 1
    };

    var myIcon = L.icon({
        iconUrl: '/pokemon/1.png',
        // iconUrl: '/pokemon/' + data.features.properties.pokemon +'.png',
        iconSize: [20, 20],
        iconAnchor: [0, 0],
        popupAnchor: [-3, -76]
    });


    var geojson = L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, myStyle);
        },
        onEachFeature: onEachFeature
    });
    geojson.addTo(map)
});

map.addLayer(mytiles).setView([40, -112], 3);