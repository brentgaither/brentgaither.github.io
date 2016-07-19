---
layout: default
title: Pokemon Go!
permalink: /pokemongo/
---

<head>
<link rel="stylesheet" href="http://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.3/leaflet.css" />
<script src="http://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.3/leaflet.js"></script>
<script src="http://code.jquery.com/jquery-2.1.0.min.js"></script>
<!-- this goes in the <head> -->

<style>
#map {
    height: 600px;
}
</style>
</head>
<body>
<!-- this goes in the <body> -->
<div id="map"></div>
</body>

<script src="{{ relative }}/javascripts/pokeMapper.js"></script>