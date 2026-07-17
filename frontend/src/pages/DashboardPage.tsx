/**
 * Dashboard Page
 * Overview and analytics for the user
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your activity.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>AI Chats</CardTitle>
            <CardDescription>Conversations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Schemes</CardTitle>
            <CardDescription>Explored</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Health</CardTitle>
            <CardDescription>Consultations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Career</CardTitle>
            <CardDescription>Assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Explore BharatSathi AI features</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Dashboard with analytics, charts, and activity feed will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
