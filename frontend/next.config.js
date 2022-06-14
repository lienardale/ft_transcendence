module.exports = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/:any*',
        destination: '/',
      },
    ];
  },
  webpack5: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, mv: false };

    return config;
  },
};
