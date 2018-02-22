const $ = require('jquery'),
    GMaps = require('../../'); // Replace with '@wearejust/gmaps'

let options = {
    apiKey: 'AIzaSyCopZ8YCVh9jkKZcXqOLWBaJNuZ-SbSsRs', // Replace with your API key
};

let mapOptions = {};

new GMaps('.gmaps-container', options, mapOptions, gmaps => {
    let items = $('.gmaps-container li');
    items.on('mouseover', e => {
        gmaps.highlight($(e.currentTarget).index());
    });
    items.on('mouseout', e => {
        gmaps.highlight();
    });
    items.on('click', e => {
        $(e.currentTarget).data('GMapsMarker').open();
    });
});