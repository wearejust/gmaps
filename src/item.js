class Item {
    constructor(element, map, mapOptions) {
        this.element = element;
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

                this.marker.addListener('click', this.show.bind(this));
            }
        }
    }

    keys(e) {
        this.metaKey = e.type == 'keydown' && (e.ctrlKey || e.metaKey);
    }
    
    open() {
        if (this.metaKey || this.linkTarget == '_blank') {
            window.open(this.link);
        } else {
            window.location = this.link;
        }
    }

    show() {
        this.infowindow.open(this.map, this.marker);
    }
}


