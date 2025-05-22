import { Todo } from './components/Todo'
import { Auth } from './components/Auth'
import { Profile } from './components/Profile'
import { AuthProvider } from './lib/auth-context'
import { Toaster } from "sonner"
import { useAuth } from './lib/auth-context'

import './App.css'

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center sm:text-left">Todo Summary Assistant</h1>
          <Profile />
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {user ? <Todo /> : <Auth />}
      </main>
      <Toaster richColors position="top-right" />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
