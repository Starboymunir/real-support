import { type ButtonHTMLAttributes, type AnchorHTMLAttributes, type ReactNode } from 'react';
import Link from 'next/link';

type BaseProps = {
  variant?: 'primary' | 'secondary' | 'green' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
  href?: string;
};

type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps>;
type ButtonAsLink = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps>;

type ButtonProps = ButtonAsButton | ButtonAsLink;

const sizeClasses: Record<string, string> = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3 text-base',
};

const variantClasses: Record<string, string> = {
  primary:
    'bg-gradient-to-br from-primary to-primary-light text-white hover:shadow-lg hover:-translate-y-0.5',
  secondary:
    'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  green:
    'bg-gradient-to-br from-secondary to-secondary-light text-white hover:shadow-lg hover:-translate-y-0.5',
  outline:
    'border border-white/[0.12] text-white hover:border-secondary hover:text-secondary',
  ghost:
    'text-white/60 hover:bg-white/[0.06] hover:text-white',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  href,
  ...rest
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
