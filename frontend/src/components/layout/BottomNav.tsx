type TActiveTab = 'reports' | 'submit' | 'profile';

interface IBottomNavProps {
  activeTab?: TActiveTab;
  onTabChange?: (tab: TActiveTab) => void;
}

export function BottomNav({
  activeTab = 'reports',
  onTabChange,
}: IBottomNavProps): JSX.Element {
  const activeClass = 'flex flex-col items-center gap-1 text-primary';
  const inactiveClass =
    'flex flex-col items-center gap-1 text-muted-light hover:text-primary transition-colors';

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-background-dark/80 backdrop-blur-sm border-t border-black/5">
      <nav className="flex justify-around items-center h-16">
        {/* Reports tab */}
        <button
          className={activeTab === 'reports' ? activeClass : inactiveClass}
          onClick={() => onTabChange?.('reports')}
          aria-label="Reports"
          aria-current={activeTab === 'reports' ? 'page' : undefined}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill={activeTab === 'reports' ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
          </svg>
          <span className="text-xs font-medium">Reports</span>
        </button>

        {/* Submit tab */}
        <button
          className={activeTab === 'submit' ? activeClass : inactiveClass}
          onClick={() => onTabChange?.('submit')}
          aria-label="Submit new report"
          aria-current={activeTab === 'submit' ? 'page' : undefined}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="16" />
            <line x1="8" x2="16" y1="12" y2="12" />
          </svg>
          <span className="text-xs font-medium">Submit</span>
        </button>

        {/* Profile tab */}
        <button
          className={activeTab === 'profile' ? activeClass : inactiveClass}
          onClick={() => onTabChange?.('profile')}
          aria-label="Profile"
          aria-current={activeTab === 'profile' ? 'page' : undefined}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
          <span className="text-xs font-medium">Profile</span>
        </button>
      </nav>
    </footer>
  );
}
