const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@layouts': path.resolve(__dirname, 'src/layouts'),
      '@auth': path.resolve(__dirname, 'src/auth'),
      '@examples': path.resolve(__dirname, 'src/examples'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@context': path.resolve(__dirname, 'src/context'),
      '@redux': path.resolve(__dirname, 'src/redux')
    }
  },
  devServer: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        secure: false
      },
      '/socket.io': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        ws: true
      }
    }
  }
};