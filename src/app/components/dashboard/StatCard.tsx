import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '../ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-[#0F172A]',
  iconBg = 'from-[#FACC15] to-[#FBBF24]'
}: StatCardProps) {
  const changeColors = {
    increase: 'text-green-600 bg-green-50',
    decrease: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50'
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">{title}</p>
            <h3 className="text-3xl font-bold text-[#0F172A] mb-2">{value}</h3>
            {change && (
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${changeColors[changeType]}`}>
                {changeType === 'increase' ? '↑' : changeType === 'decrease' ? '↓' : '•'} {change}
              </div>
            )}
          </div>
          <div className={`w-12 h-12 bg-gradient-to-br ${iconBg} rounded-xl flex items-center justify-center shadow-md`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
