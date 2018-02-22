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
    fitZoomMax: 20
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
        var markers = [this.element];

        if (this.element.is('ul')) {
            this.element.children('li').each(function (index, item) {
                markers.push($(item));
            });
        }

        this.map = new google.maps.Map(this.element[0], this.mapOptions);

        this.markers = [];
        this.bounds = new google.maps.LatLngBounds();

        for (var i = 0; i < markers.length; i++) {
            this.add(markers[i]);
        }

        this.resize = this.resize.bind(this);
        this.zoom = this.zoom.bind(this);

        google.maps.event.addListenerOnce(this.map, 'idle', this.resize);

        $window.on('resize', this.resize);
        this.resize();
    };

    GMaps.prototype.add = function add(element) {
        var marker = new GMapsMarker(element, this.map);
        if (!marker.element) return;

        this.bounds.extend(marker.position);
        this.markers.push(marker);
        this.markers = this.markers.sort(function (a, b) {
            var aVal = a.position.lat();
            var bVal = b.position.lat();
            if (aVal == bVal) {
                aVal = a.position.lng();
                bVal = b.position.lng();
            }
            if (aVal > bVal) return -1;
            if (aVal < bVal) return 1;
            return 0;
        });

        this.markers.forEach(function (marker, index) {
            marker.index = index;
        });
    };

    GMaps.prototype.resize = function resize() {
        google.maps.event.addListenerOnce(this.map, 'zoom_changed', this.zoom);
        if (this.options.fit) {
            this.map.fitBounds(this.bounds);
        } else {
            this.map.setCenter(this.bounds.getCenter());
        }
    };

    GMaps.prototype.zoom = function zoom() {
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
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GMapsMarker = function GMapsMarker(element, map) {
    var _this = this;

    _classCallCheck(this, GMapsMarker);

    if (!element.length) return;
    var lat = void 0,
        lng = void 0,
        location = element.attr('data-gmaps-location');
    if (location) location = location.split(',');
    lat = location ? location[0] : element.attr('data-gmaps-lat') || element.attr('data-gmaps-latitude');
    lng = location ? location[1] : element.attr('data-gmaps-lng') || element.attr('data-gmaps-longitude');
    if (!lat || !lng) return;

    this.element = element;
    this.map = map;
    this.position = new google.maps.LatLng(lat, lng);

    var markerOptions = {
        draggable: true,
        map: this.map,
        position: this.position,
        label: this.element.attr('data-gmaps-label'),
        title: this.element.attr('data-gmaps-title') || this.element.attr('title') || this.element.find('.gmaps-title').text()
    };

    this.marker = new google.maps.Marker(markerOptions);
    this.marker.addListener('dragend', function (e) {
        console.log(_this.marker.getPosition().lat(), _this.marker.getPosition().lng());
    });
};