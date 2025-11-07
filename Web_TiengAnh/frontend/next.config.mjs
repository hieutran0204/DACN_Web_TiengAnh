// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   typescript: {
//     ignoreBuildErrors: true,
//   },
//   images: {
//     unoptimized: true,
//   },
// }

// export default nextConfig
/** @type {import('next').NextConfig} */
const nextConfig = {
  // TẮT TURBOPACK - đây là dòng QUAN TRỌNG NHẤT
  experimental: {
    turbopack: false,
  },

  // Giữ lại 2 dòng bạn đã có
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // Bonus: fix 1 số lỗi lạ khác
  swcMinify: true,
  reactStrictMode: false,
};

export default nextConfig;
