"use client";

import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface GeneralEvaluationCardProps {
  disciplineRate: number;
  overallRating: string | null;
}

export function GeneralEvaluationCard({ disciplineRate, overallRating }: GeneralEvaluationCardProps) {
  const data = [
    { name: 'الانضباط', value: disciplineRate },
    { name: 'مفقود', value: 100 - disciplineRate },
  ];
  
  const COLORS = ['var(--color-primary)', 'var(--color-surface-container)'];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-surface-container-lowest border border-outline/10 rounded-xl p-6 shadow-sm flex items-center gap-6"
    >
      <div className="w-32 h-32 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={40}
              outerRadius={55}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-xl font-heading font-bold text-primary">{disciplineRate}%</span>
        </div>
      </div>
      
      <div className="flex-1 space-y-2">
        <h3 className="text-lg font-heading font-semibold text-on-surface">التقييم العام للمنشأة</h3>
        <p className="text-sm font-sans text-on-surface-variant">معدل الانضباط التراكمي يعكس مستوى التزام الموظفين بأوقات الحضور والانصراف.</p>
        <div className="pt-2">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold font-label">
            {overallRating || 'قيد المعالجة...'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
