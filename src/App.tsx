import { useEffect, useState, lazy, Suspense } from "react";
import { useToast } from '@/contexts/toast';
import { verifyEmailAuthorization } from "@/api/endpoints/home";
import { AUTH_TIMEOUT_MS, AUTH_REFRESH_INTERVAL_MS } from "@/config/constants";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import { QueryClient } from '@tanstack/react-query';
import { QUERY_STALE_TIME_MS } from '@/config/constants';
import PWAUpdatePrompt from "./components/PWAUpdatePrompt";

import AppProvider from "@/contexts/AppProvider";
import AppRouter from "@/AppRouter";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_STALE_TIME_MS,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
      }
    }
  });
}

function App() {
  const toast = useToast();
  const [queryClient] = useState(createQueryClient);
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    const saved = localStorage.getItem("user_email");
    const savedTime = Number(localStorage.getItem("login_time") || 0);

    if (!saved || !savedTime) return null;

    if (Date.now() - savedTime > AUTH_TIMEOUT_MS) {
      localStorage.removeItem("user_email");
      localStorage.removeItem("login_time");
      return null;
    }

    return saved;
  });

  const handleLogout = async () => {
    (window as any)?.google?.accounts?.id?.disableAutoSelect?.();

    localStorage.removeItem("user_email");
    localStorage.removeItem("login_time");
    sessionStorage.removeItem("period");
    queryClient.clear();
    setUserEmail(null);
    toast.info('Você foi desconectado');
  };

  const handleLoginSuccess = async (credentialResponse: any) => {
    try {
      if (!credentialResponse.credential) return;
      const decoded = JSON.parse(
        atob(credentialResponse.credential.split(".")[1])
      );
      const email = decoded.email;

      const autorizado = await verifyEmailAuthorization(email);
      if (!autorizado) {
        toast.error('E-mail não autorizado!');
        return;
      }

      localStorage.setItem("user_email", email);
      localStorage.setItem("login_time", Date.now().toString());
      setUserEmail(email);
    } catch (err) {
      console.error("Erro ao decodificar login:", err);
      toast.error('Erro ao fazer login');
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (userEmail) {
        localStorage.setItem("login_time", Date.now().toString());
      }
    }, AUTH_REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [userEmail]);

  if (!userEmail) {
    const LoginScreen = lazy(() => import('@/components/login/LoginScreen'));

    return (
      <Suspense fallback={<div className="h-screen bg-white" />}>
        <LoginScreen onSuccess={handleLoginSuccess} onError={() => { }} />
      </Suspense>
    );
  }

  return (
    <ErrorBoundary>
      <AppProvider client={queryClient}>
        <AppRouter onLogout={handleLogout} />
        <PWAUpdatePrompt />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;