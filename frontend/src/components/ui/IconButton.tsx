import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface IIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  ariaLabel: string;
}

export function IconButton({
  children,
  ariaLabel,
  className = '',
  ...rest
}: IIconButtonProps): JSX.Element {
  return (
    <button
      aria-label={ariaLabel}
      className={`w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/10 transition-colors ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
