interface ISearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search reports...',
}: ISearchBarProps): JSX.Element {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-background-dark/50 border border-gray-200 dark:border-white/10 text-foreground-light dark:text-foreground-dark placeholder-muted-light focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span className="material-symbols-outlined text-muted-light text-xl leading-none">
          search
        </span>
      </div>
    </div>
  );
}
