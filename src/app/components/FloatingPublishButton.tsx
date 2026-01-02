import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';

export function FloatingPublishButton() {
  return (
    <motion.div
      className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: 0.2 
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Link
        to="/publier"
        className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#FACC15] to-[#FBBF24] text-[#0F172A] rounded-full shadow-2xl hover:shadow-[#FACC15]/50 transition-all duration-300 font-semibold"
      >
        <Plus className="w-6 h-6" strokeWidth={3} />
        <span className="text-base">Publier une annonce</span>
      </Link>
    </motion.div>
  );
}

