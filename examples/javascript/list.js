const GMaps = require('../../'); // Replace with '@wearejust/gmaps'

let options = {
    apiKey: 'AIzaSyCopZ8YCVh9jkKZcXqOLWBaJNuZ-SbSsRs', // Replace with your API key
};

let mapOptions = {};

new GMaps('.gmaps-list', options, mapOptions);