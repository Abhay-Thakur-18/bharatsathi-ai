/**
 * Healthcare Page
 * AI symptom checker, health Q&A, schemes, and emergency numbers
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Button, Card, CardHeader, CardTitle, CardDescription, CardContent,
  Input, Label, Textarea, Select, Badge, Alert, AlertDescription, Spinner
} from '@/components/ui'
import { healthcareService } from '@/services/healthcare.service'
import { getErrorMessage } from '@/services'
import type { SymptomCheckResponse, HealthQueryResponse } from '@/services/healthcare.service'
import { Heart, Phone, Shield, Stethoscope, HelpCircle, AlertCircle, CheckCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

// Symptom check schema
const symptomSchema = z.object({
  symptoms: z.string().min(10, 'Please describe symptoms in at least 10 characters'),
  age: z.coerce.number().min(1).max(150).optional(),
  gender: z.string().optional(),
  medical_history: z.string().optional(),
})

// Health ask schema
const healthAskSchema = z.object({
  question: z.string().min(5, 'Please enter a health question (min 5 characters)'),
})

type SymptomFormData = z.infer<typeof symptomSchema>
type HealthAskFormData = z.infer<typeof healthAskSchema>

type Tab = 'symptom' | 'ask' | 'schemes' | 'emergency'

export default function HealthcarePage() {
  const [activeTab, setActiveTab] = useState<Tab>('symptom')
  const [symptomResult, setSymptomResult] = useState<SymptomCheckResponse | null>(null)
  const [symptomError, setSymptomError] = useState<string | null>(null)
  const [isCheckingSymptoms, setIsCheckingSymptoms] = useState(false)

  const [healthResult, setHealthResult] = useState<HealthQueryResponse | null>(null)
  const [healthError, setHealthError] = useState<string | null>(null)
  const [isAskingHealth, setIsAskingHealth] = useState(false)

  const symptomForm = useForm<SymptomFormData>({ resolver: zodResolver(symptomSchema) })
  const healthAskForm = useForm<HealthAskFormData>({ resolver: zodResolver(healthAskSchema) })

  // Static data queries
  const { data: schemesData } = useQuery({
    queryKey: ['health-govt-schemes'],
    queryFn: () => healthcareService.getGovernmentHealthSchemes(),
  })

  const { data: emergencyData } = useQuery({
    queryKey: ['emergency-numbers'],
    queryFn: () => healthcareService.getEmergencyNumbers(),
  })

  async function onSymptomCheck(data: SymptomFormData) {
    setSymptomError(null)
    setSymptomResult(null)
    setIsCheckingSymptoms(true)
    try {
      const result = await healthcareService.checkSymptoms({
        symptoms: data.symptoms,
        age: data.age ?? 0,
        gender: data.gender ?? '',
        medical_history: data.medical_history,
      })
      setSymptomResult(result)
    } catch (err) {
      setSymptomError(getErrorMessage(err))
    } finally {
      setIsCheckingSymptoms(false)
    }
  }

  async function onHealthAsk(data: HealthAskFormData) {
    setHealthError(null)
    setHealthResult(null)
    setIsAskingHealth(true)
    try {
      const result = await healthcareService.askHealthQuestion({ question: data.question })
      setHealthResult(result)
    } catch (err) {
      setHealthError(getErrorMessage(err))
    } finally {
      setIsAskingHealth(false)
    }
  }

  const TABS = [
    { id: 'symptom' as Tab, label: 'Symptom Checker', icon: Stethoscope },
    { id: 'ask' as Tab, label: 'Health Q&A', icon: HelpCircle },
    { id: 'schemes' as Tab, label: 'Health Schemes', icon: Shield },
    { id: 'emergency' as Tab, label: 'Emergency', icon: Phone },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Heart className="h-8 w-8 text-red-500" /> Healthcare
        </h1>
        <p className="text-muted-foreground">AI-powered health guidance and resources</p>
      </div>

      {/* Disclaimer */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          <strong>Medical Disclaimer:</strong> This tool provides general health information only.
          It is NOT a substitute for professional medical advice. In emergencies, call 112 immediately.
        </AlertDescription>
      </Alert>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Symptom Checker */}
      {activeTab === 'symptom' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Symptom Checker</CardTitle>
              <CardDescription>Describe your symptoms for general guidance</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={symptomForm.handleSubmit(onSymptomCheck)} className="space-y-4">
                <div>
                  <Label>Describe your symptoms *</Label>
                  <Textarea
                    placeholder="e.g. I have a headache, fever and body ache since yesterday..."
                    className="mt-1 min-h-[100px]"
                    {...symptomForm.register('symptoms')}
                  />
                  {symptomForm.formState.errors.symptoms && (
                    <p className="text-sm text-destructive mt-1">
                      {symptomForm.formState.errors.symptoms.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Age (optional)</Label>
                    <Input type="number" placeholder="25" className="mt-1" {...symptomForm.register('age')} />
                  </div>
                  <div>
                    <Label>Gender (optional)</Label>
                    <Select className="mt-1" {...symptomForm.register('gender')}>
                      <option value="">Not specified</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Medical History (optional)</Label>
                  <Textarea
                    placeholder="Diabetes, hypertension, allergies..."
                    className="mt-1"
                    {...symptomForm.register('medical_history')}
                  />
                </div>
                <Button type="submit" disabled={isCheckingSymptoms}>
                  {isCheckingSymptoms ? <><Spinner size="sm" className="mr-2" />Analysing...</> : <><Stethoscope className="h-4 w-4 mr-2" />Check Symptoms</>}
                </Button>
              </form>
            </CardContent>
          </Card>

          {symptomError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{symptomError}</AlertDescription>
            </Alert>
          )}

          {symptomResult && (
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Analysis</CardTitle></CardHeader>
                <CardContent><p className="text-sm leading-relaxed">{symptomResult.analysis}</p></CardContent>
              </Card>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle className="text-sm">Possible Conditions</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {symptomResult.possible_conditions.map((c, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <span className="h-2 w-2 rounded-full bg-orange-400 shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-sm">Recommendations</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {symptomResult.recommendations.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
              <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                <CardHeader><CardTitle className="text-sm text-orange-700 dark:text-orange-400">When to See a Doctor</CardTitle></CardHeader>
                <CardContent><p className="text-sm">{symptomResult.when_to_see_doctor}</p></CardContent>
              </Card>
              <p className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">{symptomResult.disclaimer}</p>
            </div>
          )}
        </div>
      )}

      {/* Health Q&A */}
      {activeTab === 'ask' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ask a Health Question</CardTitle>
              <CardDescription>Get evidence-based answers to health queries</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={healthAskForm.handleSubmit(onHealthAsk)} className="space-y-4">
                <div>
                  <Label>Your health question *</Label>
                  <Textarea
                    placeholder="e.g. What are the symptoms of dengue? How to prevent malaria?"
                    className="mt-1 min-h-[80px]"
                    {...healthAskForm.register('question')}
                  />
                  {healthAskForm.formState.errors.question && (
                    <p className="text-sm text-destructive mt-1">
                      {healthAskForm.formState.errors.question.message}
                    </p>
                  )}
                </div>
                <Button type="submit" disabled={isAskingHealth}>
                  {isAskingHealth ? <><Spinner size="sm" className="mr-2" />Getting answer...</> : <><HelpCircle className="h-4 w-4 mr-2" />Get Answer</>}
                </Button>
              </form>
            </CardContent>
          </Card>

          {healthError && (
            <Alert variant="destructive">
              <AlertDescription>{healthError}</AlertDescription>
            </Alert>
          )}

          {healthResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Answer</CardTitle>
                {healthResult.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {healthResult.sources.map((s, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{healthResult.answer}</p>
                <p className="text-xs text-muted-foreground mt-4 p-2 bg-muted rounded">{healthResult.disclaimer}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Government Health Schemes */}
      {activeTab === 'schemes' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Major government healthcare schemes for Indian citizens</p>
          <div className="grid md:grid-cols-2 gap-4">
            {(schemesData?.schemes ?? []).map((scheme, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-base">{scheme.name}</CardTitle>
                  <CardDescription>{scheme.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <a href={scheme.website} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      Visit Website
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Numbers */}
      {activeTab === 'emergency' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Important emergency contact numbers in India</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(emergencyData?.emergency_numbers ?? []).map((item, i) => (
              <Card key={i} className={i === 0 ? 'border-red-300 bg-red-50 dark:bg-red-950/20' : ''}>
                <CardContent className="flex items-center gap-3 py-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${i === 0 ? 'bg-red-100 dark:bg-red-900' : 'bg-muted'}`}>
                    <Phone className={`h-5 w-5 ${i === 0 ? 'text-red-600' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-lg leading-none">{item.number}</p>
                    <p className="text-sm text-muted-foreground">{item.service}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
