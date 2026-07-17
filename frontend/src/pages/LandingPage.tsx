/**
 * Landing Page
 * Public homepage with hero section and features
 */

import { Link } from 'react-router-dom'
import { Button, Card, CardHeader, CardTitle, CardDescription, Badge } from '@/components/ui'
import { 
  Sparkles, 
  FileText, 
  Heart, 
  Sprout, 
  Briefcase, 
  Shield,
  Users,
  Zap
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🇮🇳</span>
            <span className="font-bold text-xl">BharatSathi AI</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/about">
              <Button variant="ghost">About</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge variant="secondary" className="mb-6">
          🚀 Powered by Google Gemini AI
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
          Your AI-Powered Guide to
          <br />
          <span className="text-primary">India's Resources</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          BharatSathi AI helps Indian citizens access government schemes, 
          healthcare guidance, agriculture support, and career development 
          through intelligent AI assistance.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/register">
            <Button size="lg">
              Start Free <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/about">
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need in One Platform
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Government Schemes</CardTitle>
              <CardDescription>
                Discover and apply for 8+ major government schemes. 
                Get AI-powered eligibility recommendations.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Heart className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Healthcare Guidance</CardTitle>
              <CardDescription>
                AI symptom checker, health Q&A, and instant access 
                to emergency contacts and health schemes.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Sprout className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Agriculture Support</CardTitle>
              <CardDescription>
                Get crop advice, pest identification, fertilizer 
                recommendations, and farming best practices.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Briefcase className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Career Guidance</CardTitle>
              <CardDescription>
                Resume review with scoring, skill gap analysis, 
                interview preparation, and career roadmaps.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Sparkles className="h-10 w-10 text-primary mb-4" />
              <CardTitle>AI Chat Assistant</CardTitle>
              <CardDescription>
                Have natural conversations with our AI assistant. 
                Context-aware responses in multiple languages.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                Your data is encrypted and secure. JWT authentication 
                ensures your privacy is protected.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-border bg-muted/50">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-muted-foreground">Citizens Helped</div>
            </div>
            <div>
              <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
              <div className="text-4xl font-bold mb-2">29</div>
              <div className="text-muted-foreground">AI-Powered APIs</div>
            </div>
            <div>
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-muted-foreground">Secure & Private</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of Indian citizens who are already benefiting 
          from AI-powered guidance and support.
        </p>
        <Link to="/register">
          <Button size="lg">
            Create Free Account <Sparkles className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 BharatSathi AI. Made with ❤️ for India.</p>
            <div className="mt-2">
              <Link to="/about" className="hover:text-foreground transition-colors">
                About
              </Link>
              <span className="mx-2">•</span>
              <a href="https://github.com" className="hover:text-foreground transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
