# GMaps

## Installation
```
npm install @wearejust/gmaps

yarn add @wearejust/gmaps
```

## Usage
```javascript
const GMaps = require('@wearejust/gmaps');

let gmaps = new GMaps(element, options, mapOptions);
```
`Element` can be a DOM element, selector string or jQuery object. See **examples** folder for more details

### Options
| Key | Value | Default | Description |
|---|---|---|---|
| apiKey | string | null | Your [Google Maps API key](https://developers.google.com/maps/documentation/javascript/get-api-key).  |
| fit | boolean | true | Fit all markers on screen |
| fitZoom | integer | -1 | Amount to zoom extra after `fit` |
| fitZoomMin | integer | 0 | Minimum zoom after `fitZoom` |
| fitZoomMax | integer | 10 | Maximum zoom after `fitZoom` |

### MapOptions
Default Google Maps MapOptions. For more see https://developers.google.com/maps/documentation/javascript/reference#MapOptions

| Key | Default |
|---|---|
| mapTypeControl | false |
| streetViewControl | false |
| zoom | 17 |
    


