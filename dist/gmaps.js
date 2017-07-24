/** 
* @wearejust/gmaps 
* Google Maps wrapper 
* 
* @version 1.0.0 
* @author Emre Koc <emre.koc@wearejust.com> 
*/
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var $body = $(document.body);
var $window = $(window);

module.exports = function (element, options) {
    if (!element.data('GMaps')) {
        element.data('GMaps', new GMaps(element, options));
    }
};

$.fn.gmaps = function (options) {
    return $(this).each(function (index, item) {
        module.exports($(item), options);
    });
};

var GMaps = function () {
    function GMaps(element, options) {
        _classCallCheck(this, GMaps);

        this.element = element;
        this.options = $.extend({
            mapTypeControl: false,
            streetViewControl: false,
            zoom: 17
        }, options || {});

        if (this.options.center) {
            this.location = this.options.center;
        } else {
            var lat = this.element.attr('data-lat') || this.element.attr('data-latitude');
            var lng = this.element.attr('data-lng') || this.element.attr('data-longitude');
            this.location = new google.maps.LatLng(lat, lng);
        }

        this.map = new google.maps.Map(this.element[0], this.options);

        this.marker = new google.maps.Marker({
            position: this.location,
            map: this.map,
            icon: this.options.markerIcon
        });

        this.cover = $('<div class="gmaps-cover" style="position:absolute;left:0;right:0;top:0;bottom:0;z-index:99999;"></div>');
        this.element.prepend(this.cover);
        this.coverHide = this.coverHide.bind(this);
        this.coverHidden = this.coverHidden.bind(this);
        this.coverShow = this.coverShow.bind(this);
        this.cover.on('click', this.coverHide);

        $window.on('resize', this.resize.bind(this));
        this.resize();
    }

    GMaps.prototype.resize = function resize() {
        this.map.setCenter(this.location);
    };

    GMaps.prototype.coverHide = function coverHide() {
        this.cover.css('display', 'none');
        setTimeout(this.coverHidden, 500);
    };

    GMaps.prototype.coverHidden = function coverHidden() {
        $body.on('click', this.coverShow);
        $window.on('scroll', this.coverShow);
    };

    GMaps.prototype.coverShow = function coverShow(e) {
        if (e && (e.type != 'click' || !$(e.target).closest(this.element).length)) {
            $body.off('click', this.coverShow);
            $window.off('scroll', this.coverShow);
            this.cover.css('display', '');
        }
    };

    return GMaps;
}();