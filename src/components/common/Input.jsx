import { forwardRef } from 'react';

/**
 * Input
 * Props: label, error, hint, icon (left), iconRight, ...input props
 */
const Input = forwardRef(function Input(
  { label, error, hint, icon, iconRight, className = '', id, ...props },
  ref
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="af-label">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`af-input ${icon ? 'pl-9' : ''} ${iconRight ? 'pr-9' : ''} ${
            error ? 'border-status-lost focus:ring-status-lost/30 focus:border-status-lost' : ''
          } ${className}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {iconRight && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
            {iconRight}
          </div>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-status-lost" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="mt-1 text-xs text-text-muted">
          {hint}
        </p>
      )}
    </div>
  );
});

export default Input;
