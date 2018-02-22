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
| cluster | boolean, object | null | Enable [Marker Clustering](https://developers.google.com/maps/documentation/javascript/marker-clustering) |
| fit | boolean | true | Fit all markers on screen |
| fitZoom | integer | -1 | Amount to zoom extra after `fit` |
| fitZoomMin | integer | 0 | Minimum zoom after `fitZoom` |
| fitZoomMax | integer | 20 | Maximum zoom after `fitZoom` |
| markers | object | null | Object with keys of custom marker options. Use the default key to apply as default. |
| infowindow | object | null | Object with custom infowindow options. Use the default key to apply as default. |

### Map Options
Default Google Maps MapOptions. For more see https://developers.google.com/maps/documentation/javascript/reference#MapOptions

| Key | Default |
|---|---|
| mapTypeControl | false |
| streetViewControl | false |
| zoom | 17 |
    


