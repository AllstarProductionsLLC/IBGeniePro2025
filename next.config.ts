import type { NextConfig } from "next";
const frameOrigins = (
  process.env.WIX_ALLOWED_ORIGINS ||
  "https://www.ibgenie.com,https://ibgenie.com"
)
  .split(",")
  .map((value) => {
    const origin = value.trim(),
      url = new URL(origin);
    if (url.protocol !== "https:" || url.origin !== origin)
      throw new Error("WIX_ALLOWED_ORIGINS requires exact HTTPS origins.");
    return origin;
  });
const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: true },
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' " +
              frameOrigins.join(" ") +
              "; object-src 'none'; base-uri 'self'; form-action 'self'",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), geolocation=(), microphone=(self)",
          },
        ],
      },
    ];
  },
};
export default nextConfig;
