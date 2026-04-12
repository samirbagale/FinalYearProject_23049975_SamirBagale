import { Brain } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                Mind<span className="text-primary-600">Care</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              Your AI-powered companion for mental wellness. Comprehensive support, anytime, anywhere.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end space-y-2">
            <div className="flex items-center space-x-4 mb-2">
              <a href="#" className="text-sm text-gray-400 hover:text-primary-600 transition-colors">Privacy</a>
              <a href="#" className="text-sm text-gray-400 hover:text-primary-600 transition-colors">Terms</a>
              <a href="#" className="text-sm text-gray-400 hover:text-primary-600 transition-colors">Support</a>
            </div>
            <div className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Mind Care. All rights reserved.
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span>Privacy & Confidentiality Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer





