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

$.fn.gmaps = function(options, mapOptions, callback) {
    return $(this).each((index, item) => {
        new module.exports(item, options, mapOptions, callback);
    });
};
if (window.$) {
    window.$.fn.gmaps = $.fn.gmaps;
}

let queue = [];
window.gmaps_load_callback = function() {
    while (queue.length) {
        queue.pop().init();
    }
};

module.exports = class GMaps {
    constructor(element = '.gmaps', options, mapOptions, callback) {
        this.element = $(element);
        if (!this.element.length || this.element.data('GMaps')) return;

        if (this.element.length > 1) {
            this.element.gmaps(options, mapOptions, callback);
            return;
        }

        this.element.data('GMaps', this);

        this.options = Object.assign({}, DEFAULT_OPTIONS, options || {});
        this.mapOptions = Object.assign({}, DEFAULT_MAP_OPTIONS, mapOptions || {});
        this.callback = callback;

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
        let container = this.element.attr('data-gmaps-container');
        let markers = [this.element];
        if (this.element.is('ul')) {
            this.element.children('li').each((index, item) => {
                markers.push($(item));
            });

            if (!container) {
                let replacement = $(`<div></div>`);
                $.each(this.element[0].attributes, (index, item) => {
                    replacement.attr(item.name, item.value);
                });
                this.element.replaceWith(replacement);
                this.element = replacement;
            }
        }

        container = $(container || this.element);
        this.map = new google.maps.Map(container[0], this.mapOptions);

        this.markers = [];
        this.bounds = new google.maps.LatLngBounds();

        let i, marker;
        for (i=0; i<markers.length; i++) {
            marker = new GMapsMarker(this, markers[i]);
            if (!marker.element) continue;
            this.bounds.extend(marker.position);
            this.markers.push(marker);
        }

        this.markers = this.markers.sort((a, b) => {
            let aVal = a.position.lat(),
                bVal = b.position.lat();
            if (aVal == bVal) {
                aVal = a.position.lng();
                bVal = b.position.lng();
            }
            return (aVal > bVal) ? -1 : (aVal < bVal ? 1 : 0);
        });
        this.markers.forEach((marker, index) => {
            marker.index = index;
        });

        this.keys = this.keys.bind(this);
        this.resize = this.resize.bind(this);
        this.zoom = this.zoom.bind(this);

        this.tabIndex = -1;
        this.element.attr('tabindex', '0');
        this.element.on('focusin', this.focus.bind(this));
        this.element.on('focusout', this.focus.bind(this));

        google.maps.event.addListenerOnce(this.map, 'idle', this.resize);

        $window.on('resize', this.resize);
        this.resize();

        if (typeof this.callback == 'function') {
            this.callback(this);
        }
    }

    focus(e) {
        clearTimeout(this.focusTimeout);
        if (e.type == 'focusin') {
            $window.on('keydown keyup', this.keys);
        } else {
            $window.off('keydown keyup', this.keys);
            this.focusTimeout = setTimeout(() => {
                this.tabIndex = -1;
                for (let i=0; i<this.markers.length; i++) {
                    this.markers[i].highlight(false, false);
                }
            }, 100);
        }
    }

    keys(e) {
        this.metaKey = e.type == 'keydown' && (e.ctrlKey || e.metaKey);

        if (e.type == 'keydown') {
            if (e.keyCode == 9) { // Tab
                this.tabIndex = Math.max(-1, Math.min(this.markers.length, this.tabIndex + (e.shiftKey ? -1 : 1)));
                this.highlight(this.tabIndex);

            } else if (e.keyCode == 13 || e.keyCode == 32) { // Space or Enter
                if (this.tabIndex >= 0 && this.tabIndex < this.markers.length) {
                    e.preventDefault();
                    this.markers[this.tabIndex].open();
                }

            } else if (e.keyCode == 27) { // Esc
                this.closeAllMarkers();
            }
        }
    }

    highlight(index) {
        let active = (index !== undefined && index >= 0 && index < this.markers.length);
        for (let i=0; i<this.markers.length; i++) {
            this.markers[i].highlight(i == index, active);
        }
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

    closeAllMarkers() {
        for (let i=0; i<this.markers.length; i++) {
            this.markers[i].close();
        }
    }
};