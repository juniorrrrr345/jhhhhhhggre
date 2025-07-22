import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { simpleApi } from '../../lib/api-simple';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const data = await simpleApi.getApplications(token);
      setApplications(data.applications || []);
      setError('');
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes:', error);
      setError('Erreur lors de la récupération des demandes');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (applicationId, action, adminNotes = '') => {
    try {
      setActionLoading(applicationId);
      const token = localStorage.getItem('admin_token');
      await simpleApi.updateApplicationStatus(token, applicationId, action, adminNotes);
      await fetchApplications(); // Recharger la liste
      setSelectedApp(null);
      setError('');
    } catch (error) {
      console.error(`Erreur lors de l'action ${action}:`, error);
      setError(`Erreur lors de l'action ${action}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    const labels = {
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Refusé'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getServicesBadges = (services) => {
    if (!services || services.length === 0) return null;
    const serviceLabels = {
      delivery: 'Livraison',
      postal: 'Postal',
      meetup: 'Meetup'
    };
    return services.map(service => (
      <span key={service} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 mr-1">
        {serviceLabels[service] || service}
      </span>
    ));
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold leading-6 text-gray-900">Demandes d'inscription</h1>
            <p className="mt-2 text-sm text-gray-700">
              Gérez les demandes d'inscription pour devenir plug.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              onClick={fetchApplications}
              className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Actualiser
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        {/* Filtres */}
        <div className="mt-6 flex space-x-4">
          {[
            { key: 'all', label: 'Toutes', count: applications.length },
            { key: 'pending', label: 'En attente', count: applications.filter(a => a.status === 'pending').length },
            { key: 'approved', label: 'Approuvées', count: applications.filter(a => a.status === 'approved').length },
            { key: 'rejected', label: 'Refusées', count: applications.filter(a => a.status === 'rejected').length }
          ].map(filterOption => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filter === filterOption.key
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {filterOption.label} ({filterOption.count})
            </button>
          ))}
        </div>

        {/* Liste des demandes */}
        <div className="mt-6 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localisation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Services
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucune demande trouvée
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{app.plugName}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {app.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {app.userFirstName} {app.userLastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{app.userUsername || app.userId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{app.country}</div>
                      <div className="text-gray-500">{app.city}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap">
                        {getServicesBadges(app.services)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(app.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Voir
                      </button>
                      {app.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAction(app._id, 'approved')}
                            disabled={actionLoading === app._id}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            Approuver
                          </button>
                          <button
                            onClick={() => handleAction(app._id, 'rejected')}
                            disabled={actionLoading === app._id}
                            className="text-red-600 hover:text-red-900"
                          >
                            Refuser
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal de détails */}
        {selectedApp && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Détails de la demande
                  </h3>
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nom du plug</label>
                      <p className="text-sm text-gray-900">{selectedApp.plugName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Statut</label>
                      {getStatusBadge(selectedApp.status)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="text-sm text-gray-900">{selectedApp.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Pays</label>
                      <p className="text-sm text-gray-900">{selectedApp.country}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ville</label>
                      <p className="text-sm text-gray-900">{selectedApp.city}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Services proposés</label>
                    <div className="mt-1">
                      {getServicesBadges(selectedApp.services)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Telegram</label>
                    <p className="text-sm text-gray-900">{selectedApp.telegramContact}</p>
                  </div>

                  {selectedApp.photoUrl && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Photo</label>
                      <img 
                        src={selectedApp.photoUrl} 
                        alt="Photo du plug" 
                        className="mt-1 h-32 w-32 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Utilisateur</label>
                      <p className="text-sm text-gray-900">
                        {selectedApp.userFirstName} {selectedApp.userLastName}
                      </p>
                      <p className="text-sm text-gray-500">@{selectedApp.userUsername || selectedApp.userId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date de demande</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedApp.createdAt)}</p>
                    </div>
                  </div>

                  {selectedApp.adminNotes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes admin</label>
                      <p className="text-sm text-gray-900">{selectedApp.adminNotes}</p>
                    </div>
                  )}

                  {selectedApp.status === 'pending' && (
                    <div className="flex space-x-4 pt-4 border-t">
                      <button
                        onClick={() => handleAction(selectedApp._id, 'approved')}
                        disabled={actionLoading === selectedApp._id}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        {actionLoading === selectedApp._id ? 'Traitement...' : 'Approuver'}
                      </button>
                      <button
                        onClick={() => handleAction(selectedApp._id, 'rejected')}
                        disabled={actionLoading === selectedApp._id}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                      >
                        {actionLoading === selectedApp._id ? 'Traitement...' : 'Refuser'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}