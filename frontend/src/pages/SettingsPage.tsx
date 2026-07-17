/**
 * Settings Page
 * Application preferences — theme, language, notifications
 */

import { useState, useEffect } from 'react'
import {
  Button, Card, CardHeader, CardTitle, CardDescription, CardContent,
  Label, Select, Alert, AlertDescription
} from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { Sun, Moon, Monitor, Globe, Bell, LogOut, CheckCircle } from 'lucide-react'

type Theme = 'light' | 'dark' | 'system'
type Language = 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'bn'

const LANGUAGES: Record<Language, string> = {
  en: 'English',
  hi: 'हिंदी (Hindi)',
  mr: 'मराठी (Marathi)',
  ta: 'தமிழ் (Tamil)',
  te: 'తెలుగు (Telugu)',
  bn: 'বাংলা (Bengali)',
}

export default function SettingsPage() {
  const { logout } = useAuth()

  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) ?? 'system')
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('language') as Language) ?? 'en')
  const [notifications, setNotifications] = useState(() => localStorage.getItem('notifications') !== 'false')
  const [saved, setSaved] = useState(false)

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      prefersDark ? root.classList.add('dark') : root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  function saveSettings() {
    localStorage.setItem('theme', theme)
    localStorage.setItem('language', language)
    localStorage.setItem('notifications', String(notifications))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const THEME_OPTIONS: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
    { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences</p>
      </div>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" /> Appearance
          </CardTitle>
          <CardDescription>Choose your preferred theme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {THEME_OPTIONS.map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex-1 flex flex-col items-center gap-2 py-3 px-4 rounded-lg border-2 transition-colors ${
                  theme === value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-muted-foreground text-muted-foreground'
                }`}
              >
                {icon}
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" /> Language
          </CardTitle>
          <CardDescription>Select your preferred interface language</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label>Interface Language</Label>
            <Select
              className="mt-1 max-w-xs"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
            >
              {Object.entries(LANGUAGES).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Note: AI responses will be adapted to your language preference when possible.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" /> Notifications
          </CardTitle>
          <CardDescription>Control notification preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Enable Notifications</p>
              <p className="text-xs text-muted-foreground">Receive updates and alerts</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative h-6 w-11 rounded-full transition-colors ${notifications ? 'bg-primary' : 'bg-muted-foreground/30'}`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                  notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Save & Danger Zone */}
      <div className="space-y-4">
        {saved && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700 dark:text-green-400">
              Settings saved successfully!
            </AlertDescription>
          </Alert>
        )}
        <Button onClick={saveSettings}>Save Settings</Button>
      </div>

      {/* Account Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Account Actions</CardTitle>
          <CardDescription>Irreversible or sensitive account operations</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out of All Devices
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
