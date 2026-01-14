import { useState, useEffect, useRef, useCallback } from "react";
import { searchWorlds, type WorldSearchResult } from "@/lib/travellerMapApi";
import { Loader2, MapPin, Globe, Grid3X3 } from "lucide-react";

interface WorldSearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (result: WorldSearchResult) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export function WorldSearchAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Search for a world...",
  className = "",
  label,
}: WorldSearchAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<WorldSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  const performSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await searchWorlds(query, 15);
      setResults(searchResults);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length >= 2) {
      setIsLoading(true);
      debounceRef.current = setTimeout(() => {
        performSearch(value);
      }, 300);
    } else {
      setResults([]);
      setIsLoading(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, performSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  const handleSelect = (result: WorldSearchResult) => {
    if (result.type === "world") {
      onChange(`${result.sector} ${result.hex}`);
    } else {
      onChange(result.sector);
    }
    onSelect(result);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) {
      if (e.key === "ArrowDown" && results.length > 0) {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const getIcon = (type: WorldSearchResult["type"]) => {
    switch (type) {
      case "world":
        return <MapPin className="w-3 h-3" />;
      case "sector":
        return <Globe className="w-3 h-3" />;
      case "subsector":
        return <Grid3X3 className="w-3 h-3" />;
    }
  };

  const getTypeColor = (type: WorldSearchResult["type"]) => {
    switch (type) {
      case "world":
        return "text-primary";
      case "sector":
        return "text-terminal-secondary";
      case "subsector":
        return "text-terminal-warning-alt";
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="text-terminal-text-dimmer text-xs block mb-1">{label}</label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="terminal-input text-sm pr-8"
        />
        {isLoading && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-terminal-text-dimmer" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-terminal-bg-darker border border-primary/30 shadow-lg shadow-primary/10 max-h-64 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={`${result.type}-${result.sector}-${result.hex}-${index}`}
              onClick={() => handleSelect(result)}
              className={`w-full text-left px-3 py-2 flex items-center gap-2 transition-colors ${
                index === selectedIndex
                  ? "bg-primary/20 text-primary"
                  : "hover:bg-primary/10"
              }`}
            >
              <span className={getTypeColor(result.type)}>
                {getIcon(result.type)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{result.name}</div>
                {result.type === "world" && (
                  <div className="text-xs text-terminal-text-dimmer">
                    {result.sector} {result.hex}
                  </div>
                )}
                {result.type !== "world" && (
                  <div className="text-xs text-terminal-text-dimmer">
                    {result.type === "sector" ? "Sector" : "Subsector"}
                  </div>
                )}
              </div>
              {result.type === "world" && (
                <span className="text-terminal-secondary text-xs font-mono">
                  {result.hex}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && !isLoading && value.length >= 2 && results.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-terminal-bg-darker border border-primary/30 shadow-lg shadow-primary/10 p-3 text-center text-terminal-text-dimmer text-sm">
          No worlds found matching "{value}"
        </div>
      )}
    </div>
  );
}
