/** 
* @wearejust/gmaps 
* Google Maps wrapper 
* 
* @version 2.0.0 
* @author Emre Koc <emre.koc@wearejust.com> 
*/
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var $ = require('jquery'),
    $window = $(window);

var DEFAULT_OPTIONS = {
    apiKey: null,
    fit: true,
    fitZoom: -1,
    fitZoomMin: 0,
    fitZoomMax: 10
};

var DEFAULT_MAP_OPTIONS = {
    mapTypeControl: false,
    streetViewControl: false,
    zoom: 17
};

var queue = [];
window.gmaps_load_callback = function () {
    while (queue.length) {
        queue.pop().init();
    }
};

module.exports = function () {
    function GMaps() {
        var element = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '.gmaps';
        var options = arguments[1];
        var mapOptions = arguments[2];

        _classCallCheck(this, GMaps);

        this.element = $(element);
        if (!this.element.length || this.element.data('GMaps')) return;
        this.element.data('GMaps', this);

        this.options = _extends({}, DEFAULT_OPTIONS, options || {});
        this.mapOptions = _extends({}, DEFAULT_MAP_OPTIONS, mapOptions || {});

        if (!window.google) {
            queue.push(this);
            if (queue.length === 1) {
                $.getScript('https://maps.googleapis.com/maps/api/js?v=3&callback=gmaps_load_callback&key=' + this.options.apiKey);
            }
        } else {
            this.init();
        }
    }

    GMaps.prototype.init = function init() {
        this.map = new google.maps.Map(this.element[0], this.mapOptions);

        this.bounds = new google.maps.LatLngBounds();
        this.resize = this.resize.bind(this);
        $window.on('resize', this.resize);

        this.zoom = this.zoom.bind(this);
        google.maps.event.addListener(this.map, 'zoom_changed', this.zoom);
        google.maps.event.addListenerOnce(this.map, 'idle', this.resize);

        this.add(this.element);

        this.resize();
    };

    GMaps.prototype.add = function add(element) {
        var lat = element.attr('data-gmaps-lat') || element.attr('data-gmaps-latitude');
        var lng = element.attr('data-gmaps-lng') || element.attr('data-gmaps-longitude');
        if (!lat || !lng) return;

        var marker = new GMapsMarker(lat, lng);
        this.bounds.extend(marker.position);
    };

    GMaps.prototype.resize = function resize() {
        this.resizeZoom = true;
        if (this.options.fit) {
            this.map.fitBounds(this.bounds);
        } else {
            this.map.setCenter(this.bounds.getCenter());
        }
    };

    GMaps.prototype.zoom = function zoom() {
        if (this.resizeZoom) {
            this.resizeZoom = false;

            var z = this.map.getZoom();
            var n = this.mapOptions.zoom;

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
    };

    GMaps.prototype.destroy = function destroy() {
        var remove = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        google.maps.event.removeListener(this.map, 'zoom_changed', this.zoom);
        google.maps.event.removeListener(this.map, 'idle', this.resize);
        $window.off('resize', this.resize);
        if (remove) this.element.remove();
    };

    return GMaps;
}();
/** 
* @wearejust/gmaps 
* Google Maps wrapper 
* 
* @version 2.0.0 
* @author Emre Koc <emre.koc@wearejust.com> 
*/
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GMapsMarker = function GMapsMarker(lat, lng) {
    _classCallCheck(this, GMapsMarker);

    this.position = new google.maps.LatLng(lat, lng);
};