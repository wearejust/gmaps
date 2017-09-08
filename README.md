# GMaps

### Installation
```
npm install @wearejust/gmaps --save
```

### Usage
You can use *init* to set the default options and optional <a href="https://developers.google.com/maps/documentation/javascript/reference#MapOptions">MapOptions</a>, and/or override them with the jQuery usage.
```javascript
var GMaps = require('@wearejust/gmaps');

$(function() {
    GMaps.init({
        // Options
        apiKey: 'KEY',      // Your Google Maps API key
        fitZoom: -1,        // Amount of extra zoom after fit (resize)
        fitZoomMin: 0,      // Minimum zoom after fit (resize)
        fitZoomMax: 10      // Maximum zoom after fit (resize)
    }, {
        // MapOptions
        mapTypeControl: false,
        streetViewControl: false,
        zoom: 17
    });
});
```

#### jQuery
```javascript
require('@wearejust/gmaps');

$(function() {
    $('.gmaps').gmaps({
        // Options
        apiKey: 'KEY',      // Your Google Maps API key
        fitZoom: -1,        // Amount of extra zoom after fit (resize)
        fitZoomMin: 0,      // Minimum zoom after fit (resize)
        fitZoomMax: 10      // Maximum zoom after fit (resize)
    }, {
        // MapOptions
        mapTypeControl: false,
        streetViewControl: false,
        zoom: 17
    });
});
```