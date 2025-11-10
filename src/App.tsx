import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  useLaunchParams, 
  useMiniApp,
  useThemeParams,
  useViewport,
} from '@telegram-apps/sdk-react';

import { useAuthStore } from './store/authStore';
import { setTelegramAuth } from './lib/supabase';
import { Layout } from './components/Layout';
import { AfishaPage } from './pages/AfishaPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { TinderPage } from './pages/TinderPage';
import { ProfilePage } from './pages/ProfilePage';
import { VacanciesPage } from './pages/VacanciesPage';
import { PromoterPage } from './pages/PromoterPage';
import { AdminPage } from './pages/AdminPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppContent() {
  const lp = useLaunchParams();
  const { initUser } = useAuthStore();
  
  const miniApp = useMiniApp();
  const themeParams = useThemeParams();
  const viewport = useViewport();

  useEffect(() => {
    if (lp.initDataRaw) {
      // First, set the auth header for all subsequent Supabase requests
      setTelegramAuth(lp.initDataRaw);
      
      // Then, initialize the user profile in our state
      if (lp.initData?.user) {
        initUser(lp.initData.user);
      }
    }
  }, [lp.initData, lp.initDataRaw, initUser]);

  useEffect(() => {
    miniApp.ready();
    miniApp.setHeaderColor('#000000');
    miniApp.setBackgroundColor('#030712');
    viewport.expand();

    // The themeParams object is reactive, so we can use its properties directly.
    document.documentElement.classList.toggle('dark', themeParams.isDark);
  }, [themeParams.isDark, miniApp, viewport]);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/afisha" replace />} />
            <Route path="afisha" element={<AfishaPage />} />
            <Route path="event/:id" element={<EventDetailPage />} />
            <Route path="tinder" element={<TinderPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="vacancies" element={<VacanciesPage />} />
            <Route path="promoter" element={<PromoterPage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default function App() {
  return <AppContent />;
}
