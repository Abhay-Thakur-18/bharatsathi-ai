"""
Healthcare API Router

Endpoints for healthcare guidance, symptom checking, and health information.
"""

from fastapi import APIRouter, HTTPException, status, Depends

from app.schemas.healthcare import (
    SymptomCheck,
    SymptomCheckResponse,
    HealthQuery,
    HealthQueryResponse
)
from app.services.gemini_service import gemini_service
from app.dependencies.auth import get_current_user_id
from app.core.logger import app_logger


router = APIRouter(
    prefix="/healthcare",
    tags=["Healthcare"]
)


HEALTH_DISCLAIMER = """⚠️ DISCLAIMER: This is AI-generated information for educational purposes only. 
It is NOT a substitute for professional medical advice, diagnosis, or treatment. 
Always seek the advice of your physician or qualified health provider with any questions about a medical condition. 
Never disregard professional medical advice or delay seeking it because of AI-generated information. 
In case of emergency, call your local emergency number immediately."""


@router.post("/symptom-check", response_model=SymptomCheckResponse)
async def check_symptoms(
    data: SymptomCheck,
    user_id: str = Depends(get_current_user_id)
):
    """
    AI-powered symptom checker.
    
    Analyzes symptoms and provides general guidance. NOT a replacement for doctor consultation.
    """
    app_logger.info(f"Symptom check request from user: {user_id}")
    
    try:
        context = f"Age: {data.age}, Gender: {data.gender}" if data.age and data.gender else "Age/Gender not provided"
        medical_history = f"\nMedical History: {data.medical_history}" if data.medical_history else ""
        
        prompt = f"""You are a medical information assistant (NOT a doctor). Analyze the following symptoms and provide general guidance.

Patient Context: {context}{medical_history}
Symptoms: {data.symptoms}

Provide:
1. A brief analysis of the symptoms
2. 3-5 possible conditions that could cause these symptoms (general, common conditions)
3. General recommendations (home care, when to see a doctor)
4. Clear indication of when immediate medical attention is needed

IMPORTANT:
- Be cautious and conservative
- Always recommend seeing a doctor for serious symptoms
- Don't diagnose specific conditions
- Focus on general health information
- Emphasize the importance of professional medical consultation

Format your response as:
ANALYSIS: [Your analysis]
POSSIBLE CONDITIONS: [List conditions, comma-separated]
RECOMMENDATIONS: [List recommendations, comma-separated]
WHEN TO SEE DOCTOR: [When to seek medical help]"""

        response = await gemini_service.generate_response(prompt, temperature=0.3)
        
        # Parse response
        analysis = ""
        possible_conditions = []
        recommendations = []
        when_to_see_doctor = "Consult a healthcare professional if symptoms persist or worsen."
        
        if "ANALYSIS:" in response:
            parts = response.split("POSSIBLE CONDITIONS:")
            analysis = parts[0].replace("ANALYSIS:", "").strip()
            
            if len(parts) > 1:
                parts2 = parts[1].split("RECOMMENDATIONS:")
                possible_conditions = [c.strip() for c in parts2[0].split(",") if c.strip()]
                
                if len(parts2) > 1:
                    parts3 = parts2[1].split("WHEN TO SEE DOCTOR:")
                    recommendations = [r.strip() for r in parts3[0].split(",") if r.strip()]
                    
                    if len(parts3) > 1:
                        when_to_see_doctor = parts3[1].strip()
        else:
            analysis = response
        
        return {
            "analysis": analysis or "Unable to analyze symptoms. Please consult a healthcare professional.",
            "possible_conditions": possible_conditions or ["Consult a doctor for proper diagnosis"],
            "recommendations": recommendations or ["Seek professional medical advice"],
            "when_to_see_doctor": when_to_see_doctor,
            "disclaimer": HEALTH_DISCLAIMER
        }
    
    except Exception as e:
        app_logger.error(f"Symptom check error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process symptom check"
        )


@router.post("/ask", response_model=HealthQueryResponse)
async def ask_health_question(
    query: HealthQuery,
    user_id: str = Depends(get_current_user_id)
):
    """
    Ask general health and wellness questions.
    
    Get AI-powered answers about health topics, diseases, prevention, and wellness.
    """
    app_logger.info(f"Health query from user: {user_id}")
    
    try:
        context_str = f"\nContext: {query.context}" if query.context else ""
        
        prompt = f"""You are a health information assistant. Answer the following health question accurately and clearly.

Question: {query.query}{context_str}

Provide:
- A clear, accurate answer
- Evidence-based information
- Practical advice where applicable
- Sources or references if relevant (government health websites, WHO, etc.)

Keep the answer:
- Accurate and factual
- Easy to understand
- Culturally appropriate for Indian context
- Emphasize consulting healthcare professionals for medical decisions

IMPORTANT: Always include a disclaimer that this is informational and not medical advice."""

        answer = await gemini_service.generate_response(prompt, temperature=0.5)
        
        # Extract potential sources mentioned
        sources = []
        common_sources = [
            "Ministry of Health and Family Welfare",
            "WHO (World Health Organization)",
            "Indian Council of Medical Research (ICMR)",
            "National Health Portal"
        ]
        
        for source in common_sources:
            if source.lower() in answer.lower():
                sources.append(source)
        
        return {
            "query": query.query,
            "answer": answer,
            "sources": sources,
            "disclaimer": HEALTH_DISCLAIMER
        }
    
    except Exception as e:
        app_logger.error(f"Health query error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process health query"
        )


@router.get("/government-health-schemes")
async def get_government_health_schemes(user_id: str = Depends(get_current_user_id)):
    """
    Get information about major government healthcare schemes.
    """
    return {
        "schemes": [
            {
                "name": "Ayushman Bharat (PM-JAY)",
                "description": "₹5 lakh health insurance per family per year",
                "website": "https://pmjay.gov.in"
            },
            {
                "name": "Pradhan Mantri Swasthya Suraksha Yojana (PMSSY)",
                "description": "Establishment of AIIMS and upgrade of government medical colleges",
                "website": "https://pmssy-mohfw.nic.in"
            },
            {
                "name": "Janani Suraksha Yojana (JSY)",
                "description": "Safe motherhood intervention promoting institutional delivery",
                "website": "https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841&lid=309"
            },
            {
                "name": "Rashtriya Bal Swasthya Karyakram (RBSK)",
                "description": "Child health screening and early intervention services",
                "website": "https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=1132&lid=607"
            }
        ]
    }


@router.get("/emergency-numbers")
async def get_emergency_numbers(user_id: str = Depends(get_current_user_id)):
    """Get emergency contact numbers for India"""
    return {
        "emergency_numbers": [
            {"service": "Emergency (All)", "number": "112"},
            {"service": "Ambulance", "number": "102/108"},
            {"service": "Police", "number": "100"},
            {"service": "Fire", "number": "101"},
            {"service": "Women Helpline", "number": "1091"},
            {"service": "Child Helpline", "number": "1098"},
            {"service": "National Health Helpline", "number": "1800-180-1104"},
            {"service": "Mental Health Helpline", "number": "08046110007"},
            {"service": "COVID-19 Helpline", "number": "1075"}
        ]
    }
