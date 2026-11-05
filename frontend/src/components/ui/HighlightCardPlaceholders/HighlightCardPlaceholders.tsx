import HighlightCard from "@/components/ui/HighlightCard/HighlightCard";

// Props for the HighlightCardPlaceholders component: each card's title, and whether loading failed
type HighlightCardPlaceholdersProps = {
  titles: string[];
  isError: boolean;
};

// Keeps the cards in place with a dash while loading or on error, so the grid doesn't jump
export default function HighlightCardPlaceholders({
  titles,
  isError,
}: HighlightCardPlaceholdersProps) {
  return (
    <>
      {titles.map((title) => (
        <HighlightCard
          key={title}
          title={title}
          value="–"
          description={isError ? "Couldn't load" : "Loading…"}
        />
      ))}
    </>
  );
}
