import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AIVisualizer from './components/AIVisualizer'

function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    document.body.style.overflow = 'auto'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Tsquare</h1>
        </div>
      </header>

      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
            Transform Your Design
          </h2>
          <p className="mt-4 text-xl text-white">
            I am banner
          </p>
          <button
            onClick={handleOpenDrawer}
            className="mt-8 px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition-colors duration-200"
          >
            Start Your Design Journey
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-900">
            Welcome to Our Platform
          </h3>
          <p className="mt-4 text-lg text-gray-600">
            I am main content
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center">© 2025 Tsquare. All rights reserved.</p>
        </div>
      </footer>

      {/* AI Visualizer Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <AIVisualizer onClose={handleCloseDrawer} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App 