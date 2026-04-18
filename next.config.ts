import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Permissions-Policy",
            value:
              "payment=*, ch-ua-platform-version=*, ch-ua-full-version-list=*",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
