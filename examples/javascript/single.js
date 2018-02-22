const GMaps = require('../../'); // Replace with '@wearejust/gmaps'

let options = {
    apiKey: 'AIzaSyCopZ8YCVh9jkKZcXqOLWBaJNuZ-SbSsRs', // Replace with your API key
    fit: false,
};

let mapOptions = {};

new GMaps('.gmaps-single', options, mapOptions);