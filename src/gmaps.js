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

        if (this.element.is('ul')) {
            this.items = this.element.find('li');

            let el = '';
            $.each(this.element[0].attributes, function(index, item) {
                el += `${item.name}="${item.value}" `;
            });
            el = $(`<div ${el}></div>`);
            this.element.replaceWith(el);
            this.element = el;
        }

        this.map = new google.maps.Map(this.element[0], this.mapOptions);

        this.markers = [];
        this.bounds = new google.maps.LatLngBounds();
        this.element.add(this.items).each(function(index, item) {
            item = new Item($(item), this.map, this.mapOptions);
            if (item.position) {
                this.markers.push(item);
                this.bounds.extend(item.position);
            }
        }.bind(this));

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
}