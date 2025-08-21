/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  trailingSlash: true,
  basePath: '/5MinCases',
  assetPrefix: '/5MinCases',
  images: {
    unoptimized: true
  },
  // Allow loading data from our GitHub repo
  async headers() {
    return [
      {
        source: '/data/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
