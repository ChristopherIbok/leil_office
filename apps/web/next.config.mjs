/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@leilportal/types"],
  async rewrites() {
    const raw = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    const apiOrigin = raw.replace(/\/api\/?$/, "").replace(/\/$/, "");

    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/api/:path*`
      }
    ];
  }
};

export default nextConfig;
