/** @type {import('next').NextConfig} */

// Resolve the backend API origin from env so we can include it in the
// Content-Security-Policy connect-src list. Falls back to the local dev
// HTTPS endpoint used during development.
const apiUrl =
  process.env.NEXT_PUBLIC_API_URL || "https://localhost:8443/api";
let apiOrigin = "https://localhost:8443";
try {
  apiOrigin = new URL(apiUrl).origin;
} catch {
  // keep default
}

// Build a strict-but-Stripe-friendly CSP. Stripe requires:
//   - script-src: https://js.stripe.com
//   - frame-src:  https://js.stripe.com https://hooks.stripe.com
//   - connect-src: https://api.stripe.com, https://m.stripe.network, https://q.stripe.com
// We also allow the backend API origin for connect-src.
const csp = [
  "default-src 'self'",
  // Next.js inline runtime + Stripe.js. unsafe-inline/unsafe-eval are
  // required by Next dev mode and Stripe.js itself.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${apiOrigin} https://api.stripe.com https://m.stripe.network https://q.stripe.com`,
  "frame-src https://js.stripe.com https://hooks.stripe.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(self)",
  },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
