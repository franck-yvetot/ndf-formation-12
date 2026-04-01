import { IconButton } from '../ui/IconButton';

interface IAppHeaderProps {
  title: string;
  onActionClick?: () => void;
  actionAriaLabel?: string;
}

export function AppHeader({
  title,
  onActionClick,
  actionAriaLabel = 'Add new',
}: IAppHeaderProps): JSX.Element {
  return (
    <header className="sticky top-0 bg-background-light dark:bg-background-dark/80 backdrop-blur-sm z-10">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10">
        {/* Spacer to keep title centered */}
        <div className="w-10" />

        <h1 className="text-lg font-bold text-foreground-light dark:text-foreground-dark">
          {title}
        </h1>

        <IconButton ariaLabel={actionAriaLabel} onClick={onActionClick}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#40B59D"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="12" x2="12" y1="5" y2="19" />
            <line x1="5" x2="19" y1="12" y2="12" />
          </svg>
        </IconButton>
      </div>
    </header>
  );
}
