/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  trailingSlash: true,
  // Only use basePath for GitHub Pages in production
  ...(process.env.NODE_ENV === 'production' && process.env.GITHUB_ACTIONS ? {
    basePath: '/5MinCases',
    assetPrefix: '/5MinCases',
  } : {}),
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
