const $ = require('jquery'),
    Content = require('./content');

module.exports = class Marker {
    constructor(gmaps, element) {
        if (!element.length) return;
        let lat, lng, location = element.attr('data-gmaps-location');
        if (location) location = location.split(',');
        lat = location ? location[0] : (element.attr('data-gmaps-lat') || element.attr('data-gmaps-latitude'));
        lng = location ? location[1] : (element.attr('data-gmaps-lng') || element.attr('data-gmaps-longitude'));
        if (isNaN(lat) || isNaN(lng)) return;

        this.gmaps = gmaps;
        this.element = element;
        this.position = new google.maps.LatLng(lat, lng);
        this.element.data('GMapsMarker', this);

        let options = {
            map: this.gmaps.options.cluster ? null : this.gmaps.map,
            position: this.position,
            label: this.element.attr('data-gmaps-label'),
            title: this.element.attr('data-gmaps-title') || this.element.attr('title') || this.element.find('.gmaps-title').text(),
        };

        let marker = this.gmaps.options.markers ? (this.gmaps.options.markers[this.element.attr('data-gmaps-marker')] || this.gmaps.options.markers['default']) : null;
        if (marker) {
            if (marker.label && options.label) {
                marker.label.text = options.label;
            }
            options = Object.assign(options, marker);
        }

        this.marker = new google.maps.Marker(options);
        this.marker.addListener('mouseover', this.mouseover.bind(this));
        this.marker.addListener('mouseout', this.mouseout.bind(this));
        this.marker.addListener('click', this.open.bind(this));

        if (this.element.children().length) {
            let content = this.element.html();
            if (content && $.trim(content).length) {
                this.content = new Content(this.gmaps, this, content);

            } else {
                let anchor = this.element.children('a');
                if (anchor.length) {
                    this.link = anchor.attr('href');
                    this.linkBlank = anchor.attr('target') == '_blank';
                    if (!options.title) {
                        this.marker.setTitle(anchor.text());
                    }
                }
            }
        }
    }

    offset(alpha, spread) {
        alpha = alpha * Math.PI * 2;
        let icon = this.marker.getIcon();
        if (!icon.anchor) icon.anchor = { x:0, y:0 };
        icon.anchor.x += Math.sin(alpha) * spread;
        icon.anchor.y += Math.cos(alpha) * spread;
    }

    mouseover() {
        this.marker.setOptions({
            zIndex: 9999999,
        });
        this.gmaps.element.trigger('marker_mouseover', this);
    }
    mouseout() {
        this.marker.setOptions({
            zIndex: this.index,
        });
        this.gmaps.element.trigger('marker_mouseout', this);
    }

    highlight(toggle, active) {
        this.marker.setOptions({
            opacity: (toggle || !active) ? 1 : 0.5,
            zIndex: (toggle && active) ? 9999999 : this.index
        });
        this.gmaps.element.trigger('marker_highlight', this);
    }

    open() {
        if (this.link) {
            if (this.gmaps.metaKey || this.linkBlank) {
                window.open(this.link);
            } else {
                window.location = this.link;
            }

        } else if (this.content && this.marker.visible) {
            this.gmaps.closeAllMarkers();
            this.marker.setVisible(false);
            this.content.open();
            this.gmaps.element.trigger('marker_open', this);
        }
    }

    close() {
        if (this.content && !this.marker.visible) {
            this.marker.setVisible(true);
            this.content.close();
            this.gmaps.element.trigger('marker_close', this);
        }
    }
};