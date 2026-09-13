/**
 * دالة مساعدة لتحديد الرابط الأساسي للـ Backend:
 * تعتمد بالكامل على المتغيرات الممررة عبر GitHub Actions Secrets/Variables أو ملفات .env:
 * - NEXT_PUBLIC_API_DEV_URL (الذي تم وضعه في Actions Secrets/Variables)
 * - NEXT_PUBLIC_API_PUBLISH_URL
 * - NEXT_PUBLIC_API_URL
 *
 * لا تحتوي على أي روابط شخصية أو ثابتة داخل الكود لحماية الخصوصية والأمان.
 */
export function getBackendBaseUrl(): string {
  // 1. فحص المتغيرات المحقونة من GitHub Actions (secrets / vars) أو البيئة المحلية
  const apiUrl =
    process.env.NEXT_PUBLIC_API_DEV_URL ||
    process.env.NEXT_PUBLIC_API_PUBLISH_URL ||
    process.env.NEXT_PUBLIC_API_URL;

  if (apiUrl && typeof apiUrl === 'string' && apiUrl.trim()) {
    return apiUrl.trim().replace(/\/+$/, '');
  }

  // 2. خيار افتراضي محلي فقط أثناء التطوير على جهاز المطور عند غياب أي متغير بيئة
  return 'http://localhost:3030';
}

/**
 * Helper to construct the full image URL.
 * Handles:
 * 1. Data URLs and Blob URLs -> returns as-is.
 * 2. Localhost URLs stored in database -> dynamically rewritten to production backend URL when on live site.
 * 3. Absolute HTTPS URLs -> returns as-is.
 * 4. Relative upload paths (/uploads/...) -> prepends backend base URL.
 * 5. Null / undefined / empty -> returns undefined.
 */
export function getAvatarUrl(url?: string | null): string | undefined {
  if (!url || typeof url !== 'string') return undefined;

  const trimmed = url.trim();
  if (!trimmed) return undefined;

  // Data URLs or Blob URLs (e.g. previews during upload)
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  const backendBase = getBackendBaseUrl().replace(/\/+$/, '');

  // إذا كان الرابط في قاعدة البيانات يحتوي مسبقاً على localhost أو 127.0.0.1 وتم فتحه على GitHub Pages
  if (trimmed.includes('localhost:3030') || trimmed.includes('127.0.0.1:3030')) {
    if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (!isLocal) {
        // استبدال أصل localhost بالرابط الفعلي لسيرفر الإنتاج
        return trimmed.replace(/^https?:\/\/(localhost|127\.0\.0\.1):3030/, backendBase);
      }
    }
    return trimmed;
  }

  // روابط إنترنت كاملة صالحة (HTTPS / HTTP لمصادر خارجية أو Railway)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // مسار نسبي (مثل /uploads/avatars/...)
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${backendBase}${cleanPath}`;
}
