"""
Database integration with Supabase
"""
from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_KEY
from typing import List, Dict, Optional
from datetime import datetime


class ProcurementDatabase:
    """Handles database operations for procurement data"""

    def __init__(self):
        self.client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    def insert_procurement(self, procurement: Dict) -> Optional[Dict]:
        """
        Insert or update a procurement in the database

        Args:
            procurement: Procurement dictionary with required fields

        Returns:
            Inserted/updated procurement or None if error
        """
        try:
            # Ensure required fields
            data = {
                'title': procurement.get('title', 'Ei otsikkoa'),
                'organization': procurement.get('organization', 'Ei tiedossa'),
                'description': procurement.get('description', ''),
                'deadline': procurement.get('deadline'),
                'budget_estimate': procurement.get('budget_estimate'),
                'source_url': procurement.get('source_url', ''),
                'cpv_codes': procurement.get('cpv_codes', []),
                'external_id': procurement.get('external_id'),
                'source_platform': procurement.get('source_platform', 'UNKNOWN'),
                'scraped_at': procurement.get('scraped_at', datetime.utcnow().isoformat()),
                'published_at': procurement.get('published_at', datetime.utcnow().isoformat()),

                # AI analysis fields (will be filled later)
                'ai_summary': procurement.get('ai_summary'),
                'ai_analysis': procurement.get('ai_analysis'),
                'category': procurement.get('category'),
                'ai_match_score': procurement.get('ai_match_score'),
                'ai_recommended_bid': procurement.get('ai_recommended_bid'),
                'ai_competition_analysis': procurement.get('ai_competition_analysis'),
            }

            # Use upsert to avoid duplicates based on external_id
            result = self.client.table('hankinnat').upsert(
                data,
                on_conflict='external_id'
            ).execute()

            if result.data:
                print(f"[OK] Saved: {data['title'][:50]}...")
                return result.data[0]
            else:
                print(f"[X] Failed to save: {data['title'][:50]}...")
                return None

        except Exception as e:
            print(f"Database error: {e}")
            return None

    def bulk_insert_procurements(self, procurements: List[Dict]) -> List[Dict]:
        """
        Insert multiple procurements at once

        Args:
            procurements: List of procurement dictionaries

        Returns:
            List of successfully inserted procurements
        """
        inserted = []
        for procurement in procurements:
            result = self.insert_procurement(procurement)
            if result:
                inserted.append(result)

        return inserted

    def get_procurement_by_external_id(self, external_id: str) -> Optional[Dict]:
        """Get a procurement by its external ID"""
        try:
            result = self.client.table('hankinnat').select('*').eq('external_id', external_id).execute()

            if result.data:
                return result.data[0]
            return None

        except Exception as e:
            print(f"Database error: {e}")
            return None

    def update_procurement_analysis(self, procurement_id: str, analysis: Dict) -> bool:
        """
        Update AI analysis fields for a procurement

        Args:
            procurement_id: UUID of the procurement
            analysis: Dictionary with AI analysis results

        Returns:
            True if successful, False otherwise
        """
        try:
            result = self.client.table('hankinnat').update({
                'ai_summary': analysis.get('ai_summary'),
                'ai_analysis': analysis.get('ai_analysis'),
                'category': analysis.get('category'),
                'ai_recommended_bid': analysis.get('ai_recommended_bid'),
                'updated_at': datetime.utcnow().isoformat()
            }).eq('id', procurement_id).execute()

            return len(result.data) > 0

        except Exception as e:
            print(f"Database error: {e}")
            return False

    def get_recent_procurements(self, limit: int = 20) -> List[Dict]:
        """Get most recent procurements"""
        try:
            result = self.client.table('hankinnat').select('*').order('published_at', desc=True).limit(limit).execute()

            return result.data if result.data else []

        except Exception as e:
            print(f"Database error: {e}")
            return []

    def get_procurements_without_analysis(self, limit: int = 10) -> List[Dict]:
        """Get procurements that haven't been analyzed yet"""
        try:
            result = self.client.table('hankinnat').select('*').is_('ai_summary', 'null').limit(limit).execute()

            return result.data if result.data else []

        except Exception as e:
            print(f"Database error: {e}")
            return []

    def get_user_profiles(self) -> List[Dict]:
        """Get all user profiles for matching analysis"""
        try:
            result = self.client.table('profiles').select('id, ai_profile_description').not_.is_('ai_profile_description', 'null').execute()

            return result.data if result.data else []

        except Exception as e:
            print(f"Database error: {e}")
            return []


# Test function
if __name__ == "__main__":
    db = ProcurementDatabase()

    print("Testing database connection...")

    # Test fetching recent procurements
    procurements = db.get_recent_procurements(limit=5)
    print(f"\nFound {len(procurements)} recent procurements:")
    for p in procurements:
        print(f"- {p['title'][:50]}... ({p['organization']})")

    # Test fetching profiles
    profiles = db.get_user_profiles()
    print(f"\nFound {len(profiles)} user profiles with AI descriptions")
