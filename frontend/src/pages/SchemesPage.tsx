/**
 * Schemes Page
 * Browse, search, and filter government schemes with AI recommendations
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Button, Card, CardHeader, CardTitle, CardDescription, CardContent,
  Input, Select, Badge, Skeleton, Alert, AlertDescription, Spinner
} from '@/components/ui'
import { useSchemes, useCategories, useSchemeRecommendations } from '@/hooks/useApi'
import { getErrorMessage } from '@/services'
import type { SchemeRecommendRequest } from '@/types'
import { Search, FileText, ExternalLink, Sparkles, Filter, X } from 'lucide-react'

interface SearchFormData {
  search: string
  category: string
}

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

export default function SchemesPage() {
  const [searchParams, setSearchParams] = useState({ search: '', category: '' })
  const [showRecommend, setShowRecommend] = useState(false)
  const [aiResult, setAiResult] = useState<string | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)

  const { data, isLoading, isError } = useSchemes({
    search: searchParams.search || undefined,
    category: searchParams.category || undefined,
  })

  const { data: categories } = useCategories()

  const recommendations = useSchemeRecommendations()

  const { register: registerSearch, handleSubmit: handleSearchSubmit, reset: resetSearch } =
    useForm<SearchFormData>()

  const { register: registerRecommend, handleSubmit: handleRecommendSubmit } =
    useForm<SchemeRecommendRequest>()

  const schemes = data?.schemes ?? []
  const total = data?.total ?? 0

  function onSearch(formData: SearchFormData) {
    setSearchParams({ search: formData.search, category: formData.category })
  }

  function clearSearch() {
    resetSearch()
    setSearchParams({ search: '', category: '' })
  }

  async function onRecommend(formData: SchemeRecommendRequest) {
    setAiError(null)
    setAiResult(null)
    try {
      const result = await recommendations.mutateAsync(formData)
      setAiResult(result.ai_explanation)
    } catch (err) {
      setAiError(getErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Government Schemes</h1>
          <p className="text-muted-foreground">Discover schemes you may be eligible for</p>
        </div>
        <Button onClick={() => setShowRecommend(!showRecommend)} variant="outline">
          <Sparkles className="h-4 w-4 mr-2" />
          AI Recommendations
        </Button>
      </div>

      {/* AI Recommendations Panel */}
      {showRecommend && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Get Personalised AI Recommendations
            </CardTitle>
            <CardDescription>Fill in your profile to get schemes tailored to you</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRecommendSubmit(onRecommend)} className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Age</label>
                <Input type="number" placeholder="25" {...registerRecommend('age', { valueAsNumber: true, required: true, min: 1 })} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Gender</label>
                <Select {...registerRecommend('gender', { required: true })}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">State</label>
                <Input placeholder="Maharashtra" {...registerRecommend('state', { required: true })} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Occupation</label>
                <Input placeholder="Farmer / Student / etc." {...registerRecommend('occupation', { required: true })} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Income Bracket</label>
                <Select {...registerRecommend('income_bracket', { required: true })}>
                  <option value="">Select</option>
                  <option value="below_1_lakh">Below ₹1 Lakh</option>
                  <option value="1_3_lakh">₹1–3 Lakh</option>
                  <option value="3_6_lakh">₹3–6 Lakh</option>
                  <option value="6_12_lakh">₹6–12 Lakh</option>
                  <option value="above_12_lakh">Above ₹12 Lakh</option>
                </Select>
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full" disabled={recommendations.isPending}>
                  {recommendations.isPending ? <Spinner size="sm" className="mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Get Recommendations
                </Button>
              </div>
            </form>

            {aiError && (
              <Alert variant="destructive" className="mt-3">
                <AlertDescription>{aiError}</AlertDescription>
              </Alert>
            )}

            {aiResult && (
              <div className="mt-4 p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap leading-relaxed">
                <p className="font-semibold text-primary mb-2">AI Recommendation:</p>
                {aiResult}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search & Filter */}
      <form onSubmit={handleSearchSubmit(onSearch)}>
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search schemes by name or keyword..."
              {...registerSearch('search')}
            />
          </div>
          <Select className="w-48" {...registerSearch('category')}>
            <option value="">All Categories</option>
            {(categories ?? []).map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat] ?? cat}
              </option>
            ))}
          </Select>
          <Button type="submit">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          {(searchParams.search || searchParams.category) && (
            <Button type="button" variant="outline" onClick={clearSearch}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </form>

      {/* Results count */}
      {!isLoading && (
        <p className="text-sm text-muted-foreground">
          Showing {schemes.length} of {total} schemes
          {searchParams.search && <> matching "<strong>{searchParams.search}</strong>"</>}
          {searchParams.category && <> in <strong>{CATEGORY_LABELS[searchParams.category] ?? searchParams.category}</strong></>}
        </p>
      )}

      {/* Schemes Grid */}
      {isError ? (
        <Alert variant="destructive">
          <AlertDescription>Failed to load schemes. Please try again.</AlertDescription>
        </Alert>
      ) : isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : schemes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No schemes found. Try a different search.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schemes.map((scheme) => (
            <Card key={scheme.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardHeader className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {CATEGORY_LABELS[scheme.category] ?? scheme.category}
                  </Badge>
                  {scheme.is_central && (
                    <Badge variant="outline" className="text-xs shrink-0">Central</Badge>
                  )}
                </div>
                <CardTitle className="text-base leading-snug">{scheme.name}</CardTitle>
                <CardDescription className="text-sm line-clamp-2">{scheme.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex gap-2">
                <Link to={`/schemes/${scheme.id}`} className="flex-1">
                  <Button variant="default" size="sm" className="w-full">
                    View Details
                  </Button>
                </Link>
                {scheme.official_website && (
                  <a href={scheme.official_website} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
