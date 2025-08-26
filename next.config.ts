import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * Turbopack is now stable (Next 15.5). Put options directly under
   * `turbopack`, not `experimental`.
   * We also keep Playwright out of the bundle.
   */
    reactStrictMode: false,
  turbopack: {
    // future Turbopack rules can go here
  },

  webpack(cfg) {
    // ensure playwright-core stays external so its huge binary
    // isn’t bundled into the serverless function
    cfg.externals ??= [];
    cfg.externals.push('playwright-core');
    return cfg;
  },
  
  eslint: { ignoreDuringBuilds: true }

};

export default nextConfig;
