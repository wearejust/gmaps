var Path               = require('path');
var Config             = require('webpack-config').default;

module.exports = [
    new Config().merge({
        cache: true,
        devtool: 'source-map',
        entry: {
            app: [
                './javascript/app.js'
            ],
        },
        output: {
            path: Path.join(__dirname, './javascript/build'),
            publicPath: '/javascript/build/',
            filename: '[name].js'
        },
        resolve: {
            modules: [
                Path.resolve('./node_modules')
            ]
        },
        module: {
            rules: [
                {
                    test: /.js$/,
                    loader: 'babel-loader?presets[]=es2015-ie',
                    exclude: /node_modules|@wearejust/
                },
            ]
        },
    }),
];
