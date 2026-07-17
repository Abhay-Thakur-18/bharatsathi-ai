/**
 * Profile Page
 * View and update user profile information
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Button, Card, CardHeader, CardTitle, CardDescription, CardContent,
  Input, Label, Alert, AlertDescription, Spinner, Avatar, AvatarFallback, Badge
} from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { profileService } from '@/services/profile.service'
import { getErrorMessage } from '@/services'
import { User, Lock, CheckCircle, AlertCircle } from 'lucide-react'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
})

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Enter current password'),
  new_password: z.string().min(6, 'New password must be at least 6 characters'),
  confirm_password: z.string().min(1, 'Confirm your new password'),
}).refine(data => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()

  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)

  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: user?.full_name ?? '' },
  })

  const passwordForm = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) })

  async function onProfileUpdate(data: ProfileFormData) {
    setProfileError(null); setProfileSuccess(null); setProfileLoading(true)
    try {
      await profileService.updateProfile(data.full_name)
      await refreshUser()
      setProfileSuccess('Profile updated successfully!')
    } catch (err) {
      setProfileError(getErrorMessage(err))
    } finally {
      setProfileLoading(false)
    }
  }

  async function onPasswordChange(data: PasswordFormData) {
    setPasswordError(null); setPasswordSuccess(null); setPasswordLoading(true)
    try {
      await profileService.changePassword(data.current_password, data.new_password)
      setPasswordSuccess('Password changed successfully!')
      passwordForm.reset()
    } catch (err) {
      setPasswordError(getErrorMessage(err))
    } finally {
      setPasswordLoading(false)
    }
  }

  const initials = user?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?'

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      {/* User Card */}
      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xl font-semibold">{user?.full_name}</p>
            <p className="text-muted-foreground">{user?.email}</p>
            <Badge variant="secondary" className="mt-1">Active Account</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Update Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Update Profile
          </CardTitle>
          <CardDescription>Change your display name</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(onProfileUpdate)} className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                className="mt-1"
                placeholder="Your full name"
                {...profileForm.register('full_name')}
                disabled={profileLoading}
              />
              {profileForm.formState.errors.full_name && (
                <p className="text-sm text-destructive mt-1">{profileForm.formState.errors.full_name.message}</p>
              )}
            </div>
            <div>
              <Label>Email</Label>
              <Input className="mt-1" value={user?.email ?? ''} disabled />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>

            {profileError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{profileError}</AlertDescription>
              </Alert>
            )}
            {profileSuccess && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 dark:text-green-400">{profileSuccess}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={profileLoading}>
              {profileLoading ? <><Spinner size="sm" className="mr-2" />Updating...</> : 'Update Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" /> Change Password
          </CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(onPasswordChange)} className="space-y-4">
            <div>
              <Label htmlFor="current_password">Current Password</Label>
              <Input
                id="current_password"
                type="password"
                className="mt-1"
                placeholder="••••••••"
                {...passwordForm.register('current_password')}
                disabled={passwordLoading}
              />
              {passwordForm.formState.errors.current_password && (
                <p className="text-sm text-destructive mt-1">{passwordForm.formState.errors.current_password.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                type="password"
                className="mt-1"
                placeholder="••••••••"
                {...passwordForm.register('new_password')}
                disabled={passwordLoading}
              />
              {passwordForm.formState.errors.new_password && (
                <p className="text-sm text-destructive mt-1">{passwordForm.formState.errors.new_password.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters</p>
            </div>
            <div>
              <Label htmlFor="confirm_password">Confirm New Password</Label>
              <Input
                id="confirm_password"
                type="password"
                className="mt-1"
                placeholder="••••••••"
                {...passwordForm.register('confirm_password')}
                disabled={passwordLoading}
              />
              {passwordForm.formState.errors.confirm_password && (
                <p className="text-sm text-destructive mt-1">{passwordForm.formState.errors.confirm_password.message}</p>
              )}
            </div>

            {passwordError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}
            {passwordSuccess && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 dark:text-green-400">{passwordSuccess}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={passwordLoading}>
              {passwordLoading ? <><Spinner size="sm" className="mr-2" />Changing...</> : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
