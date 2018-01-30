class Item {
    constructor(index, element, container, map, options, mapOptions) {
        this.index = index;
        this.element = element;
        this.container = container;
        this.map = map;
        this.options = options;
        this.mapOptions = mapOptions;

        let lat = this.element.attr('data-gmaps-lat') || this.element.attr('data-gmaps-latitude');
        let lng = this.element.attr('data-gmaps-lng') || this.element.attr('data-gmaps-longitude');
        if (!lat || !lng) return;
        this.position = new google.maps.LatLng(lat, lng);

        let markerOptions = {
            map: this.map,
            zIndex: this.index,
            position: this.position,
            label: this.element.attr('data-gmaps-label'),
            title: this.element.attr('data-gmaps-title') || this.element.attr('title') || this.element.find('.gmaps-title').text()
        };

        let marker = this.options.markers ? this.options.markers[this.element.attr('data-gmaps-marker')] : null;
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
            let content = this.element.html();
            if (content && $.trim(content).length) {
                this.infowindow = new google.maps.InfoWindow({
                    content: content
                });

                google.maps.event.addListener(this.infowindow, 'closeclick', this.close.bind(this));

                this.marker.addListener('click', this.open.bind(this));

                this.marker.addListener('mouseover', function() {
                    this.marker.setOptions({ zIndex:9999999 });
                }.bind(this));
                this.marker.addListener('mouseout', function() {
                    this.marker.setOptions({ zIndex:this.index });
                }.bind(this));

            }
        }
    }
    
    offset(n) {
        let lat = this.position.lat() + Math.sin(n * Math.PI * 2) * 0.00006;
        let lng = this.position.lng() + Math.cos(n * Math.PI * 2) * 0.0001;
        this.position = new google.maps.LatLng(lat, lng);
        this.marker.setPosition(this.position);
    }

    keys(e) {
        this.metaKey = e.type == 'keydown' && (e.ctrlKey || e.metaKey);
    }
    
    open() {
        if (this.infowindow) {
            if (!this.opened) {
                this.opened = true;
                this.marker.setVisible(false);

                this.infowindow.open(this.map, this.marker);
                this.onOpen(this);

                let iw = this.container.find('.gm-style-iw');
                iw.parent().addClass('gmaps-infowindow');
                iw.prev().addClass('gmaps-infowindow-bg');
                iw.next().addClass('gmaps-infowindow-close').attr('tabindex', '0').on('click keyup', this.infowindowClose.bind(this));
                iw.children(':first-child').addClass('gmaps-infowindow-content');
                iw.focus();
            }

        } else if (this.metaKey || this.linkTarget == '_blank') {
            window.open(this.link);
        } else {
            window.location = this.link;
        }
    }

    infowindowClose(e) {
        if (!e || e.type == 'click' || e.keyCode == 13 || e.keyCode == 32) {
            this.close();
        }
    }

    close() {
        if (this.opened) {
            this.opened = false;
            this.marker.setVisible(true);

            if (this.infowindow) {
                this.infowindow.close();
            }

            this.onClose(this);
        }
    }

    toggle(highlight) {
        this.marker.setOptions({
            opacity: highlight ? 1 : 0.5,
            zIndex: highlight ? 1 : 0
        });

        if (!highlight) {
            this.close();
        }
    }
}


