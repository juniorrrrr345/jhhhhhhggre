import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className = "" 
}) {
  if (totalPages <= 1) return null

  const generatePageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      // Afficher toutes les pages si <= 5
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Logique pour plus de 5 pages
      if (currentPage <= 3) {
        // Début : 1, 2, 3, 4, 5
        for (let i = 1; i <= 5; i++) {
          pages.push(i)
        }
      } else if (currentPage >= totalPages - 2) {
        // Fin : ..., n-4, n-3, n-2, n-1, n
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Milieu : ..., current-2, current-1, current, current+1, current+2
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i)
        }
      }
    }
    
    return pages
  }

  const pageNumbers = generatePageNumbers()

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      {/* Bouton Précédent */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`
          flex items-center justify-center w-10 h-10 rounded-lg 
          border border-gray-500 bg-black bg-opacity-30 backdrop-blur-sm
          transition-all duration-200 hover:bg-opacity-50
          ${currentPage === 1 
            ? 'text-gray-500 cursor-not-allowed' 
            : 'text-white hover:border-gray-300'
          }
        `}
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </button>

      {/* Première page + ellipsis si nécessaire */}
      {pageNumbers[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="
              flex items-center justify-center w-10 h-10 rounded-lg 
              border border-gray-500 bg-black bg-opacity-30 backdrop-blur-sm
              text-white transition-all duration-200 hover:bg-opacity-50 hover:border-gray-300
            "
          >
            1
          </button>
          {pageNumbers[0] > 2 && (
            <span className="text-gray-400 px-2">...</span>
          )}
        </>
      )}

      {/* Pages principales */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`
            flex items-center justify-center w-10 h-10 rounded-lg 
            border transition-all duration-200 backdrop-blur-sm
            ${page === currentPage
              ? 'bg-white bg-opacity-20 border-white text-white font-semibold'
              : 'border-gray-500 bg-black bg-opacity-30 text-white hover:bg-opacity-50 hover:border-gray-300'
            }
          `}
        >
          {page}
        </button>
      ))}

      {/* Ellipsis + dernière page si nécessaire */}
      {pageNumbers[pageNumbers.length - 1] < totalPages && (
        <>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
            <span className="text-gray-400 px-2">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="
              flex items-center justify-center w-10 h-10 rounded-lg 
              border border-gray-500 bg-black bg-opacity-30 backdrop-blur-sm
              text-white transition-all duration-200 hover:bg-opacity-50 hover:border-gray-300
            "
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Bouton Suivant */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`
          flex items-center justify-center w-10 h-10 rounded-lg 
          border border-gray-500 bg-black bg-opacity-30 backdrop-blur-sm
          transition-all duration-200 hover:bg-opacity-50
          ${currentPage === totalPages 
            ? 'text-gray-500 cursor-not-allowed' 
            : 'text-white hover:border-gray-300'
          }
        `}
      >
        <ChevronRightIcon className="w-4 h-4" />
      </button>

      {/* Info sur la pagination */}
      <div className="ml-4 text-sm text-gray-300">
        Page {currentPage} sur {totalPages}
      </div>
    </div>
  )
}