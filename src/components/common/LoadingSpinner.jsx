/**
 * LoadingSpinner
 * Props: size ('sm' | 'md' | 'lg'), color (tailwind text-* class)
 */
export default function LoadingSpinner({ size = 'md', color = 'text-primary', className = '' }) {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <div
      className={`inline-block ${sizeMap[size]} ${color} ${className} animate-spin`}
      role="status"
      aria-label="Loading"
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
          strokeDasharray="40 60" className="opacity-25" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}
