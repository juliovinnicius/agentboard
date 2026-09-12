/**
 * Client-visible configuration. Next.js inlines NEXT_PUBLIC_* at build time,
 * so the fallback keeps `npm run dev` working without a .env.local.
 */
export const env = {
  apiUrl: (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(
    /\/$/,
    '',
  ),
} as const;
