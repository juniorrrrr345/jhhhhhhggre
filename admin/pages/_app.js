import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const publicPages = ['/login'];
  const isPublicPage = publicPages.includes(router.pathname);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicPage) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router, isPublicPage]);

  // Afficher un loader pendant la vérification d'auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Rediriger vers le dashboard si authentifié sur la page de login
  if (isAuthenticated && router.pathname === '/login') {
    router.push('/');
    return null;
  }

  // Ne pas afficher le contenu si non authentifié (sauf pages publiques)
  if (!isAuthenticated && !isPublicPage) {
    return null;
  }

  return (
    <>
      <Component {...pageProps} />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          success: {
            style: {
              background: '#10B981',
              color: 'white',
            },
          },
          error: {
            style: {
              background: '#EF4444',
              color: 'white',
            },
          },
        }}
      />
    </>
  );
}