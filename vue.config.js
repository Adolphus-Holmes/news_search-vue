module.exports = {
    devServer: {
        open: true,
        port: 8080,
        proxy: {
            "/api": {
                target: "http://localhost:8089/api",
                changeOrigin: true,
                ws: true,
                pathRewrite: {
                    '^/api': '/'
                }
            },
            "/vec": {
                target: "http://localhost:5000",
                changeOrigin: true,
                ws: true,
                pathRewrite: {
                    '^/vec': '/'
                }
            }
        }
    }
}