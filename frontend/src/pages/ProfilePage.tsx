/**
 * ProfilePage — Production-grade profile module
 * Sections: Header · Stats · Personal Info · Preferences · Activity · Achievements · Security · Data & Privacy
 */

import { useState, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import {
  Button, Card, CardHeader, CardTitle, CardDescription, CardContent,
  Input, Label, Alert, AlertDescription, Spinner, Avatar, AvatarImage,
  AvatarFallback, Badge, Skeleton,
} from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { getErrorMessage } from '@/services'
import {
  useProfile, useProfileStats, useProfileActivity,
  useUpdateProfile, useUpdatePreferences, useUploadAvatar,
  useChangePassword, useLogoutAll, useDeleteAccount,
} from '@/hooks/useApi'
import type { ProfileUpdateRequest, PreferencesUpdateRequest } from '@/types'
import {
  User, Lock, Shield, Download, Trash2, LogOut, Camera, CheckCircle,
  AlertCircle, MessageSquare, Heart, Sprout, Briefcase, FileText,
  Star, Award, Target, Zap, TrendingUp, Calendar, Clock, Globe,
  Bell, Moon, Sun, Monitor, Mic, Save, Settings, Activity,
  ChevronRight, Edit3, Phone, MapPin, Briefcase as BriefcaseIcon,
} from 'lucide-react'

// ─── Schemas ────────────────────────────────────────────────────────────────

const personalSchema = z.object({
  full_name: z.string().min(2, 'Minimum 2 characters').max(100),
  phone: z.string().max(20).optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say', '']).optional(),
  date_of_birth: z.string().optional().or(z.literal('')),
  state: z.string().max(100).optional().or(z.literal('')),
  district: z.string().max(100).optional().or(z.literal('')),
  occupation: z.string().max(100).optional().or(z.literal('')),
  language: z.string().max(10).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  bio: z.string().max(500).optional().or(z.literal('')),
})

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Required'),
  new_password: z.string().min(6, 'Minimum 6 characters'),
  confirm_password: z.string().min(1, 'Required'),
}).refine(d => d.new_password === d.confirm_password, {
  message: "Passwords don't match", path: ['confirm_password'],
})

type PersonalFormData = z.infer<typeof personalSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

// ─── Constants ───────────────────────────────────────────────────────────────

const TABS = [
  { id: 'personal',     label: 'Personal Info',   icon: User },
  { id: 'preferences',  label: 'AI Preferences',  icon: Settings },
  { id: 'activity',     label: 'AI Activity',      icon: Activity },
  { id: 'achievements', label: 'Achievements',     icon: Award },
  { id: 'security',     label: 'Security',         icon: Shield },
  { id: 'privacy',      label: 'Data & Privacy',   icon: Download },
] as const

type TabId = typeof TABS[number]['id']

const LANGUAGES = [
  { value: 'en', label: 'English' }, { value: 'hi', label: 'हिन्दी' },
  { value: 'bn', label: 'বাংলা' },  { value: 'te', label: 'తెలుగు' },
  { value: 'mr', label: 'मराठी' },  { value: 'ta', label: 'தமிழ்' },
  { value: 'gu', label: 'ગુજરાતી' }, { value: 'kn', label: 'ಕನ್ನಡ' },
  { value: 'ml', label: 'മലയാളം' }, { value: 'pa', label: 'ਪੰਜਾਬੀ' },
]

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
]

const ACHIEVEMENTS = [
  { id: 'explorer',  title: 'AI Explorer',          icon: Zap,       desc: 'Start 5 AI chats',        key: 'total_chats',        threshold: 5  },
  { id: 'health',    title: 'Healthcare Helper',     icon: Heart,     desc: '3 healthcare queries',     key: 'healthcare_queries', threshold: 3  },
  { id: 'farmer',    title: 'Smart Farmer',          icon: Sprout,    desc: '3 agriculture queries',    key: 'agriculture_queries',threshold: 3  },
  { id: 'career',    title: 'Career Builder',        icon: TrendingUp,desc: '3 career sessions',        key: 'career_sessions',    threshold: 3  },
  { id: 'schemes',   title: 'Scheme Expert',         icon: FileText,  desc: '5 scheme searches',        key: 'scheme_searches',    threshold: 5  },
  { id: 'pro',       title: 'Power User',            icon: Star,      desc: '20 total AI interactions', key: 'total_chats',        threshold: 20 },
]

// ─── Small helpers ───────────────────────────────────────────────────────────

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <Alert variant={type === 'error' ? 'destructive' : 'default'}
           className={type === 'success' ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : ''}>
      {type === 'success'
        ? <CheckCircle className="h-4 w-4 text-green-600" />
        : <AlertCircle className="h-4 w-4" />}
      <AlertDescription className={type === 'success' ? 'text-green-700 dark:text-green-400' : ''}>
        {message}
      </AlertDescription>
    </Alert>
  )
}

function StatCard({ title, value, icon: Icon, color }: {
  title: string; value: number | string; icon: React.ComponentType<{className?:string}>; color: string
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className={`absolute top-0 right-0 w-20 h-20 rounded-full -mr-6 -mt-6 opacity-10 ${color}`} />
        <div className={`inline-flex p-2 rounded-lg ${color} bg-opacity-10 mb-2`}>
          <Icon className="h-5 w-5 text-foreground" />
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{title}</p>
      </CardContent>
    </Card>
  )
}

function ActivityRow({ item, icon: Icon, color }: {
  item: { id: string; title: string; category: string; date: string; detail?: string }
  icon: React.ComponentType<{className?:string}>
  color: string
}) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border last:border-0">
      <div className={`p-2 rounded-lg ${color} shrink-0`}>
        <Icon className="h-3.5 w-3.5 text-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.title}</p>
        {item.detail && <p className="text-xs text-muted-foreground">{item.detail}</p>}
      </div>
      <span className="text-xs text-muted-foreground shrink-0">
        {item.date ? new Date(item.date).toLocaleDateString('en-IN', {day:'numeric',month:'short'}) : '—'}
      </span>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, refreshUser, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>('personal')
  const [feedback, setFeedback] = useState<{ msg: string; type: 'success'|'error' } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Queries
  const { data: profile, isLoading: profileLoading } = useProfile()
  const { data: stats, isLoading: statsLoading } = useProfileStats()
  const { data: activity, isLoading: activityLoading } = useProfileActivity()

  // Mutations
  const updateProfile = useUpdateProfile()
  const updatePrefs   = useUpdatePreferences()
  const uploadAvatar  = useUploadAvatar()
  const changePwd     = useChangePassword()
  const logoutAll     = useLogoutAll()
  const deleteAccount = useDeleteAccount()

  // Personal Info form
  const pForm = useForm<PersonalFormData>({
    resolver: zodResolver(personalSchema),
    values: profile ? {
      full_name:    profile.full_name ?? '',
      phone:        profile.phone ?? '',
      gender:       (profile.gender ?? '') as PersonalFormData['gender'],
      date_of_birth:profile.date_of_birth ?? '',
      state:        profile.state ?? '',
      district:     profile.district ?? '',
      occupation:   profile.occupation ?? '',
      language:     profile.language ?? 'en',
      address:      profile.address ?? '',
      bio:          profile.bio ?? '',
    } : undefined,
  })

  // Password form
  const pwdForm = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) })

  // Preference state (local, saved on change)
  const [prefs, setPrefs] = useState<PreferencesUpdateRequest>({})

  const showFeedback = useCallback((msg: string, type: 'success'|'error') => {
    setFeedback({ msg, type })
    setTimeout(() => setFeedback(null), 4000)
  }, [])

  // ─── Handlers ─────────────────────────────────────────────────────────────

  async function onPersonalSubmit(data: PersonalFormData) {
    try {
      const payload: ProfileUpdateRequest = {}
      if (data.full_name)    payload.full_name    = data.full_name
      if (data.phone)        payload.phone        = data.phone
      if (data.gender)       payload.gender       = data.gender
      if (data.date_of_birth)payload.date_of_birth= data.date_of_birth
      if (data.state)        payload.state        = data.state
      if (data.district)     payload.district     = data.district
      if (data.occupation)   payload.occupation   = data.occupation
      if (data.language)     payload.language     = data.language
      if (data.address)      payload.address      = data.address
      if (data.bio)          payload.bio          = data.bio
      await updateProfile.mutateAsync(payload)
      await refreshUser()
      showFeedback('Profile updated successfully!', 'success')
    } catch (err) { showFeedback(getErrorMessage(err), 'error') }
  }

  async function onPreferencesSave(field: string, value: unknown) {
    try {
      await updatePrefs.mutateAsync({ [field]: value } as PreferencesUpdateRequest)
      showFeedback('Preference saved', 'success')
    } catch (err) { showFeedback(getErrorMessage(err), 'error') }
  }

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await uploadAvatar.mutateAsync(file)
      showFeedback('Profile photo updated!', 'success')
    } catch (err) { showFeedback(getErrorMessage(err), 'error') }
  }

  async function onPasswordSubmit(data: PasswordFormData) {
    try {
      await changePwd.mutateAsync({ current_password: data.current_password, new_password: data.new_password })
      pwdForm.reset()
      showFeedback('Password changed successfully!', 'success')
    } catch (err) { showFeedback(getErrorMessage(err), 'error') }
  }

  async function onLogoutAll() {
    try {
      await logoutAll.mutateAsync()
      showFeedback('All sessions logged out. Redirecting...', 'success')
      setTimeout(() => { localStorage.removeItem('token'); localStorage.removeItem('user'); logout() }, 1500)
    } catch (err) { showFeedback(getErrorMessage(err), 'error') }
  }

  async function onDeleteAccount() {
    if (!window.confirm('Are you sure? This will deactivate your account. This action cannot be easily undone.')) return
    try {
      await deleteAccount.mutateAsync()
      showFeedback('Account deactivated. Logging out...', 'success')
      setTimeout(() => logout(), 2000)
    } catch (err) { showFeedback(getErrorMessage(err), 'error') }
  }

  // ─── Computed ─────────────────────────────────────────────────────────────

  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) ?? '?'
  const completion = profile?.profile_completion ?? 0

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">

      {/* Global feedback toast */}
      {feedback && (
        <div className="fixed top-20 right-4 z-50 w-80 animate-in slide-in-from-right">
          <Toast message={feedback.msg} type={feedback.type} />
        </div>
      )}

      {/* ── PROFILE HEADER ─────────────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        {/* Cover gradient */}
        <div className="h-28 bg-gradient-to-br from-primary/80 via-primary/50 to-primary/20" />

        <CardContent className="relative px-6 pb-6">
          {/* Avatar row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12">
            <div className="relative inline-block">
              {profileLoading ? (
                <Skeleton className="h-24 w-24 rounded-full" />
              ) : (
                <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg">
                  {profile?.profile_image && <AvatarImage src={profile.profile_image} alt={profile.full_name} />}
                  <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadAvatar.isPending}
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-background border-2 border-border shadow hover:bg-accent transition-colors"
                title="Change photo"
              >
                {uploadAvatar.isPending ? <Spinner size="sm" /> : <Camera className="h-4 w-4" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                className="hidden" onChange={onAvatarChange} />
            </div>
            <Button variant="outline" size="sm" onClick={() => setActiveTab('personal')}>
              <Edit3 className="h-4 w-4 mr-2" />Edit Profile
            </Button>
          </div>

          {/* Name & badges */}
          <div className="mt-3 space-y-1">
            {profileLoading ? (
              <><Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-32 mt-1" /></>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold">{profile?.full_name ?? user?.full_name}</h1>
                  {profile?.is_active && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircle className="h-3 w-3 mr-1" />Verified
                    </Badge>
                  )}
                  <Badge variant="outline" className="capitalize">{profile?.role ?? 'user'}</Badge>
                </div>
                <p className="text-muted-foreground text-sm">{profile?.email ?? user?.email}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                  {profile?.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{profile.phone}</span>}
                  {profile?.state && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{profile.state}{profile.district ? `, ${profile.district}` : ''}</span>}
                  {profile?.occupation && <span className="flex items-center gap-1"><BriefcaseIcon className="h-3 w-3" />{profile.occupation}</span>}
                  {profile?.language && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{LANGUAGES.find(l=>l.value===profile.language)?.label ?? profile.language}</span>}
                  {profile?.created_at && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Joined {new Date(profile.created_at).toLocaleDateString('en-IN',{month:'short',year:'numeric'})}</span>}
                  {profile?.last_login && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Last login {new Date(profile.last_login).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>}
                </div>
                {profile?.bio && <p className="text-sm mt-2 text-foreground/80 max-w-2xl">{profile.bio}</p>}
              </>
            )}
          </div>

          {/* Profile completion bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-muted-foreground">Profile Completion</span>
              <span className="text-xs font-semibold text-primary">{completion}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  completion >= 80 ? 'bg-green-500' : completion >= 50 ? 'bg-primary' : 'bg-orange-400'
                }`}
                style={{ width: `${completion}%` }}
              />
            </div>
            {completion < 100 && (
              <p className="text-xs text-muted-foreground mt-1">
                {completion < 50 ? 'Add more info to help BharatSathi AI personalize your experience.' :
                 completion < 80 ? 'Almost there! A few more fields to complete your profile.' :
                 'Great profile! Just a couple more fields to reach 100%.'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── QUICK STATS ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statsLoading ? (
          Array.from({length:8}).map((_,i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : stats ? (
          <>
            <StatCard title="AI Chats" value={stats.total_chats} icon={MessageSquare} color="bg-blue-500" />
            <StatCard title="Healthcare Queries" value={stats.healthcare_queries} icon={Heart} color="bg-red-500" />
            <StatCard title="Agriculture Queries" value={stats.agriculture_queries} icon={Sprout} color="bg-green-500" />
            <StatCard title="Career Sessions" value={stats.career_sessions} icon={Briefcase} color="bg-purple-500" />
            <StatCard title="Scheme Searches" value={stats.scheme_searches} icon={FileText} color="bg-orange-500" />
            <StatCard title="Account Age (days)" value={stats.account_age_days} icon={Calendar} color="bg-teal-500" />
            <StatCard title="Last Active"
              value={stats.last_active ? new Date(stats.last_active).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : '—'}
              icon={Clock} color="bg-yellow-500" />
            <StatCard title="Profile Complete" value={`${completion}%`} icon={Target} color="bg-indigo-500" />
          </>
        ) : null}
      </div>

      {/* ── TABS ───────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar border-b border-border">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                ${activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}>
              <Icon className="h-4 w-4" />{tab.label}
            </button>
          )
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB: PERSONAL INFO                                                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'personal' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Personal Information</CardTitle>
            <CardDescription>Update your profile details. All changes are saved to MongoDB.</CardDescription>
          </CardHeader>
          <CardContent>
            {profileLoading ? (
              <div className="space-y-4">{Array.from({length:6}).map((_,i)=><Skeleton key={i} className="h-10 w-full"/>)}</div>
            ) : (
              <form onSubmit={pForm.handleSubmit(onPersonalSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input id="full_name" className="mt-1" {...pForm.register('full_name')} />
                    {pForm.formState.errors.full_name && (
                      <p className="text-xs text-destructive mt-1">{pForm.formState.errors.full_name.message}</p>
                    )}
                  </div>
                  {/* Email (read-only) */}
                  <div className="sm:col-span-2">
                    <Label>Email</Label>
                    <Input className="mt-1" value={profile?.email ?? ''} disabled />
                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                  </div>
                  {/* Phone */}
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+91 98765 43210" className="mt-1" {...pForm.register('phone')} />
                  </div>
                  {/* Gender */}
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <select id="gender" className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                      {...pForm.register('gender')}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                  {/* Date of birth */}
                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input id="date_of_birth" type="date" className="mt-1" {...pForm.register('date_of_birth')} />
                  </div>
                  {/* Language */}
                  <div>
                    <Label htmlFor="language">Preferred Language</Label>
                    <select id="language" className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                      {...pForm.register('language')}>
                      {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  </div>
                  {/* State */}
                  <div>
                    <Label htmlFor="state">State</Label>
                    <select id="state" className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                      {...pForm.register('state')}>
                      <option value="">Select State</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  {/* District */}
                  <div>
                    <Label htmlFor="district">District</Label>
                    <Input id="district" placeholder="Your district" className="mt-1" {...pForm.register('district')} />
                  </div>
                  {/* Occupation */}
                  <div>
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input id="occupation" placeholder="Farmer / Student / Engineer..." className="mt-1" {...pForm.register('occupation')} />
                  </div>
                  {/* Address */}
                  <div className="sm:col-span-2">
                    <Label htmlFor="address">Address (optional)</Label>
                    <Input id="address" placeholder="Village, Taluk, PIN..." className="mt-1" {...pForm.register('address')} />
                  </div>
                  {/* Bio */}
                  <div className="sm:col-span-2">
                    <Label htmlFor="bio">Bio (optional)</Label>
                    <textarea id="bio" rows={3} placeholder="Tell us a bit about yourself..."
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                      {...pForm.register('bio')} />
                    {pForm.formState.errors.bio && (
                      <p className="text-xs text-destructive mt-1">{pForm.formState.errors.bio.message}</p>
                    )}
                  </div>
                </div>
                <Button type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? <><Spinner size="sm" className="mr-2"/>Saving...</> : 'Save Changes'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB: AI PREFERENCES                                                 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'preferences' && (
        <div className="space-y-4">
          {/* Language & Style */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4"/>Language & Response</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Default Language</Label>
                  <select defaultValue={profile?.default_language ?? profile?.language ?? 'en'}
                    onChange={e => onPreferencesSave('default_language', e.target.value)}
                    className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                    {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Response Style</Label>
                  <select defaultValue={profile?.response_style ?? 'medium'}
                    onChange={e => onPreferencesSave('response_style', e.target.value)}
                    className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="short">Short — Quick answers</option>
                    <option value="medium">Medium — Balanced</option>
                    <option value="detailed">Detailed — Comprehensive</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Theme */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Monitor className="h-4 w-4"/>Theme</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-3">
                {([['light','Light',Sun],['dark','Dark',Moon],['system','System',Monitor]] as const).map(([val,label,Icon])=>(
                  <button key={val} onClick={() => onPreferencesSave('theme', val)}
                    className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors
                      ${(profile?.theme ?? 'system') === val ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* Toggles */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4"/>Notifications & Features</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {([
                ['notifications_enabled','Push Notifications','Get notified about updates',Bell],
                ['voice_output','Voice Output','AI reads responses aloud',Mic],
                ['auto_save_chats','Auto Save Chats','Conversations saved automatically',Save],
              ] as const).map(([key, label, desc, Icon])=>(
                <div key={key} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                  <button onClick={() => onPreferencesSave(key, !(profile?.[key] ?? true))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      (profile?.[key] ?? true) ? 'bg-primary' : 'bg-muted'}`}>
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      (profile?.[key] ?? true) ? 'translate-x-5' : 'translate-x-0'}`}/>
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB: AI ACTIVITY                                                    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'activity' && (
        <div className="grid sm:grid-cols-2 gap-4">
          {activityLoading ? (
            Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-48 rounded-xl"/>)
          ) : activity ? (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><MessageSquare className="h-4 w-4 text-blue-500"/>Recent AI Chats</CardTitle>
                </CardHeader>
                <CardContent>
                  {activity.chats.length === 0 ? <p className="text-xs text-muted-foreground">No chats yet</p> :
                    activity.chats.map(item => <ActivityRow key={item.id} item={item} icon={MessageSquare} color="bg-blue-100 dark:bg-blue-900/20"/>)}
                  <Link to="/chat" className="block mt-3">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      <ChevronRight className="h-3 w-3 mr-1"/>View All Chats
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Heart className="h-4 w-4 text-red-500"/>Healthcare Queries</CardTitle>
                </CardHeader>
                <CardContent>
                  {activity.healthcare.length === 0 ? <p className="text-xs text-muted-foreground">No queries yet</p> :
                    activity.healthcare.map(item => <ActivityRow key={item.id} item={item} icon={Heart} color="bg-red-100 dark:bg-red-900/20"/>)}
                  <Link to="/healthcare" className="block mt-3">
                    <Button variant="outline" size="sm" className="w-full text-xs"><ChevronRight className="h-3 w-3 mr-1"/>View Healthcare</Button>
                  </Link>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Sprout className="h-4 w-4 text-green-500"/>Agriculture Queries</CardTitle>
                </CardHeader>
                <CardContent>
                  {activity.agriculture.length === 0 ? <p className="text-xs text-muted-foreground">No queries yet</p> :
                    activity.agriculture.map(item => <ActivityRow key={item.id} item={item} icon={Sprout} color="bg-green-100 dark:bg-green-900/20"/>)}
                  <Link to="/agriculture" className="block mt-3">
                    <Button variant="outline" size="sm" className="w-full text-xs"><ChevronRight className="h-3 w-3 mr-1"/>View Agriculture</Button>
                  </Link>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Briefcase className="h-4 w-4 text-purple-500"/>Career Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  {activity.career.length === 0 ? <p className="text-xs text-muted-foreground">No sessions yet</p> :
                    activity.career.map(item => <ActivityRow key={item.id} item={item} icon={Briefcase} color="bg-purple-100 dark:bg-purple-900/20"/>)}
                  <Link to="/career" className="block mt-3">
                    <Button variant="outline" size="sm" className="w-full text-xs"><ChevronRight className="h-3 w-3 mr-1"/>View Career</Button>
                  </Link>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB: ACHIEVEMENTS                                                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'achievements' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACHIEVEMENTS.map(badge => {
            const Icon = badge.icon
            const current = stats
              ? (badge.key === 'total_chats' ? stats.total_chats
               : badge.key === 'healthcare_queries' ? stats.healthcare_queries
               : badge.key === 'agriculture_queries' ? stats.agriculture_queries
               : badge.key === 'career_sessions' ? stats.career_sessions
               : badge.key === 'scheme_searches' ? stats.scheme_searches : 0)
              : 0
            const unlocked = current >= badge.threshold
            const pct = Math.min(100, Math.round((current / badge.threshold) * 100))
            return (
              <Card key={badge.id} className={`transition-all ${unlocked ? 'ring-2 ring-primary/40' : 'opacity-80'}`}>
                <CardContent className="p-5 text-center space-y-3">
                  <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center text-2xl
                    ${unlocked ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted'}`}>
                    <Icon className={`h-7 w-7 ${unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{badge.title}</p>
                    <p className="text-xs text-muted-foreground">{badge.desc}</p>
                  </div>
                  {unlocked ? (
                    <Badge className="bg-primary/10 text-primary border-primary/30">
                      <Star className="h-3 w-3 mr-1"/>Unlocked!
                    </Badge>
                  ) : (
                    <div className="space-y-1">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{width:`${pct}%`}} />
                      </div>
                      <p className="text-xs text-muted-foreground">{current} / {badge.threshold}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB: SECURITY                                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5"/>Change Password</CardTitle>
              <CardDescription>Use a strong password you don't use elsewhere</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={pwdForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
                <div>
                  <Label htmlFor="current_password">Current Password</Label>
                  <Input id="current_password" type="password" className="mt-1" placeholder="••••••••"
                    {...pwdForm.register('current_password')} />
                  {pwdForm.formState.errors.current_password && (
                    <p className="text-xs text-destructive mt-1">{pwdForm.formState.errors.current_password.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="new_password">New Password</Label>
                  <Input id="new_password" type="password" className="mt-1" placeholder="••••••••"
                    {...pwdForm.register('new_password')} />
                  {pwdForm.formState.errors.new_password && (
                    <p className="text-xs text-destructive mt-1">{pwdForm.formState.errors.new_password.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters</p>
                </div>
                <div>
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <Input id="confirm_password" type="password" className="mt-1" placeholder="••••••••"
                    {...pwdForm.register('confirm_password')} />
                  {pwdForm.formState.errors.confirm_password && (
                    <p className="text-xs text-destructive mt-1">{pwdForm.formState.errors.confirm_password.message}</p>
                  )}
                </div>
                <Button type="submit" disabled={changePwd.isPending}>
                  {changePwd.isPending ? <><Spinner size="sm" className="mr-2"/>Updating...</> : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Session Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5"/>Active Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium">Current Session</p>
                  <p className="text-xs text-muted-foreground">JWT — expires in 7 days</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30">Active</Badge>
              </div>
              {profile?.last_login && (
                <p className="text-xs text-muted-foreground">
                  Last login: {new Date(profile.last_login).toLocaleString('en-IN')}
                </p>
              )}
              <Button variant="outline" onClick={onLogoutAll} disabled={logoutAll.isPending}
                className="w-full text-destructive border-destructive/50 hover:bg-destructive/5">
                {logoutAll.isPending ? <><Spinner size="sm" className="mr-2"/>Logging out...</> : <><LogOut className="h-4 w-4 mr-2"/>Logout All Devices</>}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB: DATA & PRIVACY                                                 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'privacy' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Download className="h-5 w-5"/>Your Data</CardTitle>
              <CardDescription>Manage and export your personal data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium">Profile Information</p>
                  <p className="text-xs text-muted-foreground">Name, contact, preferences stored in MongoDB</p>
                </div>
                <Badge variant="secondary">Stored Securely</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium">AI Interactions</p>
                  <p className="text-xs text-muted-foreground">Chat history, healthcare and agriculture queries</p>
                </div>
                <Badge variant="secondary">{
                  (stats?.total_chats ?? 0) + (stats?.healthcare_queries ?? 0) + (stats?.agriculture_queries ?? 0)
                } records</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive"><Trash2 className="h-5 w-5"/>Danger Zone</CardTitle>
              <CardDescription>These actions are permanent. Proceed with caution.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <div>
                  <p className="text-sm font-medium">Deactivate Account</p>
                  <p className="text-xs text-muted-foreground">Your account will be disabled. You can contact support to reactivate.</p>
                </div>
                <Button variant="destructive" size="sm" onClick={onDeleteAccount} disabled={deleteAccount.isPending}>
                  {deleteAccount.isPending ? <Spinner size="sm"/> : 'Deactivate'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  )
}
