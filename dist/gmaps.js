/** 
* @wearejust/gmaps 
* Google Maps wrapper 
* 
* @version 1.1.3 
* @author Emre Koc <emre.koc@wearejust.com> 
*/
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var $window = $(window);
var options = void 0,
    mapOptions = void 0,
    queue = [];

module.exports.init = function (opts, mapOpts) {
    if (!options) {
        options = $.extend({
            apiKey: 'KEY',
            fitZoom: -1,
            fitZoomMin: 0,
            fitZoomMax: 10
        }, opts || {});

        mapOptions = $.extend({
            mapTypeControl: false,
            streetViewControl: false,
            zoom: 17
        }, mapOpts || {});

        if (!window.google) {
            window.gmaps_load_callback = parse;
            $.getScript('https://maps.googleapis.com/maps/api/js?v=3&callback=gmaps_load_callback&key=' + options.apiKey);
        } else {
            parse();
        }
    } else if (window.google) {
        parse();
    }
};

$.fn.gmaps = function (options, mapOptions) {
    var items = $(this).each(function (index, item) {
        item = $(item);
        if (!item.data('GMaps')) {
            queue.push(new GMaps(item, options, mapOptions));
        }
    });

    module.exports.init(options, mapOptions);

    return items;
};

function parse() {
    while (queue.length) {
        queue.pop().init();
    }
}

var GMaps = function () {
    function GMaps(element, options, mapOptions) {
        _classCallCheck(this, GMaps);

        this.element = element;
        this.element.data('GMaps', this);
        this.options = options;
        this.mapOptions = mapOptions;
    }

    GMaps.prototype.init = function init() {
        this.options = $.extend(options, this.options || {});
        this.mapOptions = $.extend(mapOptions, this.mapOptions || {});

        if (this.element.is('ul')) {
            this.items = this.element.find('li');

            var el = '';
            $.each(this.element[0].attributes, function (index, item) {
                el += item.name + '="' + item.value + '" ';
            });
            el = $('<div ' + el + '></div>');
            this.element.replaceWith(el);
            this.element = el;
        }

        this.map = new google.maps.Map(this.element[0], this.mapOptions);

        this.markers = [];
        this.bounds = new google.maps.LatLngBounds();
        this.element.add(this.items).each(function (index, item) {
            item = new Item($(item), this.map, this.mapOptions);
            if (item.position) {
                this.markers.push(item);
                this.bounds.extend(item.position);
            }
        }.bind(this));

        google.maps.event.addListener(this.map, 'zoom_changed', this.zoom.bind(this));
        $window.on('resize', this.resize.bind(this));
        this.resize();
    };

    GMaps.prototype.resize = function resize() {
        this.resizeZoom = true;
        this.map.fitBounds(this.bounds);
    };

    GMaps.prototype.zoom = function zoom() {
        if (this.resizeZoom) {
            this.resizeZoom = false;
            var z = this.map.getZoom();
            var n = z + this.options.fitZoom;
            if (this.options.fitZoomMin) {
                n = Math.max(this.options.fitZoomMin, n);
            }
            if (this.options.fitZoomMax) {
                n = Math.min(this.options.fitZoomMax, n);
            }
            if (n != z) {
                this.map.setZoom(n);
            }
        }
    };

    return GMaps;
}();
/** 
* @wearejust/gmaps 
* Google Maps wrapper 
* 
* @version 1.1.3 
* @author Emre Koc <emre.koc@wearejust.com> 
*/
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Item = function () {
    function Item(element, map, mapOptions) {
        _classCallCheck(this, Item);

        this.element = element;
        this.map = map;
        this.mapOptions = mapOptions;

        var lat = this.element.attr('data-gmaps-lat') || this.element.attr('data-gmaps-latitude');
        var lng = this.element.attr('data-gmaps-lng') || this.element.attr('data-gmaps-longitude');
        if (!lat || !lng) return;

        this.title = this.element.attr('data-gmaps-title') || this.element.attr('title') || this.element.find('.gmaps-title').text();
        this.position = new google.maps.LatLng(lat, lng);

        this.marker = new google.maps.Marker({
            position: this.position,
            map: this.map,
            icon: this.mapOptions.markerIcon,
            title: this.title
        });

        this.link = this.element.attr('data-gmaps-link');
        if (this.link) {
            this.linkTarget = this.element.attr('data-gmaps-link-target');
            if (this.linkTarget == 'blank') this.linkTarget = '_blank';
            $window.on('keydown keyup', this.keys.bind(this));

            this.marker.addListener('click', this.open.bind(this));
        } else {
            var content = this.element.html();
            if (content && $.trim(content).length) {
                this.infowindow = new google.maps.InfoWindow({
                    content: content
                });

                this.marker.addListener('click', this.show.bind(this));
            }
        }
    }

    Item.prototype.keys = function keys(e) {
        this.metaKey = e.type == 'keydown' && (e.ctrlKey || e.metaKey);
    };

    Item.prototype.open = function open() {
        if (this.metaKey || this.linkTarget == '_blank') {
            window.open(this.link);
        } else {
            window.location = this.link;
        }
    };

    Item.prototype.show = function show() {
        this.infowindow.open(this.map, this.marker);
    };

    return Item;
}();