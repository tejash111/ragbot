import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Disable the dev indicator to avoid localStorage issues in VS Code terminal
  devIndicators: false,
  // Enable instrumentation to polyfill localStorage
  experimental: {
    instrumentationHook: true,
  },
};

export default nextConfig;
