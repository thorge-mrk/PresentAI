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
      { protocol: "https", hostname: "api.iconify.design" },
      { protocol: "https", hostname: "presenton-public.s3.ap-southeast-1.amazonaws.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "ocabezkxbsktenhagcbd.supabase.co" },
    ],
  },
};

export default nextConfig;
