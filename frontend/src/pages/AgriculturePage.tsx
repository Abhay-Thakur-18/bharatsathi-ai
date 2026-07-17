/**
 * Agriculture Page
 * AI-powered crop advice, pest identification, fertilizer recommendations
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Button, Card, CardHeader, CardTitle, CardDescription, CardContent,
  Input, Label, Textarea, Select, Alert, AlertDescription, Spinner
} from '@/components/ui'
import { agricultureService } from '@/services/agriculture.service'
import { getErrorMessage } from '@/services'
import type { CropAdviceResponse, PestDiseaseResponse, FertilizerResponse } from '@/services/agriculture.service'
import { Sprout, Bug, FlaskConical, Phone, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

// Schemas
const cropSchema = z.object({
  crop_name: z.string().min(2, 'Enter crop name (min 2 chars)'),
  soil_type: z.string().optional(),
  state: z.string().optional(),
  season: z.string().optional(),
})

const pestSchema = z.object({
  crop_name: z.string().min(2, 'Enter crop name'),
  symptoms: z.string().min(10, 'Describe symptoms (min 10 chars)'),
})

const fertilizerSchema = z.object({
  crop_name: z.string().min(2, 'Enter crop name'),
  soil_type: z.string().min(2, 'Enter soil type'),
  state: z.string().optional(),
})

type CropFormData = z.infer<typeof cropSchema>
type PestFormData = z.infer<typeof pestSchema>
type FertilizerFormData = z.infer<typeof fertilizerSchema>

type Tab = 'crop' | 'pest' | 'fertilizer' | 'schemes' | 'helplines'

export default function AgriculturePage() {
  const [activeTab, setActiveTab] = useState<Tab>('crop')

  const [cropResult, setCropResult] = useState<CropAdviceResponse | null>(null)
  const [cropLoading, setCropLoading] = useState(false)
  const [cropError, setCropError] = useState<string | null>(null)

  const [pestResult, setPestResult] = useState<PestDiseaseResponse | null>(null)
  const [pestLoading, setPestLoading] = useState(false)
  const [pestError, setPestError] = useState<string | null>(null)

  const [fertResult, setFertResult] = useState<FertilizerResponse | null>(null)
  const [fertLoading, setFertLoading] = useState(false)
  const [fertError, setFertError] = useState<string | null>(null)

  const cropForm = useForm<CropFormData>({ resolver: zodResolver(cropSchema) })
  const pestForm = useForm<PestFormData>({ resolver: zodResolver(pestSchema) })
  const fertForm = useForm<FertilizerFormData>({ resolver: zodResolver(fertilizerSchema) })

  const { data: schemesData } = useQuery({
    queryKey: ['agri-schemes'],
    queryFn: () => agricultureService.getGovernmentSchemes(),
  })

  const { data: helplinesData } = useQuery({
    queryKey: ['agri-helplines'],
    queryFn: () => agricultureService.getHelplines(),
  })

  async function onCropAdvice(data: CropFormData) {
    setCropError(null); setCropResult(null); setCropLoading(true)
    try {
      const result = await agricultureService.getCropAdvice(data)
      setCropResult(result)
    } catch (err) { setCropError(getErrorMessage(err)) }
    finally { setCropLoading(false) }
  }

  async function onPestIdentify(data: PestFormData) {
    setPestError(null); setPestResult(null); setPestLoading(true)
    try {
      const result = await agricultureService.identifyPestDisease(data)
      setPestResult(result)
    } catch (err) { setPestError(getErrorMessage(err)) }
    finally { setPestLoading(false) }
  }

  async function onFertilizer(data: FertilizerFormData) {
    setFertError(null); setFertResult(null); setFertLoading(true)
    try {
      const result = await agricultureService.getFertilizerRecommendation(data)
      setFertResult(result)
    } catch (err) { setFertError(getErrorMessage(err)) }
    finally { setFertLoading(false) }
  }

  const TABS = [
    { id: 'crop' as Tab, label: 'Crop Advice', icon: Sprout },
    { id: 'pest' as Tab, label: 'Pest & Disease', icon: Bug },
    { id: 'fertilizer' as Tab, label: 'Fertilizer', icon: FlaskConical },
    { id: 'schemes' as Tab, label: 'Gov. Schemes', icon: CheckCircle },
    { id: 'helplines' as Tab, label: 'Helplines', icon: Phone },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sprout className="h-8 w-8 text-green-600" /> Agriculture
        </h1>
        <p className="text-muted-foreground">AI-powered farming guidance for Indian farmers</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Crop Advice */}
      {activeTab === 'crop' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crop Cultivation Advice</CardTitle>
              <CardDescription>Get comprehensive advice for growing any crop</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={cropForm.handleSubmit(onCropAdvice)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Crop Name *</Label>
                    <Input className="mt-1" placeholder="e.g. Wheat, Rice, Cotton" {...cropForm.register('crop_name')} />
                    {cropForm.formState.errors.crop_name && (
                      <p className="text-sm text-destructive mt-1">{cropForm.formState.errors.crop_name.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Soil Type</Label>
                    <Select className="mt-1" {...cropForm.register('soil_type')}>
                      <option value="">Not specified</option>
                      <option value="clay">Clay</option>
                      <option value="sandy">Sandy</option>
                      <option value="loamy">Loamy</option>
                      <option value="black_cotton">Black Cotton</option>
                      <option value="red">Red Soil</option>
                      <option value="alluvial">Alluvial</option>
                    </Select>
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input className="mt-1" placeholder="e.g. Punjab, Maharashtra" {...cropForm.register('state')} />
                  </div>
                  <div>
                    <Label>Season</Label>
                    <Select className="mt-1" {...cropForm.register('season')}>
                      <option value="">Not specified</option>
                      <option value="kharif">Kharif (Monsoon)</option>
                      <option value="rabi">Rabi (Winter)</option>
                      <option value="zaid">Zaid (Summer)</option>
                      <option value="year_round">Year Round</option>
                    </Select>
                  </div>
                </div>
                <Button type="submit" disabled={cropLoading}>
                  {cropLoading ? <><Spinner size="sm" className="mr-2" />Getting advice...</> : <><Sprout className="h-4 w-4 mr-2" />Get Crop Advice</>}
                </Button>
              </form>
            </CardContent>
          </Card>

          {cropError && <Alert variant="destructive"><AlertDescription>{cropError}</AlertDescription></Alert>}

          {cropResult && (
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Cultivation Advice for {cropResult.crop_name}</CardTitle></CardHeader>
                <CardContent><p className="text-sm leading-relaxed">{cropResult.advice}</p></CardContent>
              </Card>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle className="text-sm">Best Practices</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {cropResult.best_practices.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />{p}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-sm">Common Issues</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {cropResult.common_issues.map((issue, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <AlertCircle className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />{issue}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
              {cropResult.resources.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-sm">Resources</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {cropResult.resources.map((r, i) => (
                        <li key={i} className="text-sm text-muted-foreground">• {r}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pest & Disease */}
      {activeTab === 'pest' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pest & Disease Identification</CardTitle>
              <CardDescription>Describe the problem and get treatment guidance</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={pestForm.handleSubmit(onPestIdentify)} className="space-y-4">
                <div>
                  <Label>Crop Name *</Label>
                  <Input className="mt-1" placeholder="e.g. Tomato" {...pestForm.register('crop_name')} />
                  {pestForm.formState.errors.crop_name && <p className="text-sm text-destructive mt-1">{pestForm.formState.errors.crop_name.message}</p>}
                </div>
                <div>
                  <Label>Describe symptoms *</Label>
                  <Textarea
                    className="mt-1 min-h-[100px]"
                    placeholder="e.g. Yellow spots on leaves, wilting, white powder on stem..."
                    {...pestForm.register('symptoms')}
                  />
                  {pestForm.formState.errors.symptoms && <p className="text-sm text-destructive mt-1">{pestForm.formState.errors.symptoms.message}</p>}
                </div>
                <Button type="submit" disabled={pestLoading}>
                  {pestLoading ? <><Spinner size="sm" className="mr-2" />Identifying...</> : <><Bug className="h-4 w-4 mr-2" />Identify Problem</>}
                </Button>
              </form>
            </CardContent>
          </Card>

          {pestError && <Alert variant="destructive"><AlertDescription>{pestError}</AlertDescription></Alert>}

          {pestResult && (
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-sm text-orange-600">Possible Issues</CardTitle></CardHeader>
                <CardContent><ul className="space-y-1">{pestResult.possible_issues.map((p, i) => <li key={i} className="text-sm">• {p}</li>)}</ul></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm text-green-600">Solutions</CardTitle></CardHeader>
                <CardContent><ul className="space-y-1">{pestResult.solutions.map((s, i) => <li key={i} className="text-sm">• {s}</li>)}</ul></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm text-blue-600">Prevention</CardTitle></CardHeader>
                <CardContent><ul className="space-y-1">{pestResult.preventive_measures.map((m, i) => <li key={i} className="text-sm">• {m}</li>)}</ul></CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Fertilizer */}
      {activeTab === 'fertilizer' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fertilizer Recommendations</CardTitle>
              <CardDescription>Get NPK ratios and application guidance for your crop</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={fertForm.handleSubmit(onFertilizer)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Crop Name *</Label>
                    <Input className="mt-1" placeholder="e.g. Wheat" {...fertForm.register('crop_name')} />
                    {fertForm.formState.errors.crop_name && <p className="text-sm text-destructive mt-1">{fertForm.formState.errors.crop_name.message}</p>}
                  </div>
                  <div>
                    <Label>Soil Type *</Label>
                    <Select className="mt-1" {...fertForm.register('soil_type')}>
                      <option value="">Select soil type</option>
                      <option value="clay">Clay</option>
                      <option value="sandy">Sandy</option>
                      <option value="loamy">Loamy</option>
                      <option value="black_cotton">Black Cotton</option>
                      <option value="red">Red Soil</option>
                      <option value="alluvial">Alluvial</option>
                    </Select>
                    {fertForm.formState.errors.soil_type && <p className="text-sm text-destructive mt-1">{fertForm.formState.errors.soil_type.message}</p>}
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input className="mt-1" placeholder="Optional" {...fertForm.register('state')} />
                  </div>
                </div>
                <Button type="submit" disabled={fertLoading}>
                  {fertLoading ? <><Spinner size="sm" className="mr-2" />Getting recommendations...</> : <><FlaskConical className="h-4 w-4 mr-2" />Get Recommendations</>}
                </Button>
              </form>
            </CardContent>
          </Card>

          {fertError && <Alert variant="destructive"><AlertDescription>{fertError}</AlertDescription></Alert>}

          {fertResult && (
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Fertilizer Recommendations for {fertResult.crop}</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {fertResult.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <FlaskConical className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                        {r.recommendation}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle className="text-sm">Application Tips</CardTitle></CardHeader>
                  <CardContent><ul className="space-y-1">{fertResult.application_tips.map((t, i) => <li key={i} className="text-sm">• {t}</li>)}</ul></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-sm">Organic Alternatives</CardTitle></CardHeader>
                  <CardContent><ul className="space-y-1">{fertResult.organic_alternatives.map((o, i) => <li key={i} className="text-sm">• {o}</li>)}</ul></CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Government Schemes */}
      {activeTab === 'schemes' && (
        <div className="grid md:grid-cols-2 gap-4">
          {(schemesData?.schemes ?? []).map((s, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-base">{s.name}</CardTitle>
                <CardDescription>{s.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <a href={s.website} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />Visit Website
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Helplines */}
      {activeTab === 'helplines' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(helplinesData?.helplines ?? []).map((h, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-3 py-4">
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-lg leading-none">{h.number}</p>
                  <p className="text-sm text-muted-foreground">{h.service}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
