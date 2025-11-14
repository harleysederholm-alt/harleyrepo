"""
HILMA Scraper - Scrapes Finnish public procurement notices
from https://www.hankintailmoitukset.fi
"""
import requests
from bs4 import BeautifulSoup
import time
import re
from datetime import datetime
from typing import List, Dict
from config import USER_AGENT, REQUEST_TIMEOUT, RETRY_ATTEMPTS, RATE_LIMIT_DELAY
import dateparser


class HilmaScraper:
    """Scrapes procurement notices from HILMA"""

    def __init__(self):
        self.base_url = 'https://www.hankintailmoitukset.fi'
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': USER_AGENT})

    def scrape_latest_procurements(self, max_results: int = 50) -> List[Dict]:
        """
        Scrape latest procurement notices from HILMA

        Args:
            max_results: Maximum number of results to return

        Returns:
            List of procurement dictionaries
        """
        procurements = []

        try:
            # HILMA search page
            search_url = f'{self.base_url}/fi/public/procurement/search'

            print(f"Fetching from HILMA: {search_url}")

            response = self.session.get(
                search_url,
                timeout=REQUEST_TIMEOUT
            )
            response.raise_for_status()

            soup = BeautifulSoup(response.content, 'html.parser')

            # Find procurement listings
            # Note: This is a template - actual selectors need to be updated based on HILMA's current HTML structure
            procurement_items = soup.select('.procurement-item, .notice-row, article.procurement')

            print(f"Found {len(procurement_items)} procurement items")

            for item in procurement_items[:max_results]:
                try:
                    procurement = self._parse_procurement_item(item)
                    if procurement:
                        procurements.append(procurement)
                        print(f"Scraped: {procurement['title'][:50]}...")

                except Exception as e:
                    print(f"Error parsing item: {e}")
                    continue

                # Rate limiting
                time.sleep(RATE_LIMIT_DELAY)

        except Exception as e:
            print(f"Error scraping HILMA: {e}")

        return procurements

    def _parse_procurement_item(self, item) -> Dict:
        """Parse a single procurement item from HTML"""

        # Extract title
        title_elem = item.select_one('h2, h3, .title, .notice-title, a.procurement-link')
        title = title_elem.text.strip() if title_elem else 'Ei otsikkoa'

        # Extract organization
        org_elem = item.select_one('.organization, .buyer, .contracting-authority')
        organization = org_elem.text.strip() if org_elem else 'Ei tiedossa'

        # Extract description
        desc_elem = item.select_one('.description, .summary, .notice-description, p')
        description = desc_elem.text.strip() if desc_elem else ''

        # Extract deadline
        deadline_elem = item.select_one('.deadline, .tender-deadline, .submission-date, time')
        deadline = None
        if deadline_elem:
            deadline_text = deadline_elem.text.strip()
            # Parse Finnish date
            parsed_date = dateparser.parse(
                deadline_text,
                languages=['fi'],
                settings={'PREFER_DATES_FROM': 'future'}
            )
            if parsed_date:
                deadline = parsed_date.strftime('%Y-%m-%d')

        # Extract budget if available
        budget_elem = item.select_one('.budget, .estimated-value, .value')
        budget_estimate = None
        if budget_elem:
            budget_text = budget_elem.text.strip()
            # Extract numbers from text
            numbers = re.findall(r'\d+(?:\s?\d+)*', budget_text.replace(',', '').replace('.', ''))
            if numbers:
                try:
                    budget_estimate = int(numbers[0])
                except:
                    pass

        # Extract source URL
        link_elem = item.select_one('a[href]')
        source_url = self.base_url + link_elem['href'] if link_elem and link_elem.get('href') else self.base_url

        # Make sure URL is absolute
        if not source_url.startswith('http'):
            source_url = self.base_url + source_url

        # Extract CPV codes if available
        cpv_codes = []
        cpv_elem = item.select('.cpv-code, .cpv')
        if cpv_elem:
            cpv_codes = [elem.text.strip() for elem in cpv_elem]

        # Create unique external ID
        external_id = f"hilma_{title[:50]}_{organization[:30]}".lower()
        external_id = re.sub(r'[^a-z0-9_]', '_', external_id)

        return {
            'title': title,
            'organization': organization,
            'description': description,
            'deadline': deadline,
            'budget_estimate': budget_estimate,
            'source_url': source_url,
            'cpv_codes': cpv_codes,
            'external_id': external_id,
            'source_platform': 'HILMA',
            'scraped_at': datetime.utcnow().isoformat()
        }

    def scrape_procurement_details(self, url: str) -> Dict:
        """
        Scrape detailed information from a specific procurement page

        Args:
            url: URL of the procurement notice

        Returns:
            Dictionary with detailed procurement information
        """
        try:
            response = self.session.get(url, timeout=REQUEST_TIMEOUT)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, 'html.parser')

            # Extract more detailed information
            # This is a template - update selectors based on actual HTML structure
            details = {
                'full_description': '',
                'requirements': '',
                'contact_info': '',
                'documents': []
            }

            # Full description
            desc_elem = soup.select_one('.full-description, .notice-content, main article')
            if desc_elem:
                details['full_description'] = desc_elem.get_text(strip=True, separator='\n')

            # Requirements
            req_elem = soup.select_one('.requirements, .conditions')
            if req_elem:
                details['requirements'] = req_elem.get_text(strip=True, separator='\n')

            # Contact information
            contact_elem = soup.select_one('.contact, .contact-info')
            if contact_elem:
                details['contact_info'] = contact_elem.get_text(strip=True, separator='\n')

            # Documents
            doc_links = soup.select('a[href*=".pdf"], a[href*="/document/"]')
            for link in doc_links:
                doc_url = link.get('href', '')
                if doc_url and not doc_url.startswith('http'):
                    doc_url = self.base_url + doc_url
                details['documents'].append({
                    'name': link.text.strip(),
                    'url': doc_url
                })

            return details

        except Exception as e:
            print(f"Error scraping procurement details: {e}")
            return {}


# Test function
if __name__ == "__main__":
    scraper = HilmaScraper()

    print("Testing HILMA scraper...")
    procurements = scraper.scrape_latest_procurements(max_results=5)

    print(f"\nScraped {len(procurements)} procurements:")
    for p in procurements:
        print(f"\n- {p['title']}")
        print(f"  Organization: {p['organization']}")
        print(f"  Deadline: {p['deadline']}")
        print(f"  URL: {p['source_url']}")
