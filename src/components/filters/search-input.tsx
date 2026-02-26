import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const isExternalUpdate = useRef(false);

  // Sync local state when the prop value changes externally (e.g. reset)
  useEffect(() => {
    isExternalUpdate.current = true;
    setLocalValue(value);
  }, [value]);

  // Debounce: call onChange 300ms after the user stops typing
  useEffect(() => {
    if (isExternalUpdate.current) {
      isExternalUpdate.current = false;
      return;
    }

    const timer = setTimeout(() => {
      onChange(localValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue, onChange]);

  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="placeholder:text-muted-foreground border-input dark:bg-input/30 h-9 w-full min-w-[200px] rounded-md border bg-transparent py-1 pl-8 pr-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
      />
    </div>
  );
}
