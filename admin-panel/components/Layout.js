import { useState } from 'react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import {
  HomeIcon,
  CogIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Boutiques/Plugs', href: '/admin/plugs', icon: UserGroupIcon },
  { name: 'Configuration Bot', href: '/admin/config', icon: CogIcon },
  { name: 'Messages', href: '/admin/messages', icon: ChatBubbleLeftRightIcon },
  { name: 'Statistiques', href: '/admin/stats', icon: ChartBarIcon },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Layout({ children, title = 'Admin Panel' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    toast.success('Déconnexion réussie')
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 z-50 flex">
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-gray-800">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            <Sidebar />
          </div>
          <div className="w-14 flex-shrink-0"></div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button
                onClick={handleLogout}
                className="flex items-center gap-x-2 text-sm font-semibold text-gray-900 hover:text-red-600"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )

  function Sidebar() {
    return (
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-800 px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="ml-3 text-xl font-bold text-white">Bot Admin</span>
          </div>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const current = router.pathname === item.href
                  return (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className={classNames(
                          current
                            ? 'bg-gray-700 text-white'
                            : 'text-gray-300 hover:text-white hover:bg-gray-700',
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                        )}
                      >
                        <item.icon className="h-6 w-6 shrink-0" />
                        {item.name}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    )
  }
}