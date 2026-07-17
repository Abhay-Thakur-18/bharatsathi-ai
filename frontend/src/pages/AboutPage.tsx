/**
 * About Page
 * Information about BharatSathi AI
 */

import { Link } from 'react-router-dom'
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import { Home } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">About Us</Badge>
            <h1 className="text-4xl font-bold mb-4">BharatSathi AI</h1>
            <p className="text-xl text-muted-foreground">
              Empowering Indian Citizens with AI-Powered Guidance
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                BharatSathi AI is designed to democratize access to information and 
                services for Indian citizens. We leverage cutting-edge AI technology 
                to simplify complex government schemes, provide healthcare guidance, 
                support farmers, and help individuals advance their careers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Technology Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Backend</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>FastAPI (Python)</li>
                    <li>MongoDB</li>
                    <li>Google Gemini AI</li>
                    <li>JWT Authentication</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Frontend</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>React 18</li>
                    <li>TypeScript</li>
                    <li>Tailwind CSS</li>
                    <li>Shadcn UI</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>✅ 29 RESTful API endpoints</li>
                <li>✅ 6 major modules (Schemes, Healthcare, Agriculture, Career, Chat)</li>
                <li>✅ AI-powered recommendations and guidance</li>
                <li>✅ Secure JWT authentication</li>
                <li>✅ Production-ready architecture</li>
                <li>✅ Fully responsive design</li>
              </ul>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link to="/register">
              <Button size="lg">Get Started Today</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
