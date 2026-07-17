/**
 * Career Guidance Page
 * Career advice, resume review, skill assessment, interview prep
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Button, Card, CardHeader, CardTitle, CardDescription, CardContent,
  Input, Label, Textarea, Badge, Alert, AlertDescription, Spinner
} from '@/components/ui'
import { careerService } from '@/services/career.service'
import { getErrorMessage } from '@/services'
import type { CareerAdviceResponse, ResumeReviewResponse, SkillAssessmentResponse, InterviewPrepResponse } from '@/services/career.service'
import { Briefcase, FileText, BarChart2, MessageSquare, ExternalLink, Star, CheckCircle, AlertCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

const careerSchema = z.object({
  target_role: z.string().min(2, 'Enter target role'),
  education: z.string().min(2, 'Enter education'),
  current_role: z.string().optional(),
  experience_years: z.coerce.number().min(0),
  skills: z.string().optional(),
})

const resumeSchema = z.object({
  resume_text: z.string().min(50, 'Paste resume content (min 50 chars)'),
  target_role: z.string().min(2, 'Enter target role'),
  experience_years: z.coerce.number().min(0),
})

const skillSchema = z.object({
  target_role: z.string().min(2, 'Enter target role'),
  current_skills: z.string().min(2, 'Enter at least one skill'),
  experience_years: z.coerce.number().min(0),
})

const interviewSchema = z.object({
  role: z.string().min(2, 'Enter job role'),
  company_type: z.string().optional(),
  experience_level: z.string().optional(),
})

type CareerFormData = z.infer<typeof careerSchema>
type ResumeFormData = z.infer<typeof resumeSchema>
type SkillFormData = z.infer<typeof skillSchema>
type InterviewFormData = z.infer<typeof interviewSchema>

type Tab = 'advice' | 'resume' | 'skills' | 'interview' | 'programs'

export default function CareerPage() {
  const [activeTab, setActiveTab] = useState<Tab>('advice')

  const [careerResult, setCareerResult] = useState<CareerAdviceResponse | null>(null)
  const [careerLoading, setCareerLoading] = useState(false)
  const [careerError, setCareerError] = useState<string | null>(null)

  const [resumeResult, setResumeResult] = useState<ResumeReviewResponse | null>(null)
  const [resumeLoading, setResumeLoading] = useState(false)
  const [resumeError, setResumeError] = useState<string | null>(null)

  const [skillResult, setSkillResult] = useState<SkillAssessmentResponse | null>(null)
  const [skillLoading, setSkillLoading] = useState(false)
  const [skillError, setSkillError] = useState<string | null>(null)

  const [interviewResult, setInterviewResult] = useState<InterviewPrepResponse | null>(null)
  const [interviewLoading, setInterviewLoading] = useState(false)
  const [interviewError, setInterviewError] = useState<string | null>(null)

  const careerForm = useForm<CareerFormData>({ resolver: zodResolver(careerSchema) })
  const resumeForm = useForm<ResumeFormData>({ resolver: zodResolver(resumeSchema) })
  const skillForm = useForm<SkillFormData>({ resolver: zodResolver(skillSchema) })
  const interviewForm = useForm<InterviewFormData>({ resolver: zodResolver(interviewSchema) })

  const { data: programsData } = useQuery({
    queryKey: ['career-programs'],
    queryFn: () => careerService.getGovernmentPrograms(),
  })

  async function onCareerAdvice(data: CareerFormData) {
    setCareerError(null); setCareerResult(null); setCareerLoading(true)
    try {
      const result = await careerService.getCareerAdvice({
        current_role: data.current_role,
        target_role: data.target_role,
        education: data.education,
        experience_years: data.experience_years,
        skills: data.skills ? data.skills.split(',').map(s => s.trim()) : [],
      })
      setCareerResult(result)
    } catch (err) { setCareerError(getErrorMessage(err)) }
    finally { setCareerLoading(false) }
  }

  async function onResumeReview(data: ResumeFormData) {
    setResumeError(null); setResumeResult(null); setResumeLoading(true)
    try {
      const result = await careerService.reviewResume(data)
      setResumeResult(result)
    } catch (err) { setResumeError(getErrorMessage(err)) }
    finally { setResumeLoading(false) }
  }

  async function onSkillAssess(data: SkillFormData) {
    setSkillError(null); setSkillResult(null); setSkillLoading(true)
    try {
      const result = await careerService.assessSkills({
        current_role: '',
        target_role: data.target_role,
        current_skills: data.current_skills.split(',').map(s => s.trim()),
        experience_years: data.experience_years,
      })
      setSkillResult(result)
    } catch (err) { setSkillError(getErrorMessage(err)) }
    finally { setSkillLoading(false) }
  }

  async function onInterviewPrep(data: InterviewFormData) {
    setInterviewError(null); setInterviewResult(null); setInterviewLoading(true)
    try {
      const result = await careerService.getInterviewPrep({
        role: data.role,
        experience_level: data.experience_level ?? '',
        company_type: data.company_type,
      })
      setInterviewResult(result)
    } catch (err) { setInterviewError(getErrorMessage(err)) }
    finally { setInterviewLoading(false) }
  }

  const TABS = [
    { id: 'advice' as Tab, label: 'Career Advice', icon: Briefcase },
    { id: 'resume' as Tab, label: 'Resume Review', icon: FileText },
    { id: 'skills' as Tab, label: 'Skill Assessment', icon: BarChart2 },
    { id: 'interview' as Tab, label: 'Interview Prep', icon: MessageSquare },
    { id: 'programs' as Tab, label: 'Gov. Programs', icon: CheckCircle },
  ]

  function ScoreBar({ score }: { score: number }) {
    const color = score >= 75 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-sm font-medium">
          <span>Overall Score</span>
          <span>{score}/100</span>
        </div>
        <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${score}%` }} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Briefcase className="h-8 w-8 text-blue-600" /> Career Guidance
        </h1>
        <p className="text-muted-foreground">AI-powered career development for Indian professionals</p>
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

      {/* Career Advice */}
      {activeTab === 'advice' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Career Path Guidance</CardTitle>
              <CardDescription>Get personalised career recommendations based on your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={careerForm.handleSubmit(onCareerAdvice)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Target Role *</Label>
                    <Input className="mt-1" placeholder="Software Engineer, Data Analyst..." {...careerForm.register('target_role')} />
                    {careerForm.formState.errors.target_role && <p className="text-sm text-destructive mt-1">{careerForm.formState.errors.target_role.message}</p>}
                  </div>
                  <div>
                    <Label>Current Role</Label>
                    <Input className="mt-1" placeholder="Student, Junior Dev..." {...careerForm.register('current_role')} />
                  </div>
                  <div>
                    <Label>Education *</Label>
                    <Input className="mt-1" placeholder="B.Tech CSE, MBA..." {...careerForm.register('education')} />
                    {careerForm.formState.errors.education && <p className="text-sm text-destructive mt-1">{careerForm.formState.errors.education.message}</p>}
                  </div>
                  <div>
                    <Label>Years of Experience</Label>
                    <Input type="number" min={0} className="mt-1" placeholder="0" {...careerForm.register('experience_years')} />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Current Skills (comma-separated)</Label>
                    <Input className="mt-1" placeholder="Python, Excel, Communication..." {...careerForm.register('skills')} />
                  </div>
                </div>
                <Button type="submit" disabled={careerLoading}>
                  {careerLoading ? <><Spinner size="sm" className="mr-2" />Analysing...</> : <><Briefcase className="h-4 w-4 mr-2" />Get Career Advice</>}
                </Button>
              </form>
            </CardContent>
          </Card>

          {careerError && <Alert variant="destructive"><AlertDescription>{careerError}</AlertDescription></Alert>}

          {careerResult && (
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Recommended Career Paths</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {careerResult.career_paths.map((path, i) => (
                      <div key={i} className="p-3 border border-border rounded-lg">
                        <p className="font-semibold text-sm">{path.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{path.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle className="text-sm">Skills to Develop</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {careerResult.skill_recommendations.map((s, i) => <Badge key={i} variant="secondary">{s}</Badge>)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-sm">Courses & Certifications</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-1">{careerResult.courses_certifications.map((c, i) => <li key={i} className="text-sm">• {c}</li>)}</ul>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader><CardTitle className="text-sm">Job Market Insights</CardTitle></CardHeader>
                <CardContent><p className="text-sm leading-relaxed">{careerResult.job_market_insights}</p></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Action Plan</CardTitle></CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {careerResult.action_plan.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Resume Review */}
      {activeTab === 'resume' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Resume Review</CardTitle>
              <CardDescription>Paste your resume to get a score and detailed feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={resumeForm.handleSubmit(onResumeReview)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Target Role *</Label>
                    <Input className="mt-1" placeholder="Software Engineer" {...resumeForm.register('target_role')} />
                    {resumeForm.formState.errors.target_role && <p className="text-sm text-destructive mt-1">{resumeForm.formState.errors.target_role.message}</p>}
                  </div>
                  <div>
                    <Label>Years of Experience</Label>
                    <Input type="number" min={0} className="mt-1" placeholder="0" {...resumeForm.register('experience_years')} />
                  </div>
                </div>
                <div>
                  <Label>Resume Content *</Label>
                  <Textarea
                    className="mt-1 min-h-[200px] font-mono text-xs"
                    placeholder="Paste your full resume text here..."
                    {...resumeForm.register('resume_text')}
                  />
                  {resumeForm.formState.errors.resume_text && <p className="text-sm text-destructive mt-1">{resumeForm.formState.errors.resume_text.message}</p>}
                </div>
                <Button type="submit" disabled={resumeLoading}>
                  {resumeLoading ? <><Spinner size="sm" className="mr-2" />Reviewing...</> : <><FileText className="h-4 w-4 mr-2" />Review Resume</>}
                </Button>
              </form>
            </CardContent>
          </Card>

          {resumeError && <Alert variant="destructive"><AlertDescription>{resumeError}</AlertDescription></Alert>}

          {resumeResult && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <ScoreBar score={resumeResult.overall_score} />
                  <div className="mt-2 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-5 w-5 ${i < Math.round(resumeResult.overall_score / 20) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                    ))}
                    <span className="text-sm text-muted-foreground ml-2">{resumeResult.overall_score}/100</span>
                  </div>
                </CardContent>
              </Card>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-green-200">
                  <CardHeader><CardTitle className="text-sm text-green-700 dark:text-green-400">Strengths</CardTitle></CardHeader>
                  <CardContent><ul className="space-y-1">{resumeResult.strengths.map((s, i) => <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />{s}</li>)}</ul></CardContent>
                </Card>
                <Card className="border-red-200">
                  <CardHeader><CardTitle className="text-sm text-red-700 dark:text-red-400">Weaknesses</CardTitle></CardHeader>
                  <CardContent><ul className="space-y-1">{resumeResult.weaknesses.map((w, i) => <li key={i} className="flex items-start gap-2 text-sm"><AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />{w}</li>)}</ul></CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader><CardTitle className="text-sm">Improvement Suggestions</CardTitle></CardHeader>
                <CardContent><ul className="space-y-2">{resumeResult.suggestions.map((s, i) => <li key={i} className="flex items-start gap-2 text-sm"><span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>{s}</li>)}</ul></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Keywords to Add</CardTitle></CardHeader>
                <CardContent><div className="flex flex-wrap gap-2">{resumeResult.keyword_recommendations.map((k, i) => <Badge key={i} variant="outline">{k}</Badge>)}</div></CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Skill Assessment */}
      {activeTab === 'skills' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skill Gap Assessment</CardTitle>
              <CardDescription>Find out what skills you need to develop for your target role</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={skillForm.handleSubmit(onSkillAssess)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Target Role *</Label>
                    <Input className="mt-1" placeholder="Data Scientist" {...skillForm.register('target_role')} />
                    {skillForm.formState.errors.target_role && <p className="text-sm text-destructive mt-1">{skillForm.formState.errors.target_role.message}</p>}
                  </div>
                  <div>
                    <Label>Years of Experience</Label>
                    <Input type="number" min={0} className="mt-1" placeholder="0" {...skillForm.register('experience_years')} />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Current Skills (comma-separated) *</Label>
                    <Input className="mt-1" placeholder="Python, SQL, Excel, Communication..." {...skillForm.register('current_skills')} />
                    {skillForm.formState.errors.current_skills && <p className="text-sm text-destructive mt-1">{skillForm.formState.errors.current_skills.message}</p>}
                  </div>
                </div>
                <Button type="submit" disabled={skillLoading}>
                  {skillLoading ? <><Spinner size="sm" className="mr-2" />Assessing...</> : <><BarChart2 className="h-4 w-4 mr-2" />Assess Skills</>}
                </Button>
              </form>
            </CardContent>
          </Card>

          {skillError && <Alert variant="destructive"><AlertDescription>{skillError}</AlertDescription></Alert>}

          {skillResult && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle className="text-sm">Required Skills for {skillResult.target_role}</CardTitle></CardHeader>
                  <CardContent><div className="flex flex-wrap gap-2">{skillResult.required_skills.map((s, i) => <Badge key={i} variant="secondary">{s}</Badge>)}</div></CardContent>
                </Card>
                <Card className="border-orange-200">
                  <CardHeader><CardTitle className="text-sm text-orange-600 dark:text-orange-400">Skill Gaps to Fill</CardTitle></CardHeader>
                  <CardContent><div className="flex flex-wrap gap-2">{skillResult.skill_gaps.map((s, i) => <Badge key={i} variant="outline" className="border-orange-300 text-orange-700 dark:text-orange-300">{s}</Badge>)}</div></CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Learning Path</CardTitle>
                  <p className="text-xs text-muted-foreground">Estimated time: {skillResult.estimated_time}</p>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3">
                    {skillResult.learning_path.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">{i + 1}</span>
                        <div>
                          <p className="text-sm font-medium">{step.step}</p>
                          <p className="text-xs text-muted-foreground">{step.resource}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Interview Prep */}
      {activeTab === 'interview' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interview Preparation</CardTitle>
              <CardDescription>Get tailored interview questions and preparation tips</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={interviewForm.handleSubmit(onInterviewPrep)} className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Job Role *</Label>
                    <Input className="mt-1" placeholder="Frontend Developer" {...interviewForm.register('role')} />
                    {interviewForm.formState.errors.role && <p className="text-sm text-destructive mt-1">{interviewForm.formState.errors.role.message}</p>}
                  </div>
                  <div>
                    <Label>Company Type</Label>
                    <Input className="mt-1" placeholder="Startup / MNC / Government" {...interviewForm.register('company_type')} />
                  </div>
                  <div>
                    <Label>Experience Level</Label>
                    <Input className="mt-1" placeholder="Fresher / Mid-level / Senior" {...interviewForm.register('experience_level')} />
                  </div>
                </div>
                <Button type="submit" disabled={interviewLoading}>
                  {interviewLoading ? <><Spinner size="sm" className="mr-2" />Preparing...</> : <><MessageSquare className="h-4 w-4 mr-2" />Get Prep Guide</>}
                </Button>
              </form>
            </CardContent>
          </Card>

          {interviewError && <Alert variant="destructive"><AlertDescription>{interviewError}</AlertDescription></Alert>}

          {interviewResult && (
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-sm">Common Interview Questions</CardTitle></CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {interviewResult.common_questions.map((q, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-primary font-semibold shrink-0">Q{i+1}.</span>
                        {q}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle className="text-sm">Preparation Tips</CardTitle></CardHeader>
                  <CardContent><ul className="space-y-1">{interviewResult.preparation_tips.map((t, i) => <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />{t}</li>)}</ul></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-sm">Useful Resources</CardTitle></CardHeader>
                  <CardContent><ul className="space-y-1">{interviewResult.resources.map((r, i) => <li key={i} className="text-sm">• {r}</li>)}</ul></CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Government Programs */}
      {activeTab === 'programs' && (
        <div className="grid md:grid-cols-2 gap-4">
          {(programsData?.programs ?? []).map((p, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-base">{p.name}</CardTitle>
                <CardDescription>{p.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <a href={p.website} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />Visit Website
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
