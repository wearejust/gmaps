# GMaps
Turns an element into [Google Maps](https://developers.google.com/maps/).

## Installation
```
npm install @wearejust/gmaps

yarn add @wearejust/gmaps
```

## Usage
```javascript
const GMaps = require('@wearejust/gmaps');

// Turn element into Google Maps
let gmaps = new GMaps(element, options, mapOptions, callback);

// Or use jQuery
$('.gmaps').gmaps(options, mapOptions, callback);

// Remove element
gmaps.destroy();

// Remove only listeners
gmaps.destroy(false);
```

| Parameter | Value | Default | Description |
|---|---|---|---|
| element | DOM, string, object | .gmaps | Can be DOM element, selector string or jQuery object |
| options | object | null | See [Options](#options) below |
| mapOptions | object | null | See [Map Options](#map-options) below |
| callback | function | null | Callback when GMaps is initialized |

See **examples** folder for more details

### Options
| Key | Value | Default | Description |
|---|---|---|---|
| apiKey | string | null | Your [Google Maps API key](https://developers.google.com/maps/documentation/javascript/get-api-key) |
| cluster | boolean, object | null | Enable [Marker Clustering](https://developers.google.com/maps/documentation/javascript/marker-clustering). See used [package repository](https://github.com/gmaps-marker-clusterer/gmaps-marker-clusterer/blob/master/src/markerclusterer.js#L41) for options. |
| fit | boolean | true | Fit all markers on screen |
| fitZoom | integer | -1 | Amount to zoom extra after `fit` |
| fitZoomMin | integer | 0 | Minimum zoom after `fitZoom` |
| fitZoomMax | integer | 20 | Maximum zoom after `fitZoom` |
| infowindow | object | null | Object with custom infowindow options. Use the default key to apply as default. |
| markers | object | null | Object with keys of custom marker options. Use the default key to apply as default. |
| search | DOM, string, object | null | Search input field to find places on the map |

### Map Options
Default Google Maps MapOptions. For more see https://developers.google.com/maps/documentation/javascript/reference#MapOptions

| Key | Default |
|---|---|
| mapTypeControl | false |
| streetViewControl | false |
| zoom | 17 |

### Events
The jQuery element can have events bound to it.
 
 ```javascript
 let gmaps = $('.gmaps').gmaps(options, mapOptions, callback);
 
gmaps.on('ready', function(e, g) {
   // e is the event
   // g refers to the GMaps object
 });
 ````

| Event | Description |
|---|---|
| content_close | After closing the Content of a Marker |
| content_open | After opening the Content of a Marker |
| destroy | After destroy() is called |
| marker_close | After closing a Marker |
| marker_highlight | After tabbing through Markers |
| marker_mouseout | After hovering out a Marker |
| marker_mouseover | After hovering over a Marker |
| marker_open | After opening a Marker |
| overlay_add | After adding the custom Overlay of a Marker to the map |
| overlay_draw | After drawing the custom Overlay of a Marker in the map |
| overlay_remove | After removing the custom Overlay of a Marker from the map |
| ready | After initialization |
| search | After searching |
| zoom | After zooming in or out |
