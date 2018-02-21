const $ = require('jquery');

const DEFAULT_OPTIONS = {
    apiKey: 'KEY',
    fitZoom: -1,
    fitZoomMin: 0,
    fitZoomMax: 10,
};

const DEFAULT_MAP_OPTIONS = {
    mapTypeControl: false,
    streetViewControl: false,
    zoom: 17
};

let queue = [];
window.gmaps_load_callback = function() {
    while (queue.length) {
        queue.pop().init();
    }
};

module.exports = class GMaps {
    constructor(element, options, mapOptions) {
        this.element = $(element);
        if (!this.element.length || this.element.data('GMaps')) return;
        this.element.data('GMaps', this);

        this.options = Object.assign(DEFAULT_OPTIONS, options);
        this.mapOptions = Object.assign(DEFAULT_MAP_OPTIONS, mapOptions);

        if (!window.google) {
            queue.push(this);
            if (queue.length === 1) {
                $.getScript(`https://maps.googleapis.com/maps/api/js?v=3&callback=gmaps_load_callback&key=${this.options.apiKey}`);
            }

        } else {
            this.init();
        }
    }
    
    init() {
        console.log(this);
    }
};