class GMapsMarker {
    constructor(element, map) {
        if (!element.length) return;
        let lat, lng, location = element.attr('data-gmaps-location');
        if (location) location = location.split(',');
        lat = location ? location[0] : (element.attr('data-gmaps-lat') || element.attr('data-gmaps-latitude'));
        lng = location ? location[1] : (element.attr('data-gmaps-lng') || element.attr('data-gmaps-longitude'));
        if (!lat || !lng) return;

        this.element = element;
        this.map = map;
        this.position = new google.maps.LatLng(lat, lng);

        let markerOptions = {
            draggable: true,
            map: this.map,
            position: this.position,
            label: this.element.attr('data-gmaps-label'),
            title: this.element.attr('data-gmaps-title') || this.element.attr('title') || this.element.find('.gmaps-title').text(),
        };

        this.marker = new google.maps.Marker(markerOptions);
        this.marker.addListener('dragend', (e) => {
            console.log(this.marker.getPosition().lat(), this.marker.getPosition().lng());
        });
    }
}