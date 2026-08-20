import { PlayCircle, MessageCircle } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
      {/* Organic Background Blobs */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-secondary/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -z-10 animate-pulse"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-tertiary/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -z-10 animate-pulse" style={{ animationDelay: '4s' }}></div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <span className="inline-block py-1.5 px-5 mb-6 rounded-full bg-primary/15 text-primary-dark font-bold text-sm border border-primary/20">
          للسيدات فقط 🌿
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-dark mb-6 leading-tight max-w-4xl mx-auto">
          رحلتكِ مع القرآن تبدأ بخطوة، <br className="hidden md:block" /> في بيئة مطمئنة وصحبة صالحة.
        </h1>
        <p className="text-lg md:text-xl text-text-main/80 mb-10 max-w-2xl mx-auto leading-relaxed">
          برنامج متكامل لتحفيظ وتدبر القرآن الكريم من خلال حلقات مباشرة أونلاين، مصمم خصيصاً لمساعدتكِ على الحفظ، الفهم، والاستمرار.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://wa.me/201276528220?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%20%D9%88%D8%B1%D8%AD%D9%85%D8%A9%20%D8%A7%D9%84%D9%84%D9%87%20%D9%88%D8%A8%D8%B1%D9%83%D8%A7%D8%AA%D9%87%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%A7%D9%84%D8%A7%D9%86%D8%B6%D9%85%D8%A7%D9%85%20%D9%84%D9%85%D9%82%D8%B1%D8%A3%D8%A9%20%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86%20%D8%A7%D9%84%D9%83%D8%B1%D9%8A%D9%85%20%F0%9F%8C%B8"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-primary-dark text-white px-8 py-4 rounded-full font-bold shadow-md hover:bg-primary-dark/90 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
          >
            <MessageCircle size={22} className="text-emerald-300 animate-pulse" />
            <span>تواصلي مع المعلمة الآن</span>
          </a>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent text-primary-dark border-2 border-primary/40 px-8 py-4 rounded-full font-bold hover:bg-amber-50 hover:text-primary-dark hover:border-primary transition-all duration-300 cursor-pointer"
          >
            <PlayCircle size={22} />
            <span>اكتشفي البرنامج</span>
          </a>
        </div>
      </div>
    </section>
  );
}