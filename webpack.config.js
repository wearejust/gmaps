const config = {
    devtool: false,
    mode: 'production',
    entry: './src/gmaps.js',
    output: {
        path: __dirname + '/dist',
        library: 'GMaps',
        libraryTarget: 'umd',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            'es2015-ie',
                        ],
                    },
                },
            },
        ],
    },
};

module.exports = [
    {
        ...config,
        externals: [
            'gmaps-marker-clusterer',
            'jquery',
        ],
        output: {
            ...config.output,
            filename: 'gmaps.js',
        }
    },
    {
        ...config,
        output: {
            ...config.output,
            filename: 'gmaps.bundle.js',
        }
    }
];