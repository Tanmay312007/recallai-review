/**
 * Next.js 14 config (PROMPT §3, §8.5 PWA Configuration).
 *
 * Note: PROMPT §4 lists `next.config.ts`, but Next.js 14.2 only loads
 * `.js`/`.mjs` config files. Using `.mjs` to keep ESM + TS-friendly authoring.
 *
 * Phase 1: skeleton with transpilePackages for workspace deps.
 * PWA (next-pwa) is added in Phase 10.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile the monorepo shared package so Next.js can consume its ESM output.
  transpilePackages: ['@recallai/shared'],

  reactStrictMode: true,

  // PWA integration is added in Phase 10 via next-pwa wrapper.
  // images: { unoptimized: true }, // TODO(spec): add when image domains are known.
};

export default nextConfig;
