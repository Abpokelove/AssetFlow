import { motion } from 'framer-motion';

/**
 * Card — Base surface container
 * Props: hover (bool), padding (tailwind string), className
 */
export default function Card({ children, hover = false, padding = 'p-6', className = '', ...props }) {
  const base = `bg-surface/95 rounded-card shadow-card border border-border ${padding}`;
  const hoverClass = hover ? 'hover:shadow-card-hover hover:-translate-y-[2px] transition-all duration-200 cursor-pointer' : 'transition-all duration-200';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`${base} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
