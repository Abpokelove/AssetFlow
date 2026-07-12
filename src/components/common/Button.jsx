import LoadingSpinner from './LoadingSpinner';

/**
 * Button
 * Props:
 *   variant: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger'
 *   size: 'sm' | 'md' | 'lg'
 *   loading: boolean
 *   icon: ReactNode (left icon)
 *   iconRight: ReactNode (right icon)
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-button transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover shadow-sm hover:shadow-md',
    secondary: 'bg-surface text-primary border border-primary hover:bg-primary hover:text-white',
    accent: 'bg-accent text-white hover:bg-accent-hover shadow-sm hover:shadow-md',
    ghost: 'bg-transparent text-text-secondary hover:bg-border hover:text-text-primary',
    danger: 'bg-status-lost text-white hover:opacity-90 shadow-sm hover:shadow-md',
    outline: 'bg-transparent text-text-primary border border-border hover:bg-background',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-sm px-5 py-3',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size="sm" color="text-current" />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      {children}
      {iconRight && !loading && <span className="flex-shrink-0">{iconRight}</span>}
    </button>
  );
}
