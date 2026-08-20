import { MessageCircle, Users, Video, Clock } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    { icon: MessageCircle, title: '1. تواصلي مع المعلمة', desc: 'عن طريق الواتساب لمعرفة التفاصيل وتحديد المواعيد المناسبة.' },
    { icon: Users, title: '2. الانضمام للمجموعة', desc: 'بعد الاتفاق، سيتم إضافتك لمجموعة الواتساب الخاصة بالطالبات.' },
    { icon: Video, title: '3. حضور الحلقات', desc: 'لقاءات تفاعلية ومباشرة عبر Zoom أو Google Meet.' },
    { icon: Clock, title: '4. مراجعة التسجيلات', desc: 'تسجيلات الحلقات متاحة للمشاهدة لمدة 7 أيام عبر المنصة.' }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white relative">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-dark mb-4">كيف تسير رحلتنا؟</h2>
          <p className="text-text-main/70 max-w-xl mx-auto text-lg">خطوات بسيطة وواضحة لتنضمي إلى حلقات التحفيظ وتبدأي مسيرتكِ.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="relative p-8 rounded-3xl bg-neutral-bg border border-secondary/30 hover:shadow-xl hover:border-primary/50 transition-all duration-300 group hover:-translate-y-2">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <step.icon size={32} />
              </div>
              <h3 className="text-xl font-bold text-primary-dark mb-3">{step.title}</h3>
              <p className="text-text-main/75 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}