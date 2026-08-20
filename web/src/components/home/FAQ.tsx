export default function FAQ() {
  const faqs = [
    { q: 'هل الحلقات مناسبة للمبتدئات؟', a: 'نعم، المنصة مصممة لتناسب جميع المستويات من التأسيس وحتى الإجازة.' },
    { q: 'ماذا لو فاتتني حلقة مباشرة؟', a: 'يتم تسجيل جميع الحلقات وإتاحتها للمشاهدة لمدة 7 أيام للطالبات المشتركات.' },
    { q: 'هل يمكنني التفاعل مع المعلمة أثناء الحلقة؟', a: 'بالتأكيد، الحلقات تفاعلية وتعتمد على التسميع والمراجعة المباشرة.' },
    { q: 'هل المنصة مختلطة؟', a: 'لا، المنصة والحلقات مخصصة بالكامل للسيدات فقط لتوفير بيئة مريحة.' }
  ];

  return (
    <section id="faq" className="py-24 bg-neutral-bg">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-dark mb-4">الأسئلة الشائعة</h2>
          <p className="text-text-main/70 text-lg">أكثر الأسئلة التي تصلنا حول نظام الحلقات</p>
        </div>

        <div className="grid gap-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-secondary/20 hover:border-primary/30 transition-colors">
              <h3 className="text-lg font-bold text-primary-dark mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                {faq.q}
              </h3>
              <p className="text-text-main/80 pr-4">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}