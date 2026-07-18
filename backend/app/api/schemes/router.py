"""
Government Schemes API Router

Endpoints for government schemes search, details, and AI-powered recommendations.
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import Optional

from app.schemas.scheme import (
    SchemeSearch,
    SchemeResponse,
    SchemeListResponse,
    AISchemeRecommendationRequest,
    AISchemeRecommendationResponse
)
from app.repositories import scheme_repository
from app.services.groq_service import groq_service as gemini_service
from app.dependencies.auth import get_current_user_id
from app.core.logger import app_logger


router = APIRouter(
    prefix="/schemes",
    tags=["Government Schemes"]
)


def format_scheme(scheme: dict) -> dict:
    """Format scheme document for API response"""
    return {
        "id": str(scheme["_id"]),
        "name": scheme["name"],
        "description": scheme["description"],
        "category": scheme["category"],
        "eligibility": scheme["eligibility"],
        "benefits": scheme["benefits"],
        "how_to_apply": scheme["how_to_apply"],
        "official_website": scheme.get("official_website"),
        "contact_info": scheme.get("contact_info", {}),
        "documents_required": scheme.get("documents_required", []),
        "target_audience": scheme.get("target_audience", []),
        "ministry": scheme.get("ministry"),
        "state": scheme.get("state"),
        "is_central": scheme.get("is_central", True),
        "views_count": scheme.get("views_count", 0)
    }


@router.get("/", response_model=SchemeListResponse)
async def get_schemes(
    query: Optional[str] = Query(None, description="Search query"),
    category: Optional[str] = Query(None, description="Filter by category"),
    state: Optional[str] = Query(None, description="Filter by state"),
    is_central: Optional[bool] = Query(None, description="Filter central/state schemes"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    user_id: str = Depends(get_current_user_id)
):
    """
    Search and filter government schemes.
    
    Supports text search, category filter, state filter, and pagination.
    """
    skip = (page - 1) * per_page
    
    schemes = await scheme_repository.search_schemes(
        query=query,
        category=category,
        state=state,
        is_central=is_central,
        skip=skip,
        limit=per_page
    )
    
    total = await scheme_repository.count_schemes(
        query=query,
        category=category,
        state=state,
        is_central=is_central
    )
    
    # Log search query
    if query:
        await scheme_repository.log_scheme_search(
            user_id,
            query,
            {"category": category, "state": state, "is_central": is_central}
        )
    
    return {
        "schemes": [format_scheme(scheme) for scheme in schemes],
        "total": total,
        "page": page,
        "per_page": per_page
    }


@router.get("/categories")
async def get_categories(user_id: str = Depends(get_current_user_id)):
    """Get all available scheme categories"""
    categories = await scheme_repository.get_all_categories()
    return {"categories": categories}


@router.get("/{scheme_id}", response_model=SchemeResponse)
async def get_scheme_details(
    scheme_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """
    Get detailed information about a specific scheme.
    
    Increments view count for analytics.
    """
    scheme = await scheme_repository.get_scheme_by_id(scheme_id)
    
    if not scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheme not found"
        )
    
    # Increment views
    await scheme_repository.increment_scheme_views(scheme_id)
    
    return format_scheme(scheme)


@router.post("/recommend", response_model=AISchemeRecommendationResponse)
async def get_ai_recommendations(
    request: AISchemeRecommendationRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Get AI-powered scheme recommendations based on user query and context.
    
    Uses Gemini AI to understand user needs and match with relevant schemes.
    """
    app_logger.info(f"AI recommendation request from user: {user_id}")
    
    try:
        # Get all schemes for AI analysis
        schemes = await scheme_repository.search_schemes(limit=100)
        
        if not schemes:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No schemes available"
            )
        
        # Build context for AI
        schemes_context = "\n\n".join([
            f"Scheme: {s['name']}\n"
            f"Category: {s['category']}\n"
            f"Description: {s['description']}\n"
            f"Eligibility: {', '.join(s['eligibility'])}\n"
            f"Benefits: {', '.join(s['benefits'])}"
            for s in schemes[:20]  # Top 20 schemes
        ])
        
        user_context_str = ""
        if request.user_context:
            user_context_str = "\n".join([f"{k}: {v}" for k, v in request.user_context.items()])
        
        prompt = f"""You are an expert on Indian Government Schemes. Based on the user's query and context, recommend the most suitable schemes.

User Query: {request.user_query}

User Context:
{user_context_str if user_context_str else "Not provided"}

Available Schemes:
{schemes_context}

Task:
1. Analyze the user's needs and situation
2. Identify the 3-5 most relevant schemes
3. Explain why each scheme is suitable
4. Provide a summary of how these schemes can help

Return your response in this format:
RECOMMENDED SCHEMES: [List the scheme names, comma-separated]
EXPLANATION: [Provide detailed explanation of why these schemes are recommended and how they help]"""

        ai_response = await gemini_service.generate_response(prompt, temperature=0.7)
        
        # Parse AI response
        recommended_names = []
        explanation = ai_response
        
        if "RECOMMENDED SCHEMES:" in ai_response and "EXPLANATION:" in ai_response:
            parts = ai_response.split("EXPLANATION:")
            recommended_names = [
                name.strip() 
                for name in parts[0].replace("RECOMMENDED SCHEMES:", "").split(",")
            ]
            explanation = parts[1].strip()
        
        # Find matching schemes
        recommended_schemes = []
        for scheme in schemes:
            if any(name.lower() in scheme["name"].lower() or scheme["name"].lower() in name.lower() 
                   for name in recommended_names):
                recommended_schemes.append(scheme)
        
        # If no exact matches, return top relevant schemes by category
        if not recommended_schemes:
            recommended_schemes = schemes[:5]
        
        app_logger.info(f"AI recommended {len(recommended_schemes)} schemes")
        
        return {
            "query": request.user_query,
            "recommendations": [format_scheme(s) for s in recommended_schemes[:5]],
            "ai_explanation": explanation
        }
    
    except Exception as e:
        app_logger.error(f"AI recommendation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate recommendations: {str(e)}"
        )


@router.post("/explain/{scheme_id}")
async def explain_scheme_with_ai(
    scheme_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """
    Get AI-powered simplified explanation of a scheme.
    
    Makes complex government schemes easy to understand.
    """
    scheme = await scheme_repository.get_scheme_by_id(scheme_id)
    
    if not scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheme not found"
        )
    
    try:
        prompt = f"""Explain the following government scheme in simple, easy-to-understand language:

Scheme Name: {scheme['name']}
Description: {scheme['description']}
Eligibility: {', '.join(scheme['eligibility'])}
Benefits: {', '.join(scheme['benefits'])}
How to Apply: {scheme['how_to_apply']}

Provide:
1. A simple one-paragraph summary (for common people)
2. Who should apply (in simple terms)
3. Key benefits in bullet points
4. Simple step-by-step application process
5. Common questions and answers

Use simple Hindi-English mixed language if helpful for Indian audience."""

        explanation = await gemini_service.generate_response(prompt, temperature=0.5)
        
        return {
            "scheme_id": scheme_id,
            "scheme_name": scheme["name"],
            "ai_explanation": explanation
        }
    
    except Exception as e:
        app_logger.error(f"AI explanation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate explanation"
        )
