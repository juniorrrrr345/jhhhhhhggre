import '../styles/globals.css'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from '../components/ErrorBoundary'
import SyncStatus from '../components/SyncStatus'
import LanguageSync from '../components/LanguageSync'

export default function App({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <Component {...pageProps} />
      <SyncStatus />
      <LanguageSync />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#4aed88',
            },
          },
          error: {
            duration: 4000,
            theme: {
              primary: '#f56565',
            },
          },
        }}
      />
    </ErrorBoundary>
  )
}