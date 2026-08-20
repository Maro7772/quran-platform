import { BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white/80 py-12 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <BookOpen size={32} className="mx-auto mb-4 opacity-50" />
        <p className="text-lg mb-2">منصة تحفيظ وتدبر القرآن الكريم للسيدات</p>
        <p className="text-sm opacity-60">جميع الحقوق محفوظة &copy; {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}