import type { NextConfig } from "next";

// Utiliser require pour éviter les problèmes de types TypeScript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Désactiver en dev pour éviter les problèmes de cache
});

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {},
};

export default withPWA(nextConfig);
