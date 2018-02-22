const GMaps = require('../../'); // Replace with '@wearejust/gmaps'

let options = {
    apiKey: 'AIzaSyCopZ8YCVh9jkKZcXqOLWBaJNuZ-SbSsRs', // Replace with your API key
    markers: {
        just: {
            icon: {
                url: 'assets/just.png',
                size: { width: 48, height: 48, },
                scaledSize: { width: 24, height: 24, },
                origin: { x: 0, y: 0, },
                anchor: { x: 12, y: 12, },
            },
        },
    },
};

let mapOptions = {};

new GMaps('.gmaps-list', options, mapOptions);