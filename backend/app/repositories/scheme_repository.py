"""
Government Scheme Repository

Database operations for government schemes.
"""

from bson import ObjectId
from typing import Optional, List, Dict
from datetime import datetime

from app.db.database import db
from app.core.logger import app_logger
from app.models.scheme import SchemeModel


schemes_collection = db["schemes"]
scheme_searches_collection = db["scheme_searches"]


async def initialize_scheme_indexes():
    """Create database indexes for scheme collections"""
    try:
        # Schemes indexes
        await schemes_collection.create_index("category")
        await schemes_collection.create_index("state")
        await schemes_collection.create_index([("name", "text"), ("description", "text")])
        
        # Search logs index
        await scheme_searches_collection.create_index("user_id")
        await scheme_searches_collection.create_index("created_at")
        
        app_logger.info("Scheme collection indexes created successfully")
    except Exception as e:
        app_logger.warning(f"Scheme index creation skipped or failed: {str(e)}")


async def seed_sample_schemes():
    """Seed database with sample government schemes"""
    count = await schemes_collection.count_documents({})
    if count > 0:
        app_logger.info("Schemes already exist, skipping seed")
        return
    
    sample_schemes = [
        SchemeModel.create_scheme(
            name="Pradhan Mantri Jan Dhan Yojana (PMJDY)",
            description="Financial inclusion programme ensuring access to financial services like bank accounts, remittances, credit, insurance, and pensions.",
            category="financial_inclusion",
            eligibility=[
                "Indian citizen",
                "No minimum balance requirement",
                "Age 10 years or above"
            ],
            benefits=[
                "Zero balance bank account",
                "RuPay debit card",
                "Accident insurance cover of ₹2 lakh",
                "Overdraft facility up to ₹10,000"
            ],
            how_to_apply="Visit nearest bank branch with Aadhaar card and fill account opening form",
            official_website="https://pmjdy.gov.in",
            documents_required=["Aadhaar Card", "PAN Card (optional)", "Address Proof"],
            target_audience=["Unbanked citizens", "Rural population", "Low-income groups"],
            ministry="Ministry of Finance",
            is_central=True
        ),
        SchemeModel.create_scheme(
            name="Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
            description="World's largest health insurance scheme providing coverage of ₹5 lakh per family per year for secondary and tertiary care hospitalization.",
            category="healthcare",
            eligibility=[
                "Belongs to economically vulnerable families",
                "Family included in SECC 2011 database",
                "No age limit"
            ],
            benefits=[
                "₹5 lakh health cover per family per year",
                "Cashless treatment at empaneled hospitals",
                "Coverage for pre and post-hospitalization expenses",
                "Covers 1,393 procedures across 23 specialties"
            ],
            how_to_apply="Check eligibility at nearest Common Service Centre (CSC) or Ayushman Bharat kiosk",
            official_website="https://pmjay.gov.in",
            documents_required=["Aadhaar Card", "Ration Card", "SECC 2011 verification"],
            target_audience=["Poor families", "Economically vulnerable groups"],
            ministry="Ministry of Health and Family Welfare",
            is_central=True
        ),
        SchemeModel.create_scheme(
            name="Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
            description="Income support scheme for farmers providing ₹6,000 per year in three equal installments directly to bank accounts.",
            category="agriculture",
            eligibility=[
                "Small and marginal farmers",
                "Owns cultivable land",
                "Family (husband, wife, minor children) should not have more than 2 hectares"
            ],
            benefits=[
                "₹6,000 per year direct to bank account",
                "Paid in 3 installments of ₹2,000 each",
                "No application fee"
            ],
            how_to_apply="Register online at PM-KISAN portal or visit local agriculture office",
            official_website="https://pmkisan.gov.in",
            documents_required=["Aadhaar Card", "Land ownership documents", "Bank account details"],
            target_audience=["Small farmers", "Marginal farmers", "Landowners"],
            ministry="Ministry of Agriculture & Farmers Welfare",
            is_central=True
        ),
        SchemeModel.create_scheme(
            name="Pradhan Mantri Mudra Yojana (PMMY)",
            description="Provides loans up to ₹10 lakh to non-corporate, non-farm small/micro enterprises for income generating activities.",
            category="employment",
            eligibility=[
                "Indian citizen",
                "Engaged in income generating activity",
                "Non-corporate, non-farm sector",
                "Credit requirement up to ₹10 lakh"
            ],
            benefits=[
                "Shishu: Loans up to ₹50,000",
                "Kishore: Loans from ₹50,001 to ₹5 lakh",
                "Tarun: Loans from ₹5 lakh to ₹10 lakh",
                "No collateral required for loans up to ₹10 lakh"
            ],
            how_to_apply="Apply at any bank, NBFC, or MFI with business plan and documents",
            official_website="https://www.mudra.org.in",
            documents_required=["Aadhaar Card", "PAN Card", "Business plan", "Address proof", "Bank statements"],
            target_audience=["Small business owners", "Entrepreneurs", "Self-employed individuals"],
            ministry="Ministry of Finance",
            is_central=True
        ),
        SchemeModel.create_scheme(
            name="Beti Bachao Beti Padhao (BBBP)",
            description="Campaign to address declining Child Sex Ratio and promote education and empowerment of girl children.",
            category="women_welfare",
            eligibility=[
                "Girl child",
                "Indian citizen",
                "Bank account in girl's name"
            ],
            benefits=[
                "Financial assistance for education",
                "Awareness campaigns",
                "Community mobilization",
                "Special incentives in selected districts"
            ],
            how_to_apply="Open Sukanya Samriddhi Account at post office or authorized bank",
            official_website="https://wcd.nic.in/bbbp-schemes",
            documents_required=["Birth certificate of girl child", "Aadhaar Card of parents", "Address proof"],
            target_audience=["Girl children", "Parents of girl children"],
            ministry="Ministry of Women and Child Development",
            is_central=True
        ),
        SchemeModel.create_scheme(
            name="Pradhan Mantri Awas Yojana (PMAY) - Urban",
            description="Housing for All mission providing affordable housing to urban poor with central assistance for construction of houses.",
            category="housing",
            eligibility=[
                "Economically Weaker Section (annual income up to ₹3 lakh)",
                "Low Income Group (annual income ₹3-6 lakh)",
                "Middle Income Group 1 (annual income ₹6-12 lakh)",
                "Middle Income Group 2 (annual income ₹12-18 lakh)",
                "Should not own pucca house in India"
            ],
            benefits=[
                "Credit linked subsidy up to ₹2.67 lakh",
                "Interest subsidy on home loans",
                "Financial assistance for house construction",
                "Preference to women ownership"
            ],
            how_to_apply="Apply online through PMAY portal or through lending institutions",
            official_website="https://pmaymis.gov.in",
            documents_required=["Aadhaar Card", "Income certificate", "Bank account details", "Address proof"],
            target_audience=["Urban poor", "Economically weaker sections", "First-time home buyers"],
            ministry="Ministry of Housing and Urban Affairs",
            is_central=True
        ),
        SchemeModel.create_scheme(
            name="National Apprenticeship Promotion Scheme (NAPS)",
            description="Promotes apprenticeship training and provides stipend support to apprentices to enhance their employability.",
            category="skill_development",
            eligibility=[
                "Age 14 years or above",
                "Completed 5th standard (for designated trades)",
                "Completed 8th standard (for optional trades)"
            ],
            benefits=[
                "Stipend during apprenticeship period",
                "Government shares 25% of prescribed stipend (max ₹1,500/month)",
                "On-the-job training",
                "Certificate recognized by NCVT"
            ],
            how_to_apply="Register on National Apprenticeship Portal and apply to establishments",
            official_website="https://apprenticeshipindia.gov.in",
            documents_required=["Educational certificates", "Aadhaar Card", "Bank account details"],
            target_audience=["Youth", "Job seekers", "Students"],
            ministry="Ministry of Skill Development and Entrepreneurship",
            is_central=True
        ),
        SchemeModel.create_scheme(
            name="Atal Pension Yojana (APY)",
            description="Pension scheme for unorganized sector workers providing guaranteed minimum pension between ₹1,000 to ₹5,000 per month.",
            category="pension",
            eligibility=[
                "Indian citizen",
                "Age 18-40 years at time of joining",
                "Has Aadhaar and bank account",
                "Not covered under any statutory social security scheme"
            ],
            benefits=[
                "Guaranteed minimum pension of ₹1,000-₹5,000 per month",
                "Pension to spouse after subscriber's death",
                "Return of corpus to nominee",
                "Tax benefits under Section 80CCD"
            ],
            how_to_apply="Visit bank branch with savings account and fill APY form",
            official_website="https://www.npscra.nsdl.co.in/apy",
            documents_required=["Aadhaar Card", "Bank account details", "Mobile number"],
            target_audience=["Unorganized sector workers", "Self-employed", "Daily wage workers"],
            ministry="Ministry of Finance",
            is_central=True
        )
    ]
    
    result = await schemes_collection.insert_many(sample_schemes)
    app_logger.info(f"Seeded {len(result.inserted_ids)} sample schemes")


# CRUD Operations

async def create_scheme(scheme_data: dict) -> str:
    """Create a new scheme"""
    result = await schemes_collection.insert_one(scheme_data)
    return str(result.inserted_id)


async def get_scheme_by_id(scheme_id: str) -> Optional[dict]:
    """Get scheme by ID"""
    try:
        scheme = await schemes_collection.find_one({"_id": ObjectId(scheme_id)})
        return scheme
    except Exception as e:
        app_logger.error(f"Error fetching scheme: {str(e)}")
        return None


async def search_schemes(
    query: Optional[str] = None,
    category: Optional[str] = None,
    state: Optional[str] = None,
    is_central: Optional[bool] = None,
    skip: int = 0,
    limit: int = 20
) -> List[dict]:
    """
    Search schemes with filters.
    
    Args:
        query: Text search in name/description
        category: Filter by category
        state: Filter by state
        is_central: Filter central/state schemes
        skip: Pagination offset
        limit: Maximum results
        
    Returns:
        List of matching schemes
    """
    filter_dict = {}
    
    if query:
        filter_dict["$text"] = {"$search": query}
    
    if category:
        filter_dict["category"] = category
    
    if state:
        filter_dict["state"] = state
    
    if is_central is not None:
        filter_dict["is_central"] = is_central
    
    cursor = schemes_collection.find(filter_dict).skip(skip).limit(limit)
    schemes = await cursor.to_list(length=limit)
    
    return schemes


async def count_schemes(
    query: Optional[str] = None,
    category: Optional[str] = None,
    state: Optional[str] = None,
    is_central: Optional[bool] = None
) -> int:
    """Count schemes matching filters"""
    filter_dict = {}
    
    if query:
        filter_dict["$text"] = {"$search": query}
    
    if category:
        filter_dict["category"] = category
    
    if state:
        filter_dict["state"] = state
    
    if is_central is not None:
        filter_dict["is_central"] = is_central
    
    count = await schemes_collection.count_documents(filter_dict)
    return count


async def get_all_categories() -> List[str]:
    """Get all unique scheme categories"""
    categories = await schemes_collection.distinct("category")
    return categories


async def increment_scheme_views(scheme_id: str):
    """Increment view count for a scheme"""
    try:
        await schemes_collection.update_one(
            {"_id": ObjectId(scheme_id)},
            {"$inc": {"views_count": 1}}
        )
    except Exception as e:
        app_logger.error(f"Error incrementing views: {str(e)}")


async def log_scheme_search(user_id: str, query_text: str, filters: dict):
    """Log a scheme search query"""
    try:
        search_log = SchemeModel.create_search_query(query_text, user_id, filters)
        await scheme_searches_collection.insert_one(search_log)
    except Exception as e:
        app_logger.error(f"Error logging search: {str(e)}")
