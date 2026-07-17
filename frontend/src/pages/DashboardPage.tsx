/**
 * Dashboard Page
 * Overview with real data from backend
 */

import { Link } from 'react-router-dom'
import {
  Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Skeleton, Badge
} from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { profileService } from '@/services/profile.service'
import { useSchemes } from '@/hooks/useApi'
import {
  MessageSquare, FileText, Heart, Sprout, Briefcase, ArrowRight,
  Sparkles, TrendingUp, Shield
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => profileService.getDashboardStats(),
  })

  const { data: schemesData, isLoading: schemesLoading } = useSchemes({ limit: 3 })
  const schemes = schemesData?.schemes ?? []

  const STAT_CARDS = [
    {
      title: 'AI Conversations',
      value: stats?.conversations ?? 0,
      description: 'Total chats with AI',
      icon: MessageSquare,
      href: '/chat',
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      title: 'Schemes Available',
      value: schemesData?.total ?? '—',
      description: 'Government schemes',
      icon: FileText,
      href: '/schemes',
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-950/30',
    },
    {
      title: 'Health Module',
      value: 'Active',
      description: 'AI symptom checker',
      icon: Heart,
      href: '/healthcare',
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-950/30',
    },
    {
      title: 'Career Tools',
      value: '4',
      description: 'Resume, Skills & More',
      icon: Briefcase,
      href: '/career',
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950/30',
    },
  ]

  const QUICK_ACTIONS = [
    { label: 'Start AI Chat', href: '/chat', icon: Sparkles, description: 'Ask BharatSathi anything' },
    { label: 'Find Schemes', href: '/schemes', icon: FileText, description: 'Discover eligible schemes' },
    { label: 'Check Symptoms', href: '/healthcare', icon: Heart, description: 'AI health guidance' },
    { label: 'Crop Advice', href: '/agriculture', icon: Sprout, description: 'Farming AI assistant' },
    { label: 'Review Resume', href: '/career', icon: TrendingUp, description: 'Score and improve CV' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.full_name?.split(' ')[0] ?? 'User'}! 👋
          </h1>
          <p className="text-muted-foreground">Here's your BharatSathi AI overview</p>
        </div>
        <Badge variant="secondary" className="hidden sm:flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Secure Account
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon
          return (
            <Link key={card.title} to={card.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={`h-10 w-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardHeader>
                <CardContent>
                  {statsLoading && card.title === 'AI Conversations' ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-3xl font-bold">{card.value}</div>
                  )}
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription>Jump straight into a feature</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.href} to={action.href}>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-left group">
                    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                </Link>
              )
            })}
          </CardContent>
        </Card>

        {/* Recent Schemes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Recent Schemes</CardTitle>
                <CardDescription>Latest government schemes</CardDescription>
              </div>
              <Link to="/schemes">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {schemesLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-1" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : schemes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No schemes loaded yet</p>
            ) : (
              schemes.map((scheme) => (
                <Link key={scheme.id} to={`/schemes/${scheme.id}`}>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer group">
                    <div className="h-10 w-10 rounded-md bg-green-50 dark:bg-green-950/30 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{scheme.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {scheme.category.replace('_', ' ')}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modules Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Modules</CardTitle>
          <CardDescription>Everything BharatSathi AI offers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            {[
              { label: 'AI Chat', desc: 'Context-aware conversations', href: '/chat', icon: MessageSquare, color: 'bg-blue-500' },
              { label: 'Schemes', desc: 'Government scheme finder', href: '/schemes', icon: FileText, color: 'bg-green-500' },
              { label: 'Healthcare', desc: 'Symptom checker & health Q&A', href: '/healthcare', icon: Heart, color: 'bg-red-500' },
              { label: 'Agriculture', desc: 'Crop & farming guidance', href: '/agriculture', icon: Sprout, color: 'bg-emerald-600' },
              { label: 'Career', desc: 'Resume review & guidance', href: '/career', icon: Briefcase, color: 'bg-purple-500' },
              { label: 'Settings', desc: 'Preferences & security', href: '/settings', icon: Shield, color: 'bg-gray-500' },
            ].map((mod) => {
              const Icon = mod.icon
              return (
                <Link key={mod.href} to={mod.href}>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent transition-all cursor-pointer group">
                    <div className={`h-8 w-8 rounded-lg ${mod.color} flex items-center justify-center shrink-0`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{mod.label}</p>
                      <p className="text-xs text-muted-foreground">{mod.desc}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
