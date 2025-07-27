import Link from 'next/link'
import { useTranslation } from './LanguageSelector'

export default function ShopNavigation({ currentLanguage = 'fr', currentPage = 'home' }) {
  const { t } = useTranslation(currentLanguage)

  const navItems = [
    { key: 'home', href: '/shop', label: t('home'), icon: '🏚️', activeIcon: '🏠' },
    { key: 'search', href: '/shop/search', label: t('search').replace('...', ''), icon: '🔎', activeIcon: '🔍' },
    { key: 'vip', href: '/shop/vip', label: t('vip'), icon: '✨', activeIcon: '⭐' }
  ]

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '0', 
      left: '0', 
      right: '0', 
      background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 20, 0.95))',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '12px 20px 20px',
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
            color: currentPage === item.key ? '#ffffff' : '#ffffff',
            fontSize: '13px',
            fontWeight: currentPage === item.key ? '700' : '600',
            transition: 'all 0.3s ease',
            padding: '8px 12px',
            borderRadius: '12px',
            background: currentPage === item.key ? 'rgba(0, 122, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
            border: currentPage === item.key ? '1px solid rgba(0, 122, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div style={{ 
            fontSize: '22px', 
            marginBottom: '6px',
            filter: currentPage === item.key ? 'drop-shadow(0 0 8px rgba(0, 122, 255, 0.6))' : 'none',
            transform: currentPage === item.key ? 'scale(1.1)' : 'scale(1)',
            transition: 'all 0.3s ease'
          }}>
            {currentPage === item.key ? item.activeIcon : item.icon}
          </div>
          {item.label}
        </Link>
      ))}
    </div>
  )
}