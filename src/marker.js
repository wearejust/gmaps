const $ = require('jquery');

module.exports = class Marker {
    constructor(gmaps, element) {
        if (!element.length) return;
        let lat, lng, location = element.attr('data-gmaps-location');
        if (location) location = location.split(',');
        lat = location ? location[0] : (element.attr('data-gmaps-lat') || element.attr('data-gmaps-latitude'));
        lng = location ? location[1] : (element.attr('data-gmaps-lng') || element.attr('data-gmaps-longitude'));
        if (!lat || !lng) return;

        this.element = element;
        this.gmaps = gmaps;
        this.position = new google.maps.LatLng(lat, lng);
        this.element.data('GMapsMarker', this);

        let options = {
            map: this.gmaps.map,
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

        let anchor = this.element.children('a');
        if (anchor.length) {
            this.link = anchor.attr('href');
            this.linkBlank = anchor.attr('target') == '_blank';
            if (!options.title) {
                this.marker.setTitle(anchor.text());
            }

        } else if (this.element.children().length) {
            let content = this.element.html();
            if (content && $.trim(content).length) {
                options = Object.assign(this.gmaps.options.infowindows ? (this.gmaps.options.infowindows[this.element.attr('data-gmaps-infowindow')] || this.gmaps.options.infowindows['default'] || {}) : {}, {
                    content: content,
                    position: this.position,
                });
                this.infowindow = new google.maps.InfoWindow(options);
                this.infowindow.addListener('closeclick', this.close.bind(this));
            }
        }
    }

    mouseover() {
        this.marker.setOptions({
            zIndex: 9999999,
        });
    }
    mouseout() {
        this.marker.setOptions({
            zIndex: this.index,
        });
    }

    highlight(toggle, active) {
        this.marker.setOptions({
            opacity: (toggle || !active) ? 1 : 0.5,
            zIndex: (toggle && active) ? 9999999 : this.index
        });
    }

    open() {
        if (this.link) {
            if (this.gmaps.metaKey || this.linkBlank) {
                window.open(this.link);
            } else {
                window.location = this.link;
            }

        } else if (this.infowindow) {
            this.gmaps.closeAllMarkers();
            this.marker.setVisible(false);
            this.infowindow.open(this.gmaps.map);
        }
    }

    close() {
        if (this.infowindow) {
            this.marker.setVisible(true);
            this.infowindow.close();
        }
    }
}