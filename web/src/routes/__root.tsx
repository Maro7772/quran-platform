import { createRootRoute, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// إنشاء الـ QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // عشان ميعملش ريفيتش كل ما ترجع للتاب
      retry: 1, // يحاول مرة واحدة بس لو الريكويست فشل
    },
  },
});

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen font-arabic bg-neutral-bg text-text-main selection:bg-primary selection:text-white">
        <Outlet />
      </div>
    </QueryClientProvider>
  ),
});