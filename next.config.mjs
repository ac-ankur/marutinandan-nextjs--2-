/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "www.yugikafoods.com" },
      { protocol: "https", hostname: "yugikafoods.com" },
      { protocol: "https", hostname: "example.com" },
      { protocol: "http", hostname: "example.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
