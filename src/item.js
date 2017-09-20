class Item {
    constructor(element, container, map, mapOptions) {
        this.element = element;
        this.container = container;
        this.map = map;
        this.mapOptions = mapOptions;

        let lat = this.element.attr('data-gmaps-lat') || this.element.attr('data-gmaps-latitude');
        let lng = this.element.attr('data-gmaps-lng') || this.element.attr('data-gmaps-longitude');
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
            let content = this.element.html();
            if (content && $.trim(content).length) {
                this.infowindow = new google.maps.InfoWindow({
                    content: content
                });

                this.marker.addListener('click', this.open.bind(this));
            }
        }
    }

    keys(e) {
        this.metaKey = e.type == 'keydown' && (e.ctrlKey || e.metaKey);
    }
    
    open() {
        if (this.infowindow) {
            if (!this.opened) {
                this.opened = true;
                this.infowindow.open(this.map, this.marker);
                this.onOpen(this);
                setTimeout(this.infowindowOpened.bind(this), 100);
            }

        } else if (this.metaKey || this.linkTarget == '_blank') {
            window.open(this.link);
        } else {
            window.location = this.link;
        }
    }

    infowindowOpened() {
        let content = this.container.find('.gm-style-iw');
        content.focus();
        content.next().attr('tabindex', '0').on('keyup', this.infowindowClose.bind(this));
    }

    infowindowClose(e) {
        if (e.keyCode == 13 || e.keyCode == 32) {
            this.close();
        }
    }

    close() {
        if (this.opened) {
            this.opened = false;
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


