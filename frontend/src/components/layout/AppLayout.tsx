import type { ReactNode } from 'react';
import { AppHeader } from './AppHeader';
import { BottomNav } from './BottomNav';

interface IAppLayoutProps {
  children: ReactNode;
  headerTitle: string;
  onHeaderAction?: () => void;
  headerActionAriaLabel?: string;
}

export function AppLayout({
  children,
  headerTitle,
  onHeaderAction,
  headerActionAriaLabel,
}: IAppLayoutProps): JSX.Element {
  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display">
      <AppHeader
        title={headerTitle}
        onActionClick={onHeaderAction}
        actionAriaLabel={headerActionAriaLabel}
      />
      <main className="flex-grow pb-24">{children}</main>
      <BottomNav activeTab="reports" />
    </div>
  );
}
