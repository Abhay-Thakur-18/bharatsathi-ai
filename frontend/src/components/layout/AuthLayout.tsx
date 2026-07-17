/**
 * Auth Layout Component
 * Used for login and register pages
 */

import { Outlet, Link } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-primary items-center justify-center p-12">
        <div className="max-w-md text-primary-foreground">
          <div className="flex items-center space-x-3 mb-8">
            <span className="text-6xl">🇮🇳</span>
            <div>
              <h1 className="text-4xl font-bold">BharatSathi AI</h1>
              <p className="text-primary-foreground/80">Empowering Citizens</p>
            </div>
          </div>
          <p className="text-lg mb-8 text-primary-foreground/90">
            Your intelligent companion for government schemes, healthcare guidance, 
            agriculture support, and career development.
          </p>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="font-semibold mb-1">AI-Powered Guidance</h3>
                <p className="text-sm text-primary-foreground/80">
                  Get personalized recommendations using Google Gemini AI
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🔒</span>
              <div>
                <h3 className="font-semibold mb-1">Secure & Private</h3>
                <p className="text-sm text-primary-foreground/80">
                  Your data is encrypted and secure with JWT authentication
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🌐</span>
              <div>
                <h3 className="font-semibold mb-1">Multilingual Support</h3>
                <p className="text-sm text-primary-foreground/80">
                  Communicate in your preferred language
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center space-x-2">
              <span className="text-4xl">🇮🇳</span>
              <span className="text-2xl font-bold">BharatSathi AI</span>
            </Link>
          </div>

          {/* Auth Form Content */}
          <Outlet />

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              Back to Home
            </Link>
            <span className="mx-2">•</span>
            <Link to="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
