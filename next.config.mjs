/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        'fs/promises': false,
        tls: false,  // Add this
        child_process: false,  // Add this
        readline: false,  // Add this
        module: false,  // Add this
      };
    }
    return config;
  },
};

export default nextConfig;
