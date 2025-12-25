import { motion } from 'motion/react';

interface DateSeparatorProps {
  label: string;
}

export function DateSeparator({ label }: DateSeparatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center my-4"
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-300"></div>
        <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full shadow-sm">
          {label}
        </span>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>
    </motion.div>
  );
}



