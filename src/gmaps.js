const $ = require('jquery');
const $window = $(window);
let options, mapOptions, queue = [];

module.exports.init = function(opts, mapOpts) {
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
            $.getScript(`https://maps.googleapis.com/maps/api/js?v=3&callback=gmaps_load_callback&key=${options.apiKey}`);
        } else {
            parse();
        }

    } else if (window.google) {
        parse();
    }
};

$.fn.gmaps = function(options, mapOptions) {
    let items = $(this).each(function(index, item) {
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

class GMaps {
    constructor(element, options, mapOptions) {
        this.element = element;
        this.element.data('GMaps', this);
        this.options = options;
        this.mapOptions = mapOptions;
    }

    init() {
        this.options = $.extend(options, this.options || {});
        this.mapOptions = $.extend(mapOptions, this.mapOptions || {});
        let container = this.element.attr('data-gmaps-container');

        if (this.element.is('ul')) {
            this.items = this.element.find('li');

            if (!container) {
                let el = '';
                $.each(this.element[0].attributes, function(index, item) {
                    el += `${item.name}="${item.value}" `;
                });
                el = $(`<div ${el}></div>`);
                this.element.replaceWith(el);
                this.element = el;
            }
        }

        container = $(`[data-gmaps-id="${container}"]`);
        container = container.length ? container[0] : this.element[0];
        this.map = new google.maps.Map(container, this.mapOptions);

        let key, positions = {};
        this.markers = [];
        this.bounds = new google.maps.LatLngBounds();
        this.element.add(this.items).each(function(index, item) {
            item = new Item(index, $(item), container, this.map, this.options, this.mapOptions);
            if (item.position) {
                item.onOpen = this.markerOpen.bind(this);
                item.onClose = this.markerClose.bind(this);
                this.markers.push(item);
                this.bounds.extend(item.position);

                key = `lat${item.position.lat()}lng${item.position.lng()}`;
                if (!positions[key]) positions[key] = [];
                positions[key].push(item);

            }
        }.bind(this));

        let i, p, position;
        for (p in positions) {
            position = positions[p];
            if (position.length > 1) {
                for (i=0; i<position.length; i++) {
                    position[i].offset(i / position.length);
                }
            }
        }

        this.markers = this.markers.sort(function(a, b) {
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

        this.tabIndex = -1;
        this.tab = this.tab.bind(this);
        this.element.attr('tabindex', '0');
        this.element.on('focus', this.focus.bind(this));
        this.element.on('blur', this.blur.bind(this));
        $window.on('keydown keyup', this.keys.bind(this));

        google.maps.event.addListener(this.map, 'zoom_changed', this.zoom.bind(this));
        $window.on('resize', this.resize.bind(this));
        this.resize();
    }

    resize() {
        this.resizeZoom = true;
        this.map.fitBounds(this.bounds);
    }

    zoom() {
        if (this.resizeZoom) {
            this.resizeZoom = false;
            let z = this.map.getZoom();
            let n = z + this.options.fitZoom;
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
    }

    keys(e) {
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
    }

    focus(e) {
        $window.on('keydown', this.tab);
        if (this.tabIndex == -1) this.tabIndex = (e.shiftKey || this.shiftKey) ? this.markers.length - 1 : 0;
        this.tab();
    }

    blur() {
        if (!this.markerOpened) {
            $window.off('keydown', this.tab);
            this.tabIndex = -1;
            let i;
            for (i=0; i<this.markers.length; i++) {
                this.markers[i].toggle(true);
            }
        }
    }
    
    tab(e) {
        if (!this.markerOpened && (!e || e.keyCode == 9)) {
            if (e) {
                e.preventDefault();
                this.tabIndex += e.shiftKey ? -1 : 1;
            }

            if (this.tabIndex >= 0 && this.tabIndex < this.markers.length) {
                let i;
                for (i=0; i<this.markers.length; i++) {
                    this.markers[i].toggle(i == this.tabIndex);
                }

            } else {
                this.blur();
            }
        }
    }

    markerOpen(marker) {
        if (this.markerOpened) {
            this.markerOpened.close();
        }
        this.markerOpened = marker;
    }

    markerClose() {
        this.markerOpened = null;
        if (this.tabIndex != -1) {
            this.element.focus();
        }
    }
}