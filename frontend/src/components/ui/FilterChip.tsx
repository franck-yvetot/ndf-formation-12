interface IFilterChipProps {
  label: string;
  onRemove: () => void;
}

export function FilterChip({ label, onRemove }: IFilterChipProps): JSX.Element {
  return (
    <div className="flex items-center gap-1 bg-primary text-white text-sm font-medium px-3 py-1.5 rounded-full whitespace-nowrap">
      <span>{label}</span>
      <button
        onClick={onRemove}
        aria-label={`Remove filter: ${label}`}
        className="flex items-center ml-0.5 hover:opacity-75 transition-opacity"
      >
        <span className="material-symbols-outlined text-base leading-none">close</span>
      </button>
    </div>
  );
}
