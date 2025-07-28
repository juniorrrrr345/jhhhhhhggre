import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useTranslation, getCurrentLanguage } from './LanguageSelector'

export default function Pagination({ 
  currentPage, 
  totalItems,
  itemsPerPage,
  totalPages,
  onPageChange, 
  className = "" 
}) {
  const currentLanguage = getCurrentLanguage()
  const { t } = useTranslation(currentLanguage)
  // Calculer totalPages à partir de totalItems et itemsPerPage si non fourni
  const calculatedTotalPages = totalPages || Math.ceil(totalItems / itemsPerPage)
  
  if (calculatedTotalPages <= 1) return null

  const generatePageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (calculatedTotalPages <= maxVisiblePages) {
      for (let i = 1; i <= calculatedTotalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i)
        }
      } else if (currentPage >= calculatedTotalPages - 2) {
        for (let i = calculatedTotalPages - 4; i <= calculatedTotalPages; i++) {
          pages.push(i)
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i)
        }
      }
    }
    
    return pages
  }

  const pageNumbers = generatePageNumbers()

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: '8px',
      padding: '16px 0'
    }}>
      {/* Bouton Précédent */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          backgroundColor: currentPage === 1 ? '#2a2a2a' : '#1a1a1a',
          border: '1px solid #3a3a3a',
          color: currentPage === 1 ? '#666666' : '#ffffff',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          fontWeight: '500',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (currentPage !== 1) {
            e.target.style.backgroundColor = '#2a2a2a'
          }
        }}
        onMouseLeave={(e) => {
          if (currentPage !== 1) {
            e.target.style.backgroundColor = '#1a1a1a'
          }
        }}
      >
        ←
      </button>

      {/* Première page + ellipsis si nécessaire */}
      {pageNumbers[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#1a1a1a',
              border: '1px solid #3a3a3a',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#2a2a2a'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#1a1a1a'}
          >
            1
          </button>
          {pageNumbers[0] > 2 && (
            <span style={{ color: '#8e8e93', padding: '0 8px' }}>...</span>
          )}
        </>
      )}

      {/* Pages principales */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: page === currentPage ? '#007AFF' : '#1a1a1a',
            border: page === currentPage ? '1px solid #007AFF' : '1px solid #3a3a3a',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: page === currentPage ? 'bold' : '500',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (page !== currentPage) {
              e.target.style.backgroundColor = '#2a2a2a'
            }
          }}
          onMouseLeave={(e) => {
            if (page !== currentPage) {
              e.target.style.backgroundColor = '#1a1a1a'
            }
          }}
        >
          {page}
        </button>
      ))}

      {/* Ellipsis + dernière page si nécessaire */}
      {pageNumbers[pageNumbers.length - 1] < calculatedTotalPages && (
        <>
          {pageNumbers[pageNumbers.length - 1] < calculatedTotalPages - 1 && (
            <span style={{ color: '#8e8e93', padding: '0 8px' }}>...</span>
          )}
          <button
            onClick={() => onPageChange(calculatedTotalPages)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#1a1a1a',
              border: '1px solid #3a3a3a',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#2a2a2a'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#1a1a1a'}
          >
            {calculatedTotalPages}
          </button>
        </>
      )}

      {/* Bouton Suivant */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === calculatedTotalPages}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          backgroundColor: currentPage === calculatedTotalPages ? '#2a2a2a' : '#1a1a1a',
          border: '1px solid #3a3a3a',
          color: currentPage === calculatedTotalPages ? '#666666' : '#ffffff',
          cursor: currentPage === calculatedTotalPages ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          fontWeight: '500',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (currentPage !== calculatedTotalPages) {
            e.target.style.backgroundColor = '#2a2a2a'
          }
        }}
        onMouseLeave={(e) => {
          if (currentPage !== calculatedTotalPages) {
            e.target.style.backgroundColor = '#1a1a1a'
          }
        }}
      >
        →
      </button>

      {/* Info sur la pagination */}
      <div style={{ 
        marginLeft: '16px', 
        fontSize: '12px', 
        color: '#8e8e93',
        fontWeight: '500'
      }}>
        {t('page')} {currentPage} {t('of')} {calculatedTotalPages}
      </div>
    </div>
  )
}