/** @type {import('next').NextConfig} */
const nextConfig = {
  // تفعيل Static Export لـ GitHub Pages
  output: 'export',
  // basePath يجب أن يطابق اسم المستودع على GitHub
  basePath: '/workTime-fornt',
  // مطلوب لصفحات GitHub Pages للتنقل الصحيح
  trailingSlash: true,
  // GitHub Pages لا تدعم Image Optimization
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

