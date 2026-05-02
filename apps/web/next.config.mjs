/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@leilportal/types"],
  output: "standalone"
};

export default nextConfig;
