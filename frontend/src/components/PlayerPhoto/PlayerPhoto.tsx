import { useState } from "react";
import "./PlayerPhoto.scss";

// Props for the PlayerPhoto component: the photo URL (optional until photos exist),
// the player's name for initials and alt text, and a className for sizing
type PlayerPhotoProps = {
  src?: string | null;
  name: string;
  className?: string;
};

// "Erling Haaland" -> "EH", "Rodri" -> "R" (first and last word)
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? words[words.length - 1][0] : "";

  return (first + last).toUpperCase();
}

// Round player photo that falls back to the player's initials if there's no photo or it fails to load
export default function PlayerPhoto({
  src,
  name,
  className = "",
}: PlayerPhotoProps) {
  // Remembers which src failed, so a new src gets a fresh try
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <span
        className={`player-photo player-photo--initials ${className}`}
        role="img"
        aria-label={name}
      >
        {getInitials(name)}
      </span>
    );
  }

  return (
    <img
      className={`player-photo ${className}`}
      src={src}
      alt={name}
      onError={() => setFailedSrc(src)}
    />
  );
}
