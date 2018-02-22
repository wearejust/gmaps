module.exports = {
    entry: './src/gmaps.js',
    output: {
        path: __dirname + '/dist',
        filename: 'gmaps.js'
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        modules: ['node_modules']
    },
};
