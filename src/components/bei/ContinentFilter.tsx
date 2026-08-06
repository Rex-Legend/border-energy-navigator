import { CONTINENTS } from "@/lib/countries";
import { cn } from "@/lib/utils";

export function ContinentFilter({
  active,
  onChange,
}: {
  active: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (continent: string) =>
    onChange(
      active.includes(continent)
        ? active.filter((c) => c !== continent)
        : [...active, continent],
    );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        Continent
      </span>
      <button
        type="button"
        onClick={() => onChange([...CONTINENTS])}
        className={cn(
          "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
          active.length === CONTINENTS.length
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-card text-muted-foreground hover:text-foreground",
        )}
      >
        All
      </button>
      {CONTINENTS.map((continent) => (
        <button
          key={continent}
          type="button"
          onClick={() => toggle(continent)}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
            active.includes(continent)
              ? "border-primary/60 bg-primary/10 text-primary"
              : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          {continent}
        </button>
      ))}
    </div>
  );
}
