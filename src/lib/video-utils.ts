
/**
 * Extracts the YouTube video ID from a given URL.
 * Supports various formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
export function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Generates the thumbnail URL for a YouTube video.
 * Uses 'hqdefault.jpg' (Standard Quality) as it is the most reliable.
 * 'maxresdefault.jpg' (High Quality) is not available for all videos.
 */
export function getYouTubeThumbnail(url: string): string | null {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;

  // We use hqdefault (480x360) as a safe default.
  // maxresdefault (1280x720) is better but returns 404 for some older/non-HD videos.
  // Given we can't easily check for 404 on the client without trying to load it,
  // we will use hqdefault or could implement a fallback mechanism in the UI component (onError).
  // For this utility, returning the standard one is safer.
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
