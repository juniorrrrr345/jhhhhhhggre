import Link from 'next/link'
import { useTranslation } from './LanguageSelector'

export default function ShopNavigation({ currentLanguage = 'fr', currentPage = 'home' }) {
  const { t } = useTranslation(currentLanguage)

  const navItems = [
    { key: 'home', href: '/shop', label: t('home') },
    { key: 'search', href: '/shop/search', label: t('search').replace('...', '') },
    { key: 'vip', href: '/shop/vip', label: t('vip') },
    { key: 'inscription', href: '/shop/inscription', label: t('nav_inscription') },
    { key: 'services', href: '/shop/services', label: t('nav_services') }
  ]

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '0', 
      left: '0', 
      right: '0', 
      backgroundColor: '#000000',
      borderTop: '1px solid #333333',
      padding: '16px 20px',
      display: 'flex',
      justifyContent: 'space-around',
      zIndex: 1000,
      fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {navItems.map((item) => (
        <Link 
          key={item.key}
          href={item.href}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            color: currentPage === item.key ? '#ffffff' : '#cccccc',
            fontSize: '11px',
            fontWeight: currentPage === item.key ? 'bold' : '600',
            transition: 'color 0.2s',
            textDecoration: 'none',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)'
          }}
        >
          <div style={{ 
            fontSize: '18px', 
            marginBottom: '4px',
            opacity: currentPage === item.key ? 1 : 0.7
          }}>
            {item.key === 'home' && '🏠'}
            {item.key === 'search' && '🔍'}
            {item.key === 'vip' && '⭐'}
            {item.key === 'inscription' && '📝'}
            {item.key === 'services' && '🛠️'}
          </div>
          {item.label}
        </Link>
      ))}
    </div>
  )
}