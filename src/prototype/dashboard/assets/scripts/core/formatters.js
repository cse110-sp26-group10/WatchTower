export function relativeTime(iso) {
  const diffSec = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const min = Math.round(diffSec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  return `${hr}h ago`;
}

export function starsForRating(rating) {
  const filled = Math.max(0, Math.min(5, Number(rating || 0)));
  return '*****'.slice(0, filled) + '-----'.slice(0, 5 - filled);
}
