"""
Agriculture API Router

Endpoints for agriculture support, crop guidance, and farming best practices.
"""

from fastapi import APIRouter, HTTPException, status, Depends

from app.schemas.agriculture import (
    CropAdviceRequest,
    CropAdviceResponse,
    PestDiseaseQuery,
    PestDiseaseResponse,
    FertilizerRecommendation,
    FertilizerResponse
)
from app.services.gemini_service import gemini_service
from app.dependencies.auth import get_current_user_id
from app.core.logger import app_logger


router = APIRouter(
    prefix="/agriculture",
    tags=["Agriculture"]
)


@router.post("/crop-advice", response_model=CropAdviceResponse)
async def get_crop_advice(
    request: CropAdviceRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Get comprehensive advice for crop cultivation.
    
    Provides best practices, common issues, and resources for specific crops.
    """
    app_logger.info(f"Crop advice request for: {request.crop_name}")
    
    try:
        context = []
        if request.soil_type:
            context.append(f"Soil Type: {request.soil_type}")
        if request.state:
            context.append(f"State: {request.state}")
        if request.season:
            context.append(f"Season: {request.season}")
        
        context_str = "\n".join(context) if context else "No specific context provided"
        query_str = f"\nSpecific Question: {request.query}" if request.query else ""
        
        prompt = f"""You are an agricultural expert helping Indian farmers. Provide comprehensive advice for cultivating {request.crop_name}.

Context:
{context_str}{query_str}

Provide:
1. General cultivation advice (soil prep, sowing, watering, harvesting)
2. Best practices specific to the crop
3. Common issues/challenges farmers face
4. Resources (government schemes, websites, helplines)

Consider:
- Indian agricultural practices
- Regional variations
- Sustainable farming methods
- Cost-effective solutions
- Government support available

Format your response as:
ADVICE: [Detailed cultivation advice]
BEST PRACTICES: [List practices, comma-separated]
COMMON ISSUES: [List issues, comma-separated]
RESOURCES: [List resources, comma-separated]"""

        response = await gemini_service.generate_response(prompt, temperature=0.5)
        
        # Parse response
        advice = ""
        best_practices = []
        common_issues = []
        resources = []
        
        if "ADVICE:" in response:
            parts = response.split("BEST PRACTICES:")
            advice = parts[0].replace("ADVICE:", "").strip()
            
            if len(parts) > 1:
                parts2 = parts[1].split("COMMON ISSUES:")
                best_practices = [p.strip() for p in parts2[0].split(",") if p.strip()]
                
                if len(parts2) > 1:
                    parts3 = parts2[1].split("RESOURCES:")
                    common_issues = [i.strip() for i in parts3[0].split(",") if i.strip()]
                    
                    if len(parts3) > 1:
                        resources = [r.strip() for r in parts3[1].split(",") if r.strip()]
        else:
            advice = response
        
        return {
            "crop_name": request.crop_name,
            "advice": advice or "Consult local agricultural extension officer for specific guidance.",
            "best_practices": best_practices or ["Follow recommended sowing practices", "Regular monitoring"],
            "common_issues": common_issues or ["Pest attacks", "Weather dependency"],
            "resources": resources or ["Kisan Call Centre: 1800-180-1551", "PM-KISAN Portal"]
        }
    
    except Exception as e:
        app_logger.error(f"Crop advice error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate crop advice"
        )


@router.post("/pest-disease", response_model=PestDiseaseResponse)
async def identify_pest_disease(
    query: PestDiseaseQuery,
    user_id: str = Depends(get_current_user_id)
):
    """
    Identify pest or disease and get treatment recommendations.
    
    Helps farmers identify and treat crop problems.
    """
    app_logger.info(f"Pest/disease identification request")
    
    try:
        crop_info = f"\nCrop: {query.crop}" if query.crop else ""
        symptoms_info = f"\nSymptoms: {query.symptoms}" if query.symptoms else ""
        
        prompt = f"""You are a plant pathology expert. Help identify the pest or disease based on the description.

Description: {query.description}{crop_info}{symptoms_info}

Provide:
1. Possible pests/diseases (3-5 most likely)
2. Treatment solutions (both chemical and organic)
3. Preventive measures for future

Consider:
- Indian agricultural context
- Eco-friendly solutions
- Cost-effective treatments
- Safety precautions

Format as:
POSSIBLE ISSUES: [List issues, comma-separated]
SOLUTIONS: [List solutions, comma-separated]
PREVENTIVE MEASURES: [List measures, comma-separated]"""

        response = await gemini_service.generate_response(prompt, temperature=0.4)
        
        # Parse response
        possible_issues = []
        solutions = []
        preventive_measures = []
        
        if "POSSIBLE ISSUES:" in response:
            parts = response.split("SOLUTIONS:")
            possible_issues = [i.strip() for i in parts[0].replace("POSSIBLE ISSUES:", "").split(",") if i.strip()]
            
            if len(parts) > 1:
                parts2 = parts[1].split("PREVENTIVE MEASURES:")
                solutions = [s.strip() for s in parts2[0].split(",") if s.strip()]
                
                if len(parts2) > 1:
                    preventive_measures = [m.strip() for m in parts2[1].split(",") if m.strip()]
        
        return {
            "possible_issues": possible_issues or ["Consult agricultural extension officer"],
            "solutions": solutions or ["Use recommended pesticides", "Follow integrated pest management"],
            "preventive_measures": preventive_measures or ["Regular monitoring", "Crop rotation", "Proper sanitation"]
        }
    
    except Exception as e:
        app_logger.error(f"Pest/disease identification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to identify pest/disease"
        )


@router.post("/fertilizer", response_model=FertilizerResponse)
async def get_fertilizer_recommendation(
    request: FertilizerRecommendation,
    user_id: str = Depends(get_current_user_id)
):
    """
    Get fertilizer recommendations for specific crops and soil types.
    """
    app_logger.info(f"Fertilizer recommendation for: {request.crop}")
    
    try:
        context = f"Soil Type: {request.soil_type}"
        if request.state:
            context += f"\nState: {request.state}"
        if request.farm_size:
            context += f"\nFarm Size: {request.farm_size}"
        
        prompt = f"""You are a soil fertility expert. Recommend fertilizers for the following:

Crop: {request.crop}
{context}

Provide:
1. Specific fertilizer recommendations (NPK ratios, quantities)
2. Application timing and methods
3. Organic alternatives
4. Important tips for application

Format as:
RECOMMENDATIONS: [List fertilizer recommendations with details, each on new line]
APPLICATION TIPS: [List tips, comma-separated]
ORGANIC ALTERNATIVES: [List organic options, comma-separated]"""

        response = await gemini_service.generate_response(prompt, temperature=0.4)
        
        # Parse response
        recommendations = []
        application_tips = []
        organic_alternatives = []
        
        if "RECOMMENDATIONS:" in response:
            parts = response.split("APPLICATION TIPS:")
            rec_text = parts[0].replace("RECOMMENDATIONS:", "").strip()
            recommendations = [{"recommendation": r.strip()} for r in rec_text.split("\n") if r.strip()]
            
            if len(parts) > 1:
                parts2 = parts[1].split("ORGANIC ALTERNATIVES:")
                application_tips = [t.strip() for t in parts2[0].split(",") if t.strip()]
                
                if len(parts2) > 1:
                    organic_alternatives = [o.strip() for o in parts2[1].split(",") if o.strip()]
        
        return {
            "crop": request.crop,
            "recommendations": recommendations or [{"recommendation": "Consult soil testing laboratory"}],
            "application_tips": application_tips or ["Follow recommended dosage", "Apply at right time"],
            "organic_alternatives": organic_alternatives or ["Compost", "Vermicompost", "Green manure"]
        }
    
    except Exception as e:
        app_logger.error(f"Fertilizer recommendation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate fertilizer recommendations"
        )


@router.get("/government-schemes")
async def get_agriculture_schemes(user_id: str = Depends(get_current_user_id)):
    """Get major agriculture-related government schemes"""
    return {
        "schemes": [
            {
                "name": "PM-KISAN",
                "description": "₹6,000 per year direct income support",
                "website": "https://pmkisan.gov.in"
            },
            {
                "name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
                "description": "Crop insurance scheme",
                "website": "https://pmfby.gov.in"
            },
            {
                "name": "Soil Health Card Scheme",
                "description": "Free soil testing and health cards",
                "website": "https://soilhealth.dac.gov.in"
            },
            {
                "name": "Paramparagat Krishi Vikas Yojana (PKVY)",
                "description": "Organic farming support",
                "website": "https://pgsindia-ncof.gov.in"
            }
        ]
    }


@router.get("/helplines")
async def get_agriculture_helplines(user_id: str = Depends(get_current_user_id)):
    """Get agriculture helpline numbers"""
    return {
        "helplines": [
            {"service": "Kisan Call Centre", "number": "1800-180-1551"},
            {"service": "mKisan Helpline", "number": "1800-180-1551"},
            {"service": "Agri Marketing", "number": "1800-270-0224"}
        ]
    }
