import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the workspace root: a root-level package-lock.json (added for the
    // repo-wide husky/lint-staged setup) would otherwise make Turbopack infer
    // the wrong workspace root.
    root: path.join(__dirname),
  },
};

export default nextConfig;
