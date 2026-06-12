"use client";

import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

interface GeneralEvaluationCardProps {
  disciplineRate: number | undefined;
  overallRating: string | undefined;
}

export function GeneralEvaluationCard({ disciplineRate, overallRating }: GeneralEvaluationCardProps) {
  const targetDiscipline = disciplineRate !== undefined ? disciplineRate : 0;
  const [currentVal, setCurrentVal] = useState(0);

  useEffect(() => {
    const start = 0;
    const end = targetDiscipline;
    if (start === end) {
      setCurrentVal(end);
      return;
    }

    const duration = 1200; // 1.2 seconds
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing out cubic
      const easeOutCubic = 1 - Math.pow(1 - percentage, 3);
      const current = Math.round(start + easeOutCubic * (end - start));
      
      setCurrentVal(current);

      if (percentage < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [targetDiscipline]);

  const getColorForPercentage = (percent: number) => {
    if (percent < 40) return '#ba1a1a'; // Red (Low)
    if (percent < 75) return '#faa73b'; // Orange/Yellow (Medium)
    return '#003527'; // Dark Emerald (High / Primary Green)
  };

  const currentColor = getColorForPercentage(currentVal);

  const data = [
    { name: 'الانضباط', value: currentVal },
    { name: 'مفقود', value: 100 - currentVal },
  ];
  
  const COLORS = [currentColor, 'var(--color-surface-container)'];

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
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span 
            className="text-2xl font-heading font-extrabold transition-colors duration-300 animate-pulse"
            style={{ color: currentColor }}
          >
            {currentVal}%
          </span>
        </div>
      </div>
      
      <div className="flex-1 space-y-2">
        <h3 className="text-lg font-heading font-semibold text-on-surface">التقييم العام للمنشأة</h3>
        <p className="text-sm font-sans text-on-surface-variant">معدل الانضباط التراكمي يعكس مستوى التزام الموظفين بأوقات الحضور والانصراف.</p>
        <div className="pt-2">
          <span 
            className="inline-block px-3 py-1 rounded-full text-sm font-bold font-label transition-colors duration-300 animate-pulse"
            style={{
              backgroundColor: `${currentColor}1A`, // 10% opacity in hex
              color: currentColor
            }}
          >
            {overallRating || 'قيد المعالجة...'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
