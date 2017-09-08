const $body = $(document.body);
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
        let lat, lng;
        this.element.add(this.items).each(function(index, item) {
            item = $(item);
            lat = item.attr('data-gmaps-lat') || item.attr('data-gmaps-latitude');
            lng = item.attr('data-gmaps-lng') || item.attr('data-gmaps-longitude');
            if (lat && lng) {
                item = new google.maps.Marker({
                    position: new google.maps.LatLng(lat, lng),
                    map: this.map,
                    icon: this.mapOptions.markerIcon,
                    title: item.attr('data-gmaps-title') || item.attr('title') || item.find('.gmaps-title').text()
                });
                this.markers.push(item);
                this.bounds.extend(item.position);
            }
        }.bind(this));

        this.cover = $('<div class="gmaps-cover" style="position:absolute;left:0;right:0;top:0;bottom:0;z-index:99999;"></div>');
        this.element.prepend(this.cover);
        this.coverHide = this.coverHide.bind(this);
        this.coverHidden = this.coverHidden.bind(this);
        this.coverShow = this.coverShow.bind(this);
        this.cover.on('click', this.coverHide);

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

    coverHide() {
        this.cover.css('display', 'none');
        setTimeout(this.coverHidden, 500);
    }

    coverHidden() {
        $body.on('click', this.coverShow);
        $window.on('scroll', this.coverShow);
    }

    coverShow(e) {
        if (e && (e.type != 'click' || !$(e.target).closest(this.element).length)) {
            $body.off('click', this.coverShow);
            $window.off('scroll', this.coverShow);
            this.cover.css('display', '');
        }
    }
}