module.exports = {
    entry: "./src/index.js",
    output: {
        path: __dirname + "/dist",
        filename: "pong.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" },
            { test: /\.jsx$/, loader: "jsx" }
        ]
    }
};
