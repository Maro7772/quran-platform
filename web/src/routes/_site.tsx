import { createFileRoute, Outlet } from '@tanstack/react-router';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { MessageCircle } from 'lucide-react';

export const Route = createFileRoute('/_site')({
  component: SiteLayout,
});

// eslint-disable-next-line react-refresh/only-export-components
function SiteLayout() {
  return (
    <div className="flex flex-col min-h-screen relative">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

      {/* زر الواتساب العائم للتواصل المباشر مع المعلمة */}
      <a
        href="https://wa.me/201276528220?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%20%D9%88%D8%B1%D8%AD%D9%85%D8%A9%20%D8%A7%D9%84%D9%84%D9%87%20%D9%88%D8%A8%D8%B1%D9%83%D8%A7%D8%AA%D9%87%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%A7%D9%84%D8%A7%D9%86%D8%B6%D9%85%D8%A7%D9%85%20%D9%84%D9%85%D9%82%D8%B1%D8%A3%D8%A9%20%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86%20%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85%20%F0%9F%8C%B8"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-bold text-sm"
        title="تواصلي مباشرة مع المعلمة عبر الواتساب"
      >
        <MessageCircle size={22} className="fill-white/20" />
        <span className="hidden sm:inline">محادثة المعلمة</span>
      </a>
    </div>
  );
}