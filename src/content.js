const $ = require('jquery');

module.exports = class Content {
    constructor(gmaps, marker, content) {
        this.gmaps = gmaps;
        this.marker = marker;
        this.content = content;

        let overlay = this.marker.element.attr('data-gmaps-overlay') || this.gmaps.options.overlays;
        if (overlay) {
            this.overlay = new google.maps.OverlayView();

            this.overlay.element = $(`<div class="${overlay}">${this.content}</div>`);

            let btn = $('<button type="button" class="gmaps-overlay-close"></button>');
            this.overlay.element.prepend(btn);
            btn.on('click', this.marker.close.bind(this.marker));

            this.overlay.onAdd = this.overlayAdd.bind(this);
            this.overlay.draw = this.overlayDraw.bind(this);
            this.overlay.remove = this.overlayRemove.bind(this);

        } else {
            let options = Object.assign(this.gmaps.options.infowindows ? this.gmaps.options.infowindows[this.marker.element.attr('data-gmaps-infowindow') || 'default'] || {} : {}, {
                content: this.content,
                position: this.marker.position,
            });
            this.infowindow = new google.maps.InfoWindow(options);
            this.infowindow.addListener('closeclick', this.close.bind(this));
        }
    }

    overlayAdd() {
        let pane = $(this.overlay.getPanes().floatPane);
        pane.parent().addClass('gmaps-overlay-pane');
        pane.append(this.overlay.element);
        this.gmaps.element.trigger('overlay_add', this.overlay);
    }

    overlayDraw() {
        let projection = this.overlay.getProjection();
        let position = projection.fromLatLngToDivPixel(this.marker.position);
        this.overlay.element.css({
            left: position.x + 'px',
            top: position.y + 'px',
        });
        this.gmaps.element.trigger('overlay_draw', this.overlay);
    }

    overlayRemove() {
        this.overlay.element.detach();
        $('.gmaps-overlay-pane').removeClass('gmaps-overlay-pane');
        this.gmaps.element.trigger('overlay_remove', this.overlay);
    }

    open() {
        if (this.overlay) {
            this.overlay.setMap(this.gmaps.map);
        } else {
            this.infowindow.open(this.gmaps.map);
        }
        this.gmaps.element.trigger('content_open', this);
    }

    close() {
        if (this.overlay) {
            this.overlay.setMap(null);
        } else {
            this.infowindow.close();
        }
        this.gmaps.element.trigger('content_close', this);
    }
};