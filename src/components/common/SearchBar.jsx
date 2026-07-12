import { Search, X } from 'lucide-react';
import { useState, useCallback } from 'react';
import { debounce } from '../../utils/helpers';

/**
 * SearchBar
 * Props: value, onChange, placeholder, className
 */
export default function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }) {
  const handleClear = () => onChange('');

  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
        <Search size={15} />
      </div>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="af-input pl-9 pr-8 w-full"
        aria-label={placeholder}
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
