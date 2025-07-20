import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Met à jour le state pour que l'UI suivante montre l'erreur
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Vous pouvez aussi log l'erreur vers un service de reporting d'erreurs
    console.error('ErrorBoundary a capturé une erreur:', error);
    console.error('Info sur l\'erreur:', errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // UI de fallback personnalisée
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Oops ! Une erreur est survenue
              </h2>
              <p className="text-gray-600 mb-4">
                Une erreur client-side s'est produite. Veuillez rafraîchir la page ou revenir plus tard.
              </p>
              
              {/* Détails techniques en mode développement */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left bg-gray-100 p-4 rounded text-sm mb-4">
                  <summary className="cursor-pointer font-medium">Détails techniques</summary>
                  <div className="mt-2 whitespace-pre-wrap text-red-600">
                    {this.state.error.toString()}
                    <br />
                    {this.state.errorInfo.componentStack}
                  </div>
                </details>
              )}
              
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Rafraîchir la page
                </button>
                <button
                  onClick={() => window.history.back()}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Retour
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;