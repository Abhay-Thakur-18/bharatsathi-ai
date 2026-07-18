"""
Career API Router

Endpoints for career guidance, resume review, and skill development.
"""

from fastapi import APIRouter, HTTPException, status, Depends

from app.schemas.career import (
    CareerAdviceRequest,
    CareerAdviceResponse,
    ResumeReviewRequest,
    ResumeReviewResponse,
    SkillAssessmentRequest,
    SkillAssessmentResponse,
    InterviewPrepRequest,
    InterviewPrepResponse
)
from app.services.gemini_service import gemini_service
from app.dependencies.auth import get_current_user_id
from app.repositories.career_repository import log_career_query
from app.core.logger import app_logger


router = APIRouter(
    prefix="/career",
    tags=["Career Guidance"]
)


@router.post("/advice", response_model=CareerAdviceResponse)
async def get_career_advice(
    request: CareerAdviceRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Get personalized career guidance and recommendations.
    
    Analyzes current status, education, and interests to suggest career paths.
    """
    app_logger.info(f"Career advice request from user: {user_id}")
    
    try:
        interests_str = ", ".join(request.interests) if request.interests else "Not specified"
        skills_str = ", ".join(request.skills) if request.skills else "Not specified"
        location_str = request.location or "Any"
        query_str = f"\n\nSpecific Question: {request.query}" if request.query else ""
        
        prompt = f"""You are an expert career counselor in India. Provide comprehensive career guidance.

Profile:
- Current Status: {request.current_status}
- Education: {request.education}
- Interests: {interests_str}
- Skills: {skills_str}
- Location Preference: {location_str}{query_str}

Provide:
1. 3-5 suitable career paths with brief descriptions
2. Skills to develop
3. Recommended courses/certifications
4. Current job market insights in India
5. Step-by-step action plan

Consider:
- Indian job market trends
- Emerging opportunities
- Remote work options
- Government job opportunities
- Entrepreneurship possibilities

Format as:
CAREER PATHS: [List career paths with descriptions, each on new line like "Path: Description"]
SKILL RECOMMENDATIONS: [comma-separated skills]
COURSES CERTIFICATIONS: [comma-separated courses]
JOB MARKET INSIGHTS: [detailed market analysis]
ACTION PLAN: [comma-separated steps]"""

        response = await gemini_service.generate_response(prompt, temperature=0.6)
        
        # Parse response
        career_paths = []
        skill_recommendations = []
        courses = []
        insights = ""
        action_plan = []
        
        if "CAREER PATHS:" in response:
            parts = response.split("SKILL RECOMMENDATIONS:")
            paths_text = parts[0].replace("CAREER PATHS:", "").strip()
            for line in paths_text.split("\n"):
                if ":" in line:
                    parts_line = line.split(":", 1)
                    career_paths.append({"title": parts_line[0].strip(), "description": parts_line[1].strip()})
            
            if len(parts) > 1:
                parts2 = parts[1].split("COURSES CERTIFICATIONS:")
                skill_recommendations = [s.strip() for s in parts2[0].split(",") if s.strip()]
                
                if len(parts2) > 1:
                    parts3 = parts2[1].split("JOB MARKET INSIGHTS:")
                    courses = [c.strip() for c in parts3[0].split(",") if c.strip()]
                    
                    if len(parts3) > 1:
                        parts4 = parts3[1].split("ACTION PLAN:")
                        insights = parts4[0].strip()
                        
                        if len(parts4) > 1:
                            action_plan = [a.strip() for a in parts4[1].split(",") if a.strip()]
        
        result = {
            "career_paths": career_paths or [{"title": "Consult Career Counselor", "description": "Get personalized guidance"}],
            "skill_recommendations": skill_recommendations or ["Communication", "Problem-solving", "Technical skills"],
            "courses_certifications": courses or ["Online courses on Coursera/Udemy", "Industry certifications"],
            "job_market_insights": insights or "Diverse opportunities available across sectors.",
            "action_plan": action_plan or ["Identify target role", "Develop required skills", "Build portfolio", "Network"]
        }

        # Persist query to MongoDB
        await log_career_query(
            user_id=user_id,
            query_type="career_advice",
            query_data=request.model_dump(),
            response_data=result,
        )

        return result
    
    except Exception as e:
        app_logger.error(f"Career advice error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate career advice"
        )


@router.post("/resume-review", response_model=ResumeReviewResponse)
async def review_resume(
    request: ResumeReviewRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    AI-powered resume review and improvement suggestions.
    
    Analyzes resume and provides actionable feedback.
    """
    app_logger.info(f"Resume review request from user: {user_id}")
    
    try:
        target_str = f"\nTarget Role: {request.target_role}" if request.target_role else ""
        exp_str = f"\nExperience: {request.experience_years} years" if request.experience_years is not None else ""
        
        prompt = f"""You are an expert resume reviewer and career coach. Review this resume and provide detailed feedback.

Resume:{target_str}{exp_str}

{request.resume_text[:5000]}

Provide:
1. Overall score (0-100)
2. Key strengths (3-5 points)
3. Major weaknesses (3-5 points)
4. Specific improvement suggestions (5-7 points)
5. Recommended keywords to include

Consider:
- ATS (Applicant Tracking System) compatibility
- Content clarity and impact
- Structure and formatting
- Achievement quantification
- Indian job market standards

Format as:
OVERALL SCORE: [number]
STRENGTHS: [comma-separated]
WEAKNESSES: [comma-separated]
SUGGESTIONS: [comma-separated]
KEYWORDS: [comma-separated]"""

        response = await gemini_service.generate_response(prompt, temperature=0.4)
        
        # Parse response
        score = 70
        strengths = []
        weaknesses = []
        suggestions = []
        keywords = []
        
        if "OVERALL SCORE:" in response:
            try:
                score_part = response.split("STRENGTHS:")[0].replace("OVERALL SCORE:", "").strip()
                score = int(''.join(filter(str.isdigit, score_part))[:2])
            except:
                score = 70
            
            parts = response.split("STRENGTHS:")
            if len(parts) > 1:
                parts2 = parts[1].split("WEAKNESSES:")
                strengths = [s.strip() for s in parts2[0].split(",") if s.strip()]
                
                if len(parts2) > 1:
                    parts3 = parts2[1].split("SUGGESTIONS:")
                    weaknesses = [w.strip() for w in parts3[0].split(",") if w.strip()]
                    
                    if len(parts3) > 1:
                        parts4 = parts3[1].split("KEYWORDS:")
                        suggestions = [s.strip() for s in parts4[0].split(",") if s.strip()]
                        
                        if len(parts4) > 1:
                            keywords = [k.strip() for k in parts4[1].split(",") if k.strip()]
        
        result = {
            "overall_score": min(max(score, 0), 100),
            "strengths": strengths or ["Good educational background"],
            "weaknesses": weaknesses or ["Improve formatting", "Add quantifiable achievements"],
            "suggestions": suggestions or ["Use action verbs", "Quantify achievements", "Tailor to job description"],
            "keyword_recommendations": keywords or ["Leadership", "Problem-solving", "Team collaboration"]
        }

        # Persist query to MongoDB
        await log_career_query(
            user_id=user_id,
            query_type="resume_review",
            query_data={"target_role": request.target_role, "experience_years": request.experience_years},
            response_data=result,
        )

        return result
    
    except Exception as e:
        app_logger.error(f"Resume review error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to review resume"
        )


@router.post("/skill-assessment", response_model=SkillAssessmentResponse)
async def assess_skills(
    request: SkillAssessmentRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Assess skill gaps for target role and suggest learning path.
    """
    app_logger.info(f"Skill assessment for role: {request.target_role}")
    
    try:
        current_skills_str = ", ".join(request.current_skills)
        
        prompt = f"""You are a skill development expert. Analyze the skill gap for this profile.

Target Role: {request.target_role}
Current Skills: {current_skills_str}
Experience: {request.experience_years} years

Provide:
1. All required skills for target role
2. Skills missing/needing improvement
3. Step-by-step learning path with resources
4. Estimated time to become job-ready

Consider:
- Industry standards in India
- Free and paid learning resources
- Practical project ideas
- Certification value

Format as:
REQUIRED SKILLS: [comma-separated]
SKILL GAPS: [comma-separated]
LEARNING PATH: [Each step on new line like "Step: Resource"]
ESTIMATED TIME: [time description]"""

        response = await gemini_service.generate_response(prompt, temperature=0.5)
        
        # Parse response
        required_skills = []
        skill_gaps = []
        learning_path = []
        estimated_time = "3-6 months with consistent effort"
        
        if "REQUIRED SKILLS:" in response:
            parts = response.split("SKILL GAPS:")
            required_skills = [s.strip() for s in parts[0].replace("REQUIRED SKILLS:", "").split(",") if s.strip()]
            
            if len(parts) > 1:
                parts2 = parts[1].split("LEARNING PATH:")
                skill_gaps = [g.strip() for g in parts2[0].split(",") if g.strip()]
                
                if len(parts2) > 1:
                    parts3 = parts2[1].split("ESTIMATED TIME:")
                    path_text = parts3[0].strip()
                    for line in path_text.split("\n"):
                        if ":" in line:
                            parts_line = line.split(":", 1)
                            learning_path.append({"step": parts_line[0].strip(), "resource": parts_line[1].strip()})
                    
                    if len(parts3) > 1:
                        estimated_time = parts3[1].strip()
        
        result = {
            "target_role": request.target_role,
            "required_skills": required_skills or ["Technical skills", "Soft skills"],
            "skill_gaps": skill_gaps or ["Need to assess based on target role"],
            "learning_path": learning_path or [{"step": "Start with basics", "resource": "Online courses"}],
            "estimated_time": estimated_time
        }

        # Persist query to MongoDB
        await log_career_query(
            user_id=user_id,
            query_type="skill_assessment",
            query_data=request.model_dump(),
            response_data=result,
        )

        return result
    
    except Exception as e:
        app_logger.error(f"Skill assessment error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to assess skills"
        )


@router.post("/interview-prep", response_model=InterviewPrepResponse)
async def get_interview_prep(
    request: InterviewPrepRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Get interview preparation guidance and common questions.
    """
    app_logger.info(f"Interview prep for role: {request.job_role}")
    
    try:
        company_str = f"\nCompany Type: {request.company_type}" if request.company_type else ""
        type_str = f"\nInterview Type: {request.interview_type}" if request.interview_type else ""
        
        prompt = f"""You are an interview coaching expert. Help prepare for this interview.

Job Role: {request.job_role}{company_str}{type_str}

Provide:
1. 10-15 common interview questions for this role
2. Preparation tips and strategies
3. Useful resources

Format as:
COMMON QUESTIONS: [each question on new line]
PREPARATION TIPS: [comma-separated]
RESOURCES: [comma-separated]"""

        response = await gemini_service.generate_response(prompt, temperature=0.5)
        
        # Parse response
        questions = []
        tips = []
        resources = []
        
        if "COMMON QUESTIONS:" in response:
            parts = response.split("PREPARATION TIPS:")
            questions_text = parts[0].replace("COMMON QUESTIONS:", "").strip()
            questions = [q.strip() for q in questions_text.split("\n") if q.strip()]
            
            if len(parts) > 1:
                parts2 = parts[1].split("RESOURCES:")
                tips = [t.strip() for t in parts2[0].split(",") if t.strip()]
                
                if len(parts2) > 1:
                    resources = [r.strip() for r in parts2[1].split(",") if r.strip()]
        
        result = {
            "common_questions": questions or ["Tell me about yourself", "Why this role?", "Your strengths?"],
            "preparation_tips": tips or ["Research company", "Practice answers", "Prepare questions"],
            "resources": resources or ["Glassdoor", "LinkedIn", "Company website"]
        }

        # Persist query to MongoDB
        await log_career_query(
            user_id=user_id,
            query_type="interview_prep",
            query_data=request.model_dump(),
            response_data=result,
        )

        return result
    
    except Exception as e:
        app_logger.error(f"Interview prep error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate interview preparation"
        )


@router.get("/government-programs")
async def get_career_programs(user_id: str = Depends(get_current_user_id)):
    """Get government skill development and employment programs"""
    return {
        "programs": [
            {
                "name": "Pradhan Mantri Kaushal Vikas Yojana (PMKVY)",
                "description": "Skill development and certification program",
                "website": "https://www.pmkvyofficial.org"
            },
            {
                "name": "National Career Service (NCS)",
                "description": "Job portal and career guidance",
                "website": "https://www.ncs.gov.in"
            },
            {
                "name": "Start-up India",
                "description": "Support for entrepreneurs and startups",
                "website": "https://www.startupindia.gov.in"
            },
            {
                "name": "NEEM (National Employability Enhancement Mission)",
                "description": "Employability enhancement program",
                "website": "https://neem.gov.in"
            }
        ]
    }
