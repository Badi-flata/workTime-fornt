/**
 * أنواع الاستجابة الموحدة — Frontend
 * تُطابق الواجهات في Backend (global-response.interface.ts)
 * تُستخدم مع Partial/Pick/Omit لتخصيص الأنواع حسب كل عملية
 */

/**
 * استجابة ناجحة من الـ API — مرنة عبر Generic T
 * @example ApiSuccessResponse<UserOutput> — استجابة تحتوي بيانات مستخدم
 * @example ApiSuccessResponse<UserOutput[]> — استجابة تحتوي قائمة مستخدمين
 */
export interface ApiSuccessResponse<T = any> {
  statusCode: number;
  message: string;
  data: T;
  meta?: PaginationMeta;
  timestamp: string;
}

/**
 * استجابة خطأ من الـ API — تُطابق شكل AllExceptionsFilter
 */
export interface ApiErrorResponse {
  statusCode: number;
  errorCategory: string;
  message: string;
  traceId: string;
  timestamp: string;
  path: string;
  method: string;
  cause?: string;
}

import { PaginationMeta } from './pagination.types';

/**
 * نتيجة Discipline Rate — مرنة للاستخدام مع Pick
 * @example Pick<DisciplineResult, 'rate' | 'label'> — للعرض المختصر
 */
export interface DisciplineResult {
  rate: number;
  label: string;
  periodLabel: string;
  summary?: any;
}

/**
 * نتيجة Discipline شامل للمؤسسة/المدير
 */
export interface OrganizationDisciplineResult {
  organizationRate: number;
  organizationLabel: string;
  periodLabel: string;
  employeeRates: Array<{
    employeeId: string;
    name: string;
    rate: number;
    label: string;
  }>;
}
