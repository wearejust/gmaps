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

var $ = require('jquery');

var DEFAULT_OPTIONS = {
    apiKey: 'KEY',
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
    function GMaps(element, options, mapOptions) {
        _classCallCheck(this, GMaps);

        this.element = $(element);
        if (!this.element.length || this.element.data('GMaps')) return;
        this.element.data('GMaps', this);

        this.options = _extends(DEFAULT_OPTIONS, options);
        this.mapOptions = _extends(DEFAULT_MAP_OPTIONS, mapOptions);

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
        console.log(this);
    };

    return GMaps;
}();