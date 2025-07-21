import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { statsAPI } from '../lib/api';
import { 
  Users, 
  Star, 
  Globe, 
  Truck,
  Plane,
  Home as HomeIcon,
  TrendingUp,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await statsAPI.get();
      setStats(data);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats ? [
    {
      name: 'Total Plugs',
      value: stats.totalPlugs,
      icon: Users,
      color: 'bg-gray-800',
      change: '+12%',
      changeType: 'increase'
    },
    {
      name: 'Plugs VIP',
      value: stats.vipPlugs,
      icon: Star,
      color: 'bg-yellow-500',
      change: '+2',
      changeType: 'increase'
    },
    {
      name: 'Pays couverts',
      value: stats.countries,
      icon: Globe,
      color: 'bg-green-500',
      change: '+1',
      changeType: 'increase'
    },
    {
      name: 'Plugs inactifs',
      value: stats.inactivePlugs,
      icon: Activity,
      color: 'bg-red-500',
      change: '-3',
      changeType: 'decrease'
    }
  ] : [];

  const serviceStats = stats ? [
    {
      name: 'Livraison',
      value: stats.services.delivery,
      icon: Truck,
      color: 'text-white bg-gray-800'
    },
    {
      name: 'Envoi postal',
      value: stats.services.postal,
      icon: Plane,
      color: 'text-green-600 bg-green-100'
    },
    {
      name: 'Meetup',
      value: stats.services.meetup,
      icon: HomeIcon,
      color: 'text-purple-600 bg-purple-100'
    }
  ] : [];

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Aperçu général de votre bot Telegram
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={loadStats}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Activity className="h-4 w-4 mr-2" />
              Actualiser
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-md ${stat.color}`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <TrendingUp className={`self-center flex-shrink-0 h-4 w-4 ${
                            stat.changeType === 'increase' ? '' : 'transform rotate-180'
                          }`} />
                          <span className="ml-1">{stat.change}</span>
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Services breakdown */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Répartition des services
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {serviceStats.map((service) => (
                <div key={service.name} className="text-center">
                  <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center ${service.color}`}>
                    <service.icon className="h-8 w-8" />
                  </div>
                  <div className="mt-4">
                    <div className="text-2xl font-semibold text-gray-900">
                      {service.value}
                    </div>
                    <div className="text-sm text-gray-500">
                      {service.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Actions rapides
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <a
                href="/plugs/new"
                className="group relative bg-gray-800 p-6 rounded-lg text-white hover:bg-gray-700 transition-colors"
              >
                <div>
                  <Users className="h-8 w-8 mb-3" />
                  <h4 className="text-lg font-medium">Nouveau Plug</h4>
                  <p className="text-sm text-primary-100">
                    Ajouter un nouveau plug
                  </p>
                </div>
              </a>
              
              <a
                href="/vip"
                className="group relative bg-yellow-500 p-6 rounded-lg text-white hover:bg-yellow-600 transition-colors"
              >
                <div>
                  <Star className="h-8 w-8 mb-3" />
                  <h4 className="text-lg font-medium">Gérer VIP</h4>
                  <p className="text-sm text-yellow-100">
                    Configuration section VIP
                  </p>
                </div>
              </a>
              
              <a
                href="/config"
                className="group relative bg-gray-600 p-6 rounded-lg text-white hover:bg-gray-700 transition-colors"
              >
                <div>
                  <Activity className="h-8 w-8 mb-3" />
                  <h4 className="text-lg font-medium">Configuration</h4>
                  <p className="text-sm text-gray-100">
                    Paramètres du bot
                  </p>
                </div>
              </a>
              
              <div className="group relative bg-green-600 p-6 rounded-lg text-white">
                <div>
                  <Globe className="h-8 w-8 mb-3" />
                  <h4 className="text-lg font-medium">Bot actif</h4>
                  <p className="text-sm text-green-100">
                    Système opérationnel
                  </p>
                </div>
                <div className="absolute top-2 right-2">
                  <div className="h-3 w-3 bg-green-300 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}