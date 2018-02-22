const $ = require('jquery'),
    $window = $(window);

const DEFAULT_OPTIONS = {
    apiKey: null,
    fit: true,
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
    constructor(element = '.gmaps', options, mapOptions) {
        this.element = $(element);
        if (!this.element.length || this.element.data('GMaps')) return;
        this.element.data('GMaps', this);

        this.options = Object.assign({}, DEFAULT_OPTIONS, options || {});
        this.mapOptions = Object.assign({}, DEFAULT_MAP_OPTIONS, mapOptions || {});

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
        this.map = new google.maps.Map(this.element[0], this.mapOptions);

        this.bounds = new google.maps.LatLngBounds();
        this.resize = this.resize.bind(this);
        $window.on('resize', this.resize);

        this.zoom = this.zoom.bind(this);
        google.maps.event.addListener(this.map, 'zoom_changed', this.zoom);
        google.maps.event.addListenerOnce(this.map, 'idle', this.resize);

        this.add(this.element);

        this.resize();
    }

    add(element) {
        let lat = element.attr('data-gmaps-lat') || element.attr('data-gmaps-latitude');
        let lng = element.attr('data-gmaps-lng') || element.attr('data-gmaps-longitude');
        if (!lat || !lng) return;

        let marker = new GMapsMarker(lat, lng);
        this.bounds.extend(marker.position);
    }

    resize() {
        this.resizeZoom = true;
        if (this.options.fit) {
            this.map.fitBounds(this.bounds);
        } else {
            this.map.setCenter(this.bounds.getCenter());
        }
    }

    zoom() {
        if (this.resizeZoom) {
            this.resizeZoom = false;

            let z = this.map.getZoom();
            let n = this.mapOptions.zoom;
            
            if (this.options.fit) {
                n = z + this.options.fitZoom;
                if (this.options.fitZoomMin) {
                    n = Math.max(this.options.fitZoomMin, n);
                }
                if (this.options.fitZoomMax) {
                    n = Math.min(this.options.fitZoomMax, n);
                }
            }

            if (n != z) this.map.setZoom(n);
        }
    }

    destroy(remove = true) {
        google.maps.event.removeListener(this.map, 'zoom_changed', this.zoom);
        google.maps.event.removeListener(this.map, 'idle', this.resize);
        $window.off('resize', this.resize);
        if (remove) this.element.remove();
    }
};