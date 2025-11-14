"""
Main scraper orchestrator
Coordinates scraping, AI analysis, and database storage
"""
import time
from datetime import datetime
from hilma_scraper import HilmaScraper
from ai_analyzer import ProcurementAnalyzer
from database import ProcurementDatabase
from config import PROCUREMENT_SITES


class ScraperOrchestrator:
    """Orchestrates the entire scraping and analysis pipeline"""

    def __init__(self):
        self.hilma_scraper = HilmaScraper()
        self.analyzer = ProcurementAnalyzer()
        self.db = ProcurementDatabase()

    def run_full_pipeline(self, max_results: int = 50):
        """
        Run the complete scraping and analysis pipeline

        1. Scrape procurements from HILMA
        2. Save to database
        3. Run AI analysis on new procurements
        4. Update database with analysis results
        """
        print("=" * 60)
        print(f"Starting scraper pipeline at {datetime.now()}")
        print("=" * 60)

        # Step 1: Scrape new procurements
        print("\n[1/4] Scraping HILMA...")
        procurements = self.hilma_scraper.scrape_latest_procurements(max_results=max_results)
        print(f"[OK] Scraped {len(procurements)} procurements")

        if not procurements:
            print("No procurements found. Exiting.")
            return

        # Step 2: Save to database
        print("\n[2/4] Saving to database...")
        saved = self.db.bulk_insert_procurements(procurements)
        print(f"[OK] Saved {len(saved)} procurements to database")

        # Step 3: Analyze procurements
        print("\n[3/4] Running AI analysis...")
        analyzed_count = 0

        # Get procurements that need analysis
        to_analyze = self.db.get_procurements_without_analysis(limit=max_results)
        print(f"Found {len(to_analyze)} procurements without analysis")

        for procurement in to_analyze:
            try:
                print(f"\nAnalyzing: {procurement['title'][:50]}...")

                # Run AI analysis
                analysis = self.analyzer.analyze_procurement(procurement)

                # Update database
                success = self.db.update_procurement_analysis(
                    procurement['id'],
                    analysis
                )

                if success:
                    analyzed_count += 1
                    print(f"  [OK] Category: {analysis['category']}")
                    print(f"  [OK] Summary: {analysis['ai_summary'][:80]}...")

                # Small delay to respect API rate limits
                time.sleep(1)

            except Exception as e:
                print(f"  [X] Error analyzing: {e}")
                continue

        print(f"\n[OK] Analyzed {analyzed_count} procurements")

        # Step 4: Match with user profiles (optional)
        print("\n[4/4] Matching with user profiles...")
        profiles = self.db.get_user_profiles()
        print(f"Found {len(profiles)} user profiles")

        # For now, we skip individual user matching as it's done on-demand in the app
        # But we could batch-process match scores here if needed

        print("\n" + "=" * 60)
        print(f"Pipeline complete at {datetime.now()}")
        print(f"Total procurements processed: {len(saved)}")
        print(f"Total procurements analyzed: {analyzed_count}")
        print("=" * 60)

    def analyze_existing_procurements(self, limit: int = 10):
        """
        Analyze existing procurements that don't have AI analysis yet
        """
        print("\nAnalyzing existing procurements...")

        to_analyze = self.db.get_procurements_without_analysis(limit=limit)
        print(f"Found {len(to_analyze)} procurements without analysis")

        analyzed_count = 0
        for procurement in to_analyze:
            try:
                print(f"\nAnalyzing: {procurement['title'][:50]}...")

                analysis = self.analyzer.analyze_procurement(procurement)

                success = self.db.update_procurement_analysis(
                    procurement['id'],
                    analysis
                )

                if success:
                    analyzed_count += 1
                    print(f"  [OK] Category: {analysis['category']}")

                time.sleep(1)

            except Exception as e:
                print(f"  [X] Error: {e}")
                continue

        print(f"\n[OK] Analyzed {analyzed_count} procurements")


def main():
    """Main entry point"""
    print("""
====================================================
   PienHankinta-Vahti Scraper & Analyzer
   Finnish Public Procurement Intelligence
====================================================
    """)

    orchestrator = ScraperOrchestrator()

    # Run the full pipeline
    orchestrator.run_full_pipeline(max_results=20)

    # Optionally, analyze any existing procurements without analysis
    # orchestrator.analyze_existing_procurements(limit=10)


if __name__ == "__main__":
    main()
