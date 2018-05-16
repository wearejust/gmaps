require('gmaps-marker-clusterer');
const $ = require('jquery'),
    Marker = require('./marker');

const $window = $(window);

const DEFAULT_OPTIONS = {
    apiKey: null,
    fit: true,
    fitZoom: -1,
    fitZoomMin: 0,
    fitZoomMax: 20,
    markerEmptyZoom: '3',
    spread: 0,
};

const DEFAULT_MAP_OPTIONS = {
    mapTypeControl: false,
    streetViewControl: false,
    zoom: 17,
};

const DEFAULT_CLUSTER_OPTIONS = {
    cssClass: 'gmaps-cluster',
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

global.GMaps = module.exports = class GMaps {
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

        if (!window.google || !window.google.maps) {
            queue.push(this);
            if (queue.length === 1) {
                $.getScript(`https://maps.googleapis.com/maps/api/js?v=3&libraries=places&callback=gmaps_load_callback&key=${this.options.apiKey}`);
            }

        } else {
            this.init();
        }
    }

    init() {
        let container = this.element.attr('data-gmaps-container');
        let markers = [this.element.clone()];
        if (this.element.is('ul')) {
            this.element.children('li').each((index, item) => {
                markers.push($(item));
            });

            if (container) {
                container = $(`[data-gmaps-id="${container}"],${container}`);

            } else {
                let replacement = $(`<div></div>`);
                $.each(this.element[0].attributes, (index, item) => {
                    replacement.attr(item.name, item.value);
                });

                let e, c, h, events = this.element[0].events || $.data(this.element[0], 'events') || $._data(this.element[0], 'events');
                for (e in events) {
                    for (c=0; c<events[e].length; c++) {
                        h = events[e][c];
                        replacement.on(h.type, h.handler);
                    }
                }

                this.element.replaceWith(replacement);
                this.element = replacement;
            }
        }

        if (!container || !container.length) container = this.element;
        this.map = new google.maps.Map(container[0], this.mapOptions);

        this.markers = [];
        this.bounds = new google.maps.LatLngBounds();

        let i, marker, key, positions = {};
        for (i=0; i<markers.length; i++) {
            marker = new Marker(this, markers[i]);
            if (!marker.element) continue;
            this.bounds.extend(marker.position);
            this.markers.push(marker);

            if (this.options.spread) {
                key = `lat${marker.position.lat()}lng${marker.position.lng()}`;
                if (!positions[key]) positions[key] = [];
                positions[key].push(marker);
            }
        }

        if (this.options.spread) {
            let p, position;
            for (p in positions) {
                position = positions[p];
                if (position.length > 1) {
                    for (i=0; i<position.length; i++) {
                        position[i].offset(i / position.length, this.options.spread);
                    }
                }
            }
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
            marker.marker.setOptions({
                zIndex: index,
            });
        });

        if (this.options.cluster) {
            let markers = this.markers.map(item => {
                return item.marker;
            });
            let options = Object.assign(DEFAULT_CLUSTER_OPTIONS, this.options.cluster === true ? {} : this.options.cluster);
            this.clusterer = new MarkerClusterer(this.map, markers, options);
        }

        if (this.options.search) {
            this.searchBox = new google.maps.places.SearchBox($(this.options.search)[0]);
            this.searchBox.addListener('places_changed', this.search.bind(this));
        }

        this.keys = this.keys.bind(this);
        this.resize = this.resize.bind(this);
        this.zoom = this.zoom.bind(this);

        this.tabIndex = -1;
        this.element.attr('tabindex', '0');
        this.element.on('focusin', this.focus.bind(this));
        this.element.on('focusout', this.focus.bind(this));

        google.maps.event.addListenerOnce(this.map, 'idle', this.resize);
        google.maps.event.addListener(this.map, 'click', this.closeAllMarkers.bind(this));
        $window.on('resize', this.resize);
        this.resize();

        this.element.trigger('ready', this);

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
        if (this.options.fit) {
            google.maps.event.addListenerOnce(this.map, 'zoom_changed', this.zoom);
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
        this.element.trigger('zoom', this);
    }

    destroy(remove = true) {
        google.maps.event.removeListener(this.map, 'zoom_changed', this.zoom);
        google.maps.event.removeListener(this.map, 'idle', this.resize);
        $window.off('keydown keyup', this.keys);
        $window.off('resize', this.resize);
        if (remove) this.element.remove();
        this.element.trigger('destroy', this);
    }

    closeAllMarkers() {
        for (let i=0; i<this.markers.length; i++) {
            this.markers[i].close();
        }
    }

    search() {
        let places = this.searchBox.getPlaces();
        if (!places || !places.length) this.resize();
        let place = places[0];
        if (!place.geometry || !place.geometry.viewport) this.resize();
        this.map.fitBounds(place.geometry.viewport);
        this.element.trigger('search', this);
    }
};