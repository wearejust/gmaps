/** 
* @wearejust/gmaps 
* Google Maps wrapper 
* 
* @version 1.4.0 
* @author Emre Koc <emre.koc@wearejust.com> 
*/
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var $ = require('jquery');
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
        var container = this.element.attr('data-gmaps-container');

        if (this.element.is('ul')) {
            this.items = this.element.find('li');

            if (!container) {
                var el = '';
                $.each(this.element[0].attributes, function (index, item) {
                    el += item.name + '="' + item.value + '" ';
                });
                el = $('<div ' + el + '></div>');
                this.element.replaceWith(el);
                this.element = el;
            }
        }

        container = $('[data-gmaps-id="' + container + '"]');
        this.map = new google.maps.Map(container.length ? container[0] : this.element[0], this.mapOptions);

        var key = void 0,
            positions = {};
        this.markers = [];
        this.bounds = new google.maps.LatLngBounds();
        this.element.add(this.items).each(function (index, item) {
            item = new Item(index, $(item), container, this.map, this.options, this.mapOptions);
            if (item.position) {
                item.onOpen = this.markerOpen.bind(this);
                item.onClose = this.markerClose.bind(this);
                this.markers.push(item);
                this.bounds.extend(item.position);

                key = 'lat' + item.position.lat() + 'lng' + item.position.lng();
                if (!positions[key]) positions[key] = [];
                positions[key].push(item);
            }
        }.bind(this));

        var i = void 0,
            p = void 0,
            position = void 0;
        for (p in positions) {
            position = positions[p];
            if (position.length > 1) {
                for (i = 0; i < position.length; i++) {
                    position[i].offset(i / position.length);
                }
            }
        }

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

        this.tabIndex = -1;
        this.tab = this.tab.bind(this);
        this.element.attr('tabindex', '0');
        this.element.on('focus', this.focus.bind(this));
        this.element.on('blur', this.blur.bind(this));
        $window.on('keydown keyup', this.keys.bind(this));

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

    GMaps.prototype.keys = function keys(e) {
        this.shiftKey = e.type == 'keydown' && e.shiftKey;
        if (e.type == 'keydown' && this.tabIndex != -1) {
            if (e.keyCode == 13 || e.keyCode == 32) {
                if (!this.markerOpened || this.markerOpened != this.markers[this.tabIndex]) {
                    this.markers[this.tabIndex].open();
                }
            } else if (e.keyCode == 27 && this.markerOpened) {
                this.markerOpened.close();
            }
        }
    };

    GMaps.prototype.focus = function focus(e) {
        $window.on('keydown', this.tab);
        if (this.tabIndex == -1) this.tabIndex = e.shiftKey || this.shiftKey ? this.markers.length - 1 : 0;
        this.tab();
    };

    GMaps.prototype.blur = function blur() {
        if (!this.markerOpened) {
            $window.off('keydown', this.tab);
            this.tabIndex = -1;
            var i = void 0;
            for (i = 0; i < this.markers.length; i++) {
                this.markers[i].toggle(true);
            }
        }
    };

    GMaps.prototype.tab = function tab(e) {
        if (!this.markerOpened && (!e || e.keyCode == 9)) {
            if (e) {
                e.preventDefault();
                this.tabIndex += e.shiftKey ? -1 : 1;
            }

            if (this.tabIndex >= 0 && this.tabIndex < this.markers.length) {
                var i = void 0;
                for (i = 0; i < this.markers.length; i++) {
                    this.markers[i].toggle(i == this.tabIndex);
                }
            } else {
                this.blur();
            }
        }
    };

    GMaps.prototype.markerOpen = function markerOpen(marker) {
        if (this.markerOpened) {
            this.markerOpened.close();
        }
        this.markerOpened = marker;
    };

    GMaps.prototype.markerClose = function markerClose() {
        this.markerOpened = null;
        if (this.tabIndex != -1) {
            this.element.focus();
        }
    };

    return GMaps;
}();
/** 
* @wearejust/gmaps 
* Google Maps wrapper 
* 
* @version 1.4.0 
* @author Emre Koc <emre.koc@wearejust.com> 
*/
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Item = function () {
    function Item(index, element, container, map, options, mapOptions) {
        _classCallCheck(this, Item);

        this.index = index;
        this.element = element;
        this.container = container;
        this.map = map;
        this.options = options;
        this.mapOptions = mapOptions;

        var lat = this.element.attr('data-gmaps-lat') || this.element.attr('data-gmaps-latitude');
        var lng = this.element.attr('data-gmaps-lng') || this.element.attr('data-gmaps-longitude');
        if (!lat || !lng) return;
        this.position = new google.maps.LatLng(lat, lng);

        var markerOptions = {
            map: this.map,
            zIndex: this.index,
            position: this.position,
            label: this.element.attr('data-gmaps-label'),
            title: this.element.attr('data-gmaps-title') || this.element.attr('title') || this.element.find('.gmaps-title').text()
        };

        var marker = this.options.markers ? this.options.markers[this.element.attr('data-gmaps-marker')] : null;
        if (marker) {
            markerOptions.icon = marker.icon;
            if (marker.label) {
                marker.label.text = markerOptions.label;
                markerOptions.label = marker.label;
            }
        }

        this.marker = new google.maps.Marker(markerOptions);

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

                google.maps.event.addListener(this.infowindow, 'closeclick', this.close.bind(this));

                this.marker.addListener('click', this.open.bind(this));

                this.marker.addListener('mouseover', function () {
                    this.marker.setOptions({ zIndex: 9999999 });
                }.bind(this));
                this.marker.addListener('mouseout', function () {
                    this.marker.setOptions({ zIndex: this.index });
                }.bind(this));
            }
        }
    }

    Item.prototype.offset = function offset(n) {
        var lat = this.position.lat() + Math.sin(n * Math.PI * 2) * 0.00006;
        var lng = this.position.lng() + Math.cos(n * Math.PI * 2) * 0.0001;
        this.position = new google.maps.LatLng(lat, lng);
        this.marker.setPosition(this.position);
    };

    Item.prototype.keys = function keys(e) {
        this.metaKey = e.type == 'keydown' && (e.ctrlKey || e.metaKey);
    };

    Item.prototype.open = function open() {
        if (this.infowindow) {
            if (!this.opened) {
                this.opened = true;
                this.marker.setVisible(false);

                this.infowindow.open(this.map, this.marker);
                this.onOpen(this);

                var iw = this.container.find('.gm-style-iw');
                iw.parent().addClass('gmaps-infowindow');
                iw.prev().addClass('gmaps-infowindow-bg');
                iw.next().addClass('gmaps-infowindow-close').attr('tabindex', '0').on('keyup', this.infowindowClose.bind(this));
                iw.children(':first-child').addClass('gmaps-infowindow-content');
                iw.focus();
            }
        } else if (this.metaKey || this.linkTarget == '_blank') {
            window.open(this.link);
        } else {
            window.location = this.link;
        }
    };

    Item.prototype.infowindowClose = function infowindowClose(e) {
        if (e.keyCode == 13 || e.keyCode == 32) {
            this.close();
        }
    };

    Item.prototype.close = function close() {
        if (this.opened) {
            this.opened = false;
            this.marker.setVisible(true);

            if (this.infowindow) {
                this.infowindow.close();
            }

            this.onClose(this);
        }
    };

    Item.prototype.toggle = function toggle(highlight) {
        this.marker.setOptions({
            opacity: highlight ? 1 : 0.5,
            zIndex: highlight ? 1 : 0
        });

        if (!highlight) {
            this.close();
        }
    };

    return Item;
}();