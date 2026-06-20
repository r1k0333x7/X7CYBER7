import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../lib/theme';
import Layout from '../components/Layout';
import '../styles/globals.css';

function AuthGuard({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem('x7_token');
    if (!token) {
      router.replace('/login');
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) return null;
  return children;
}

export default function App({ Component, pageProps }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } }
      })
  );
  const router = useRouter();
  const isAuthPage = router.pathname === '/login';

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {isAuthPage ? (
          <Component {...pageProps} />
        ) : (
          <AuthGuard>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </AuthGuard>
        )}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
