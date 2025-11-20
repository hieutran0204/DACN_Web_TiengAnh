// // /** @type {import('next').NextConfig} */
// // const nextConfig = {
// //   typescript: {
// //     ignoreBuildErrors: true,
// //   },
// //   images: {
// //     unoptimized: true,
// //   },
// // }

// // export default nextConfig
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   // TẮT TURBOPACK - đây là dòng QUAN TRỌNG NHẤT
//   experimental: {
//     turbopack: false,
//   },

//   // Giữ lại 2 dòng bạn đã có
//   typescript: {
//     ignoreBuildErrors: true,
//   },
//   images: {
//     unoptimized: true,
//   },

//   // Bonus: fix 1 số lỗi lạ khác
//   swcMinify: true,
//   reactStrictMode: false,
// };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // QUAN TRỌNG NHẤT: CHO PHÉP UPLOAD FILE LỚN (audio IELTS thường 20-50MB)
  api: {
    bodyParser: {
      sizeLimit: "100mb", // mày có thể để 50mb hoặc 100mb tùy thích
    },
    responseLimit: "100mb",
    // Tăng timeout nếu upload chậm
    // externalResolver: true,
  },

  // Fix lỗi Server Actions bị giới hạn 1MB (nếu mày dùng revalidatePath, redirect...)
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
    // Tắt Turbopack nếu đang lỗi lạ
    turbopack: false,
  },

  // Giữ lại các config mày đang dùng
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // Bonus: tối ưu + fix lỗi linh tinh
  swcMinify: true,
  reactStrictMode: false,
  // Cho phép fetch không bị cache (khi upload)
  // fetchCache: "force-no-store",
};

export default nextConfig;
