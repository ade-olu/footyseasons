import { useState } from "react";
import { Shield as ShieldIcon } from "reicon-react"; // Placeholder shown when a crest is missing or fails to load
import "./ClubCrest.scss";

// Props for the ClubCrest component: the crest URL from the API, the club name for alt text,
// and a className for sizing (the placeholder takes the same size as the image would)
type ClubCrestProps = {
  src: string | null | undefined;
  name: string;
  className?: string;
};

// Club crest image that falls back to a shield icon if there's no crest or it fails to load
export default function ClubCrest({ src, name, className = "" }: ClubCrestProps) {
  // Remembers which src failed, so a new src (e.g. after changing season) gets a fresh try
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <span
        className={`club-crest club-crest--fallback ${className}`}
        role="img"
        aria-label={`${name} crest`}
      >
        <ShieldIcon className="club-crest__icon" />
      </span>
    );
  }

  return (
    <img
      className={`club-crest ${className}`}
      src={src}
      alt={`${name} crest`}
      onError={() => setFailedSrc(src)}
    />
  );
}
