import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Modal
 * Props:
 *   open: boolean
 *   onClose: () => void
 *   title: string
 *   size: 'sm' | 'md' | 'lg' | 'xl'
 *   footer: ReactNode
 */
export default function Modal({ open, onClose, title, children, size = 'md', footer, className = '' }) {
  const sizeMap = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && open) onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`relative z-10 w-full ${sizeMap[size]} bg-surface/95 rounded-card shadow-[0_20px_60px_rgba(15,23,42,0.16)] border border-border/80 flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[90vh] overflow-hidden backdrop-blur-sm ${className}`}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 border-b border-border flex-shrink-0">
                <h2 className="text-base font-bold text-text-primary pr-2">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-button text-text-secondary hover:bg-background hover:text-text-primary transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 px-4 py-3 sm:px-6 sm:py-4 border-t border-border flex-shrink-0 bg-surface/80">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
