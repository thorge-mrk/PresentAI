const nextConfig = {
  reactStrictMode: false,
  distDir: ".next-build",
  output: "standalone",

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "www.pexels.com" },
      { protocol: "https", hostname: "img.icons8.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "lmmnwgtcdjyiktobsere.supabase.co" },
    ],
  },
};

export default nextConfig;
