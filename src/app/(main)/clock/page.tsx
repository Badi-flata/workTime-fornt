"use client";

import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

export default function ClockInOutPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-heading font-bold text-primary mb-2">تسجيل الحضور والانصراف</h1>
        <p className="text-on-surface-variant font-sans">تسجيل دخول وخروج الموظفين وتقديم الأعذار.</p>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline/10 p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
        <Clock size={48} className="text-primary/30 mb-4" />
        <h3 className="text-lg font-heading font-semibold text-on-surface-variant mb-2">قيد التطوير</h3>
        <p className="text-sm text-on-surface-variant/70 max-w-md">
          شاشة تسجيل الحضور والانصراف ستتيح للموظف تسجيل دخوله وخروجه وتقديم أعذار التأخر أو الانصراف المبكر.
        </p>
        <p className="text-xs text-outline mt-4 font-label">Screen: Clock_In_Out_Screen</p>
      </div>
    </motion.div>
  );
}
