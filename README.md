# GMaps

### Installation
```
npm install @wearejust/gmaps --save
```

### Usage (jQuery)
```javascript
require('@wearejust/gmaps');

$(function() {
    $('.gmaps').gmaps(options);
});
```

### Usage (class)
```javascript
var GMaps = require('@wearejust/gmaps');

$(function() {
    let gmaps = $('.gmaps');
    new GMaps(gmaps, options);
});
```