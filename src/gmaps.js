const $ = require('jquery'),
    $window = $(window);

const DEFAULT_OPTIONS = {
    apiKey: null,
    fit: true,
    fitZoom: -1,
    fitZoomMin: 0,
    fitZoomMax: 20,
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
        let markers = [this.element];

        if (this.element.is('ul')) {
            this.element.children('li').each((index, item) => {
                markers.push($(item));
            });
        }

        this.map = new google.maps.Map(this.element[0], this.mapOptions);

        this.markers = [];
        this.bounds = new google.maps.LatLngBounds();

        for (let i=0; i<markers.length; i++) {
            this.add(markers[i]);
        }

        this.keys = this.keys.bind(this);
        this.resize = this.resize.bind(this);
        this.zoom = this.zoom.bind(this);

        google.maps.event.addListenerOnce(this.map, 'idle', this.resize);

        $window.on('keydown keyup', this.keys);
        $window.on('resize', this.resize);
        this.resize();
    }

    keys(e) {
        this.metaKey = e.type == 'keydown' && (e.ctrlKey || e.metaKey);
    }

    add(element) {
        let marker = new GMapsMarker(this, element);
        if (!marker.element) return;

        this.bounds.extend(marker.position);
        this.markers.push(marker);
        this.markers = this.markers.sort((a, b) => {
            let aVal = a.position.lat();
            let bVal = b.position.lat();
            if (aVal == bVal) {
                aVal = a.position.lng();
                bVal = b.position.lng();
            }
            if (aVal > bVal) return -1;
            if (aVal < bVal) return 1;
            return 0;
        });

        this.markers.forEach((marker, index) => {
            marker.index = index;
        });
    }

    resize() {
        google.maps.event.addListenerOnce(this.map, 'zoom_changed', this.zoom);
        if (this.options.fit) {
            this.map.fitBounds(this.bounds);
        } else {
            this.map.setCenter(this.bounds.getCenter());
        }
    }

    zoom() {
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

    destroy(remove = true) {
        google.maps.event.removeListener(this.map, 'zoom_changed', this.zoom);
        google.maps.event.removeListener(this.map, 'idle', this.resize);
        $window.off('keydown keyup', this.keys);
        $window.off('resize', this.resize);
        if (remove) this.element.remove();
    }
};