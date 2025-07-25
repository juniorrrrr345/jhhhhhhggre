import Link from 'next/link'
import { useTranslation } from './LanguageSelector'

export default function ShopNavigation({ currentLanguage = 'fr', currentPage = 'home' }) {
  const { t } = useTranslation(currentLanguage)

  const navItems = [
    { key: 'home', href: '/shop', label: t('home') },
    { key: 'search', href: '/shop/search', label: t('search').replace('...', '') },
    { key: 'vip', href: '/shop/vip', label: t('vip') }
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
      zIndex: 1000
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
            color: currentPage === item.key ? '#ffffff' : '#8e8e93',
            fontSize: '12px',
            fontWeight: currentPage === item.key ? 'bold' : 'normal',
            transition: 'color 0.2s'
          }}
        >
          <div style={{ 
            fontSize: '20px', 
            marginBottom: '4px',
            opacity: currentPage === item.key ? 1 : 0.7
          }}>
            {item.key === 'home' && '🏠'}
            {item.key === 'search' && '🔍'}
            {item.key === 'vip' && '⭐'}
          </div>
          {item.label}
        </Link>
      ))}
    </div>
  )
}