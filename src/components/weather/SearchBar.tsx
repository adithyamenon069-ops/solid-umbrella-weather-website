import { useEffect, useId, useState, type FormEvent, type KeyboardEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, LocateFixed, MapPin, Search, X } from "lucide-react";

import { placeSubtitle, searchCities, type Place } from "@/lib/weather";
import { cn } from "@/lib/utils";

type Props = {
  onSelect: (place: Place) => void;
  onUseLocation: () => void;
  locating: boolean;
};

const citiesQuery = (q: string) => ({
  queryKey: ["cities", q.toLowerCase()],
  queryFn: () => searchCities(q),
  staleTime: 60 * 60 * 1000,
});

export function SearchBar({ onSelect, onUseLocation, locating }: Props) {
  const queryClient = useQueryClient();
  const listId = useId();
  const [text, setText] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  // Wait until the user stops typing for a moment before searching.
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(text.trim()), 300);
    return () => clearTimeout(timer);
  }, [text]);

  const search = useQuery({ ...citiesQuery(debounced), enabled: debounced.length >= 2 });
  const results = search.data ?? [];

  useEffect(() => setActive(0), [debounced]);

  function choose(place: Place) {
    onSelect(place);
    setText("");
    setOpen(false);
    setMessage(null);
  }

  // Pressing Enter or the search button.
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = text.trim();
    if (q.length < 2) {
      setOpen(false);
      setMessage("Type at least 2 letters of a city name.");
      return;
    }
    if (q === debounced && results.length > 0) {
      const picked = results[active] ?? results[0];
      if (picked) {
        choose(picked);
        return;
      }
    }
    try {
      const found = await queryClient.fetchQuery(citiesQuery(q));
      const first = found[0];
      if (first) choose(first);
      else {
        setOpen(false);
        setMessage(`We couldn't find "${q}". Check the spelling or try a nearby city.`);
      }
    } catch (err) {
      setOpen(false);
      setMessage((err as Error).message);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showDropdown = open && debounced.length >= 2;
  const isSearching = search.isFetching || (text.trim() !== debounced && text.trim().length >= 2);

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="glass-card group relative flex flex-1 items-center rounded-2xl transition-shadow focus-within:ring-2 focus-within:ring-ring">
          <Search className="pointer-events-none absolute left-4 size-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <input
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setOpen(true);
              setMessage(null);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={handleKeyDown}
            placeholder="Search for a city…"
            aria-label="Search for a city"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls={listId}
            autoComplete="off"
            className="h-14 w-full bg-transparent pl-12 pr-10 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {text && (
            <button
              type="button"
              onClick={() => {
                setText("");
                setMessage(null);
              }}
              aria-label="Clear search"
              className="absolute right-3 rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="bg-accent-gradient hidden h-14 items-center gap-2 rounded-2xl px-6 font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-[1.03] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
        >
          Search
        </button>
        <button
          type="button"
          onClick={onUseLocation}
          disabled={locating}
          aria-label="Use my current location"
          title="Use my current location"
          className="glass-card inline-flex size-14 shrink-0 items-center justify-center rounded-2xl text-primary transition-all hover:bg-accent disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {locating ? <Loader2 className="size-5 animate-spin" /> : <LocateFixed className="size-5" />}
        </button>
      </form>

      {message && (
        <p role="alert" className="mt-3 animate-fade-up text-sm text-destructive">
          {message}
        </p>
      )}

      {showDropdown && (
        <div
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-30 animate-in fade-in-0 slide-in-from-top-1 overflow-hidden rounded-2xl border bg-popover shadow-2xl"
        >
          {isSearching && results.length === 0 ? (
            <div className="flex items-center gap-3 px-5 py-4 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" /> Searching cities…
            </div>
          ) : search.isError ? (
            <div className="px-5 py-4 text-sm text-destructive">{(search.error as Error).message}</div>
          ) : results.length === 0 ? (
            <div className="px-5 py-4 text-sm text-muted-foreground">
              No cities match "{debounced}". Try another spelling.
            </div>
          ) : (
            <ul className="py-1.5">
              {results.map((place, i) => (
                <li key={place.id} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    // onMouseDown stops the input losing focus before the click registers
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(place)}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      "flex w-full items-center gap-3 px-5 py-3 text-left transition-colors",
                      i === active ? "bg-accent" : "hover:bg-accent",
                    )}
                  >
                    <MapPin className="size-4 shrink-0 text-primary" />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-foreground">{place.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {placeSubtitle(place)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
