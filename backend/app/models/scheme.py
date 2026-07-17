"""
Government Scheme Data Models

MongoDB document structures for government schemes data.
"""

from datetime import datetime
from typing import List, Optional, Dict


class SchemeModel:
    """Government scheme model"""
    
    @staticmethod
    def create_scheme(
        name: str,
        description: str,
        category: str,
        eligibility: List[str],
        benefits: List[str],
        how_to_apply: str,
        official_website: Optional[str] = None,
        contact_info: Optional[Dict] = None,
        documents_required: Optional[List[str]] = None,
        target_audience: Optional[List[str]] = None,
        ministry: Optional[str] = None,
        state: Optional[str] = None,
        is_central: bool = True
    ) -> dict:
        """
        Create a government scheme document.
        
        Args:
            name: Scheme name
            description: Detailed description
            category: Category (health, education, agriculture, employment, housing, etc.)
            eligibility: List of eligibility criteria
            benefits: List of benefits provided
            how_to_apply: Application process description
            official_website: Optional website URL
            contact_info: Optional contact information dict
            documents_required: Optional list of required documents
            target_audience: Optional target groups
            ministry: Optional ministry name
            state: Optional state (for state schemes)
            is_central: True for central schemes, False for state schemes
            
        Returns:
            Scheme document
        """
        return {
            "name": name,
            "description": description,
            "category": category,
            "eligibility": eligibility,
            "benefits": benefits,
            "how_to_apply": how_to_apply,
            "official_website": official_website,
            "contact_info": contact_info or {},
            "documents_required": documents_required or [],
            "target_audience": target_audience or [],
            "ministry": ministry,
            "state": state,
            "is_central": is_central,
            "views_count": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    
    @staticmethod
    def create_search_query(query_text: str, user_id: str, filters: Optional[dict] = None) -> dict:
        """Create a search query log document"""
        return {
            "user_id": user_id,
            "query_text": query_text,
            "filters": filters or {},
            "created_at": datetime.utcnow()
        }
