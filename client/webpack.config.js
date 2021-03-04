module.exports = {
    mode: "development",
    entry: "./src/index.js",
    devServer: {
        contentBase: './dist',
    },
    output: {
        filename: "main.js"
    }
}
