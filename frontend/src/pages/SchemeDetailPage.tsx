/**
 * Scheme Detail Page
 * Full details about a government scheme with AI explanation
 */

import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Button, Card, CardHeader, CardTitle, CardContent,
  Badge, Skeleton, Alert, AlertDescription, Spinner
} from '@/components/ui'
import { useScheme, useSchemeExplanation } from '@/hooks/useApi'
import { getErrorMessage } from '@/services'
import {
  ArrowLeft, ExternalLink, CheckCircle, FileText,
  Building2, MapPin, Sparkles, Users, AlertCircle
} from 'lucide-react'

const CATEGORY_LABELS: Record<string, string> = {
  financial_inclusion: 'Financial Inclusion',
  healthcare: 'Healthcare',
  agriculture: 'Agriculture',
  employment: 'Employment',
  women_welfare: 'Women Welfare',
  housing: 'Housing',
  skill_development: 'Skill Development',
  pension: 'Pension',
  education: 'Education',
  social_security: 'Social Security',
}

export default function SchemeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: scheme, isLoading, isError } = useScheme(id!)
  const explanation = useSchemeExplanation()

  const [aiText, setAiText] = useState<string | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)

  async function handleExplain() {
    if (!id) return
    setAiError(null)
    try {
      const result = await explanation.mutateAsync(id)
      setAiText(result.ai_explanation)
    } catch (err) {
      setAiError(getErrorMessage(err))
    }
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <Link to="/schemes">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Schemes
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load scheme details. It may not exist.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    )
  }

  if (!scheme) return null

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back button */}
      <Link to="/schemes">
        <Button variant="ghost" className="-ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Schemes
        </Button>
      </Link>

      {/* Title & Meta */}
      <div>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary" className="capitalize">
            {CATEGORY_LABELS[scheme.category] ?? scheme.category}
          </Badge>
          {scheme.is_central && <Badge variant="outline">Central Government</Badge>}
          {scheme.state && <Badge variant="outline"><MapPin className="h-3 w-3 mr-1" />{scheme.state}</Badge>}
        </div>
        <h1 className="text-3xl font-bold tracking-tight leading-tight">{scheme.name}</h1>
        {scheme.ministry && (
          <p className="text-muted-foreground mt-1 flex items-center gap-1">
            <Building2 className="h-4 w-4" />
            {scheme.ministry}
          </p>
        )}
      </div>

      {/* Description */}
      <Card>
        <CardContent className="pt-6">
          <p className="leading-relaxed">{scheme.description}</p>
        </CardContent>
      </Card>

      {/* AI Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Simplified Explanation
          </CardTitle>
        </CardHeader>
        <CardContent>
          {aiText ? (
            <div className="text-sm whitespace-pre-wrap leading-relaxed">{aiText}</div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Get a simplified explanation of this scheme in plain language.
              </p>
              {aiError && (
                <Alert variant="destructive" className="mb-3">
                  <AlertDescription>{aiError}</AlertDescription>
                </Alert>
              )}
              <Button onClick={handleExplain} disabled={explanation.isPending} variant="outline">
                {explanation.isPending ? (
                  <><Spinner size="sm" className="mr-2" />Generating...</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" />Explain Simply</>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Eligibility */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> Eligibility Criteria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {scheme.eligibility.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" /> Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {scheme.benefits.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="h-4 w-4 rounded-full bg-green-100 text-green-700 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* How to Apply */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" /> How to Apply
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{scheme.how_to_apply}</p>
        </CardContent>
      </Card>

      {/* Documents Required */}
      {scheme.documents_required && scheme.documents_required.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Documents Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {scheme.documents_required.map((doc, i) => (
                <Badge key={i} variant="outline">{doc}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Official Website */}
      {scheme.official_website && (
        <a href={scheme.official_website} target="_blank" rel="noopener noreferrer">
          <Button size="lg" className="w-full md:w-auto">
            <ExternalLink className="h-4 w-4 mr-2" />
            Visit Official Website
          </Button>
        </a>
      )}
    </div>
  )
}
