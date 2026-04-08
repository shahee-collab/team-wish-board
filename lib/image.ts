/**
 * Returns the display URL for an image. Private Vercel Blob URLs are proxied
 * through /api/image so they can be displayed without public access.
 */
export function getImageSrc(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("/")) return url;
  if (url.includes("blob.vercel-storage.com")) {
    return `/api/image?url=${encodeURIComponent(url)}`;
  }
  return url;
}
