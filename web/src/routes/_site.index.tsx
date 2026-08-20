import { createFileRoute } from '@tanstack/react-router';
import Hero from '../components/home/Hero';
import HowItWorks from '../components/home/HowItWorks';
import FAQ from '../components/home/FAQ';

export const Route = createFileRoute('/_site/')({
  component: Index,
});

// eslint-disable-next-line react-refresh/only-export-components
function Index() {
  return (
    <div className="flex flex-col w-full">
      <Hero />
      <HowItWorks />
      <FAQ />
    </div>
  );
}