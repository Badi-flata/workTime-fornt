import { AxiosError } from 'axios';

export interface FormattedApiError {
  userFriendlyMessage: string;
  statusCode: number;
  errorCategory: string;
  traceId?: string;
  devDetails?: {
    statusCode: number;
    path?: string;
    systemMessage?: string;
    rawCause?: unknown;
    timestamp?: string;
  };
}

/**
 * Generates a client-side trace token if none was provided by the server.
 */
function generateClientTraceId(): string {
  return `cl_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * General API Error Handler - Translates raw HTTP/Axios/Prisma/Network exceptions
 * into structured dual-layer messages (User-friendly Arabic message + Developer diagnostics).
 */
export function handleApiError(
  err: unknown,
  fallbackMessage = 'حدث خطأ أثناء معالجة الطلب، يرجى المحاولة لاحقاً.'
): FormattedApiError {
  let statusCode = 500;
  let userFriendlyMessage = fallbackMessage;
  let errorCategory = 'GENERAL_ERROR';
  let traceId = generateClientTraceId();
  let devDetails: FormattedApiError['devDetails'];

  if (err instanceof AxiosError) {
    statusCode = err.response?.status || 500;
    const responseData = err.response?.data as any;
    traceId = responseData?.traceId || traceId;
    const backendMessage = responseData?.message || responseData?.systemMessage;
    const category = responseData?.errorCategory;

    devDetails = {
      statusCode,
      path: err.config?.url,
      systemMessage: backendMessage || err.message,
      rawCause: responseData?.cause || err.response?.data,
      timestamp: responseData?.timestamp || new Date().toISOString(),
    };

    if (category) {
      errorCategory = category;
    }

    if (err.code === 'ERR_NETWORK' || !err.response) {
      statusCode = 503;
      errorCategory = 'NETWORK_OR_SERVER_UNAVAILABLE';
      userFriendlyMessage = 'تعذر الاتصال بالخادم، يرجى التحقق من اتصال الإنترنت وتشغيل السيرفر.';
    } else if (typeof backendMessage === 'string' && backendMessage.length > 0) {
      // أولوية للرسالة من الـ Backend — تمريرها كما هي
      userFriendlyMessage = backendMessage;
      if (!category) {
        // إذا لم يأتِ errorCategory من الـ Backend، نُعيّنه حسب الـ status
        if (statusCode === 401) errorCategory = 'UNAUTHENTICATED';
        else if (statusCode === 403) errorCategory = 'UNAUTHORIZED_ACCESS';
        else if (statusCode === 404) errorCategory = 'NOT_FOUND';
        else if (statusCode === 409) errorCategory = 'CONFLICT';
        else if (statusCode === 400) errorCategory = 'VALIDATION_ERROR';
        else if (statusCode >= 500) errorCategory = 'SERVER_INTERNAL_ERROR';
      }
    } else if (Array.isArray(backendMessage)) {
      userFriendlyMessage = `بيانات غير صالحة: ${backendMessage.join(' | ')}`;
      if (!category) errorCategory = 'VALIDATION_ERROR';
    } else {
      // Fallback — لا رسالة من الـ Backend
      if (statusCode === 401) {
        errorCategory = category || 'UNAUTHENTICATED';
        userFriendlyMessage = 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً للمتابعة.';
      } else if (statusCode === 403) {
        errorCategory = category || 'UNAUTHORIZED_ACCESS';
        userFriendlyMessage = 'عذراً، ليس لديك الصلاحية الكافية لتنفيذ هذه العملية.';
      } else if (statusCode === 404) {
        errorCategory = category || 'NOT_FOUND';
        userFriendlyMessage = 'المورد أو السجل المطلوب غير موجود.';
      } else if (statusCode === 409) {
        errorCategory = category || 'CONFLICT';
        userFriendlyMessage = 'توجد بيانات مسجلة مسبقاً تتعارض مع هذا الطلب (مثل اسم قسم أو وردية مكرر).';
      } else if (statusCode === 400) {
        errorCategory = category || 'VALIDATION_ERROR';
        userFriendlyMessage = 'البيانات المرسلة غير صحيحة، يرجى مراجعة المدخلات.';
      } else if (statusCode >= 500) {
        errorCategory = category || 'SERVER_INTERNAL_ERROR';
        userFriendlyMessage = 'حدث خطأ داخلي في الخادم أثناء المعالجة، يرجى المحاولة لاحقاً.';
      }
    }
  } else if (err instanceof Error) {
    devDetails = {
      statusCode: 500,
      systemMessage: err.message,
      rawCause: err.stack,
    };
    userFriendlyMessage = fallbackMessage;
  }

  // Development logger
  if (process.env.NODE_ENV === 'development') {
    console.groupCollapsed(`[API Error] [${errorCategory}] [Trace: ${traceId}]`);
    console.error('User Message:', userFriendlyMessage);
    console.error('Dev Details:', devDetails);
    console.groupEnd();
  }

  return {
    userFriendlyMessage,
    statusCode,
    errorCategory,
    traceId,
    devDetails,
  };
}

// ─────────────────────────────────────────────────────────────
// Operation-Specific Error Catchers
// ─────────────────────────────────────────────────────────────

export const AttendanceErrorCatch = {
  checkIn: (err: unknown): FormattedApiError => {
    return handleApiError(err, 'فشل في تسجيل الحضور، تأكد من الوردية ومواعيد الدخول المحددة.');
  },
  checkOut: (err: unknown): FormattedApiError => {
    return handleApiError(err, 'فشل في تسجيل الانصراف، يرجى التحقق من وجود تسجيل دخول مسبق.');
  },
  submitExcuse: (err: unknown): FormattedApiError => {
    return handleApiError(err, 'فشل في تقديم العذر، يرجى إدخال تفاصيل العذر بشكل صحيح.');
  },
  report: (err: unknown): FormattedApiError => {
    return handleApiError(err, 'تعذر جلب سجلات وتقارير الحضور للفترة المحددة.');
  },
};

export const AuthErrorCatch = {
  login: (err: unknown): FormattedApiError => {
    return handleApiError(err, 'فشل تسجيل الدخول، يرجى التحقق من صحة البريد الإلكتروني وكلمة المرور.');
  },
  signUp: (err: unknown): FormattedApiError => {
    return handleApiError(err, 'فشل إنشاء الحساب الجديد، قد يكون البريد الإلكتروني مسجلاً مسبقاً.');
  },
  profile: (err: unknown): FormattedApiError => {
    return handleApiError(err, 'تعذر استرجاع أو تحديث بيانات الملف الشخصي.');
  },
};

export const ManagingErrorCatch = {
  shifts: (err: unknown): FormattedApiError => {
    return handleApiError(err, 'حدث خطأ أثناء معالجة الورديات أو إعداداتها.');
  },
  auditEmployee: (err: unknown): FormattedApiError => {
    return handleApiError(err, 'فشل في تدقيق أو تعديل بيانات الموظف.');
  },
  subordinates: (err: unknown): FormattedApiError => {
    return handleApiError(err, 'تعذر جلب قائمة الموظفين التابعين.');
  },
  dashboard: (err: unknown): FormattedApiError => {
    return handleApiError(err, 'فشل في استرجاع بيانات لوحة التحكم وسجل الحضور العام.');
  },
  report: (err: unknown): FormattedApiError => {
    return handleApiError(err, 'تعذر جلب تقرير الحضور للموظف المحدد.');
  },
};

export const DepartmentErrorCatch = {
  fetch: (err: unknown): FormattedApiError => {
    return handleApiError(err, 'فشل في جلب قائمة الأقسام.');
  },
  create: (err: unknown): FormattedApiError => {
    return handleApiError(err, 'فشل في إنشاء القسم الجديد، تأكد من عدم تكرار الاسم.');
  },
  update: (err: unknown): FormattedApiError => {
    return handleApiError(err, 'فشل في تحديث بيانات القسم.');
  },
  delete: (err: unknown): FormattedApiError => {
    return handleApiError(err, 'لا يمكن حذف القسم نظراً لوجود موظفين مرتبطين به.');
  },
  names: (err: unknown): FormattedApiError => {
    return handleApiError(err, 'تعذر جلب قائمة أسماء الأقسام.');
  },
  addWorker: (err: unknown): FormattedApiError => {
    return handleApiError(err, 'تعذر إضافة الموظف في الأقسام.');
  },
  truneToDepartment: (err: unknown): FormattedApiError => {
    return handleApiError(err, 'تعذر نقل الموظف من الأقسام.');
  },
};

export const ShiftErrorCatch = {
  fetch: (err: unknown): FormattedApiError => {
    return handleApiError(err, 'فشل في جلب قائمة الورديات.');
  },
  create: (err: unknown): FormattedApiError => {
    return handleApiError(err, 'فشل في إنشاء الوردية، يرجى التحقق من أوقات العمل والربط بالقسم.');
  },
  update: (err: unknown): FormattedApiError => {
    return handleApiError(err, 'فشل في تحديث بيانات الوردية.');
  },
  delete: (err: unknown): FormattedApiError => {
    return handleApiError(err, 'لا يمكن حذف الوردية نظراً لوجود موظفين مرتبطين بها.');
  },
};

export const DirectoryErrorCatch = {
  search: (err: unknown): FormattedApiError => {
    return handleApiError(err, 'فشل في استرجاع بيانات دليل الموظفين والبحث.');
  },
  assignEmployee: (err: unknown): FormattedApiError => {
    return handleApiError(err, 'تعذر إضافة الموظف للفريق، قد يكون مرتبطاً بمدير آخر.');
  },
  setManager: (err: unknown): FormattedApiError => {
    return handleApiError(err, 'تعذر تعيين المدير للموظف.');
  },
};
