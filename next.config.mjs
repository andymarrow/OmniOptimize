import nextra from "nextra";
const withNextra = nextra({
  contentDirBasePath: "/docs",
  defaultShowCopyCode: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        port: "",
        pathname: "/**",
      },
      // You can add other domains here later if needed
    ],
  },
};

export default withNextra(nextConfig);
