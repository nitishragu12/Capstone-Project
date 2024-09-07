import json
from flask import current_app as app
from datetime import datetime
import requests
from app.models.paper import Paper
from app import db

class ElsevierService:
    api_key = None
    inst_token = None
    headers = None

    @classmethod
    def set_api_key(cls):
        cls.api_key = app.config.get('ELS_API_KEY')
        cls.inst_token = app.config.get('ELS_TOKEN')
        if not cls.api_key:
            raise ValueError('Missing API key for Elsevier.')
        cls.headers = {
            'X-ELS-APIKey': cls.api_key,
            'X-ELS-Insttoken': cls.inst_token,
            'Accept': 'application/json'
        }

    @staticmethod
    def update_papers(papers: dict):
        """Update papers in the database with mutated data."""
        for doi, mutation in papers.items():
            paper = Paper.query.filter_by(doi=doi).first()
            if paper:
                paper.mutation = json.dumps(mutation)
                db.session.commit()

    @staticmethod
    def get_papers_by_dois(doi_list: list):
        """Retrieve papers from the database by DOI list."""
        return [Paper.query.filter_by(doi=doi).first() for doi in doi_list if Paper.query.filter_by(doi=doi).first()]

    @staticmethod
    def fetch_papers(params: dict):
        """Fetch papers from Elsevier API based on query parameters."""
        ElsevierService.set_api_key()
        ElsevierService.delete_papers()

        params.setdefault('start', 0)
        params['query'] = params.get('query')
        if not params['query']:
            raise ValueError('Missing query parameter for Elsevier.')
        query = ElsevierService.build_query(params) 

        scopus_url = f"https://api.elsevier.com/content/search/scopus?query={query}&count=5&start={params['start']}"
        scopus_res = requests.get(scopus_url, headers=ElsevierService.headers)
        if scopus_res.status_code != 200:
            raise ValueError(f'Error fetching papers from Elsevier (Scopus: {scopus_res.status_code})')

        scopus_data = scopus_res.json().get('search-results', {})
        papers = ElsevierService.transform_entries(scopus_data, params)
        db.session.add_all(papers)
        db.session.commit()
        return papers

    @staticmethod
    def build_query(params):
        """Build query string from parameters."""

        for date_key in ['fromDate', 'toDate']:
            if params.get(date_key) and isinstance(params[date_key], str):
                params[date_key] = datetime.strptime(params[date_key], '%d-%m-%Y').date()

        query_parts = [f"{field}({value})" for field, value in {
            'TITLE-ABS-KEY': params.get('query'),
            'TITLE': params.get('title'),
            'AUTHOR-NAME': params.get('author'),
        }.items() if value]

        if params.get('publications'):
            sources = ' or '.join([f'"{source}"' for source in params['publications'].split(',')])
            query_parts.append(f"SRCTITLE({sources})")

        if params.get('fromDate') and params.get('toDate'):
            fromDate = params['fromDate']
            toDate = params['toDate']
            # Get all months between the two dates, e.g. "PUBDATETXT('January 2021' or 'February 2021' or 'March 2021')"
            months = ElsevierService.months_in_range(fromDate, toDate)
            query_parts.append(f"PUBDATETXT({ ' or '.join(months) })")
            
        print(query_parts)
        return ' AND '.join(query_parts)
    
    @staticmethod
    def months_in_range(from_date, to_date):
        """Get all months between two dates."""
        months = []
        current_year = from_date.year
        current_month = from_date.month
        while current_year < to_date.year or (current_year == to_date.year and current_month <= to_date.month):
            month_str = '"' + datetime(current_year, current_month, 1).strftime('%B %Y') + '"'
            months.append(month_str)
            current_month += 1
            if current_month > 12:
                current_month = 1
                current_year += 1
        return months

    @staticmethod
    def transform_entries(response, params):
        """Transform Elsevier API response entries into Paper objects."""
        papers = []
        for entry in response.get('entry', []):
            paper = Paper(
                title=entry.get('dc:title', 'No Title'),
                author=entry.get('dc:creator', 'Unknown Author'),
                publication=entry.get('prism:publicationName', 'No Publication Name'),
                publish_date=datetime.strptime(entry.get('prism:coverDate', '1970-01-01'), '%Y-%m-%d').date(),
                doi=entry.get('prism:doi'),
                abstract=ElsevierService.get_abstract(entry.get('prism:doi')) if entry.get('prism:doi') else "No Abstract.",
                url=f"https://doi.org/{entry.get('prism:doi')}" if entry.get('prism:doi') else None
            )
            papers.append(paper)
        return papers

    @staticmethod
    def get_abstract(doi: str):
        """Fetch abstract for a paper from Elsevier API by DOI."""
        ElsevierService.set_api_key()
        url = f"https://api.elsevier.com/content/abstract/doi/{doi}"
        res = requests.get(url, headers=ElsevierService.headers)
        if res.status_code != 200:
            raise ValueError(f'Error fetching paper abstract from Elsevier ({res.status_code})')
        return res.json().get('abstracts-retrieval-response', {}).get('coredata', {}).get('dc:description', 'No Abstract')

    @staticmethod
    def delete_papers():
        """Delete all papers from the database."""
        db.session.query(Paper).delete()
        db.session.commit()

    @staticmethod
    def get_total_count(params: dict) -> int:
        """Fetch total count of papers from Elsevier API based on query parameters."""
        ElsevierService.set_api_key()
        params.setdefault('start', 0)
        params['query'] = params.get('query')
        if not params['query']:
            raise ValueError('Missing query parameter for Elsevier.')
        query = ElsevierService.build_query(params)

        scopus_url = f"https://api.elsevier.com/content/search/scopus?query={query}&count=0"
        scopus_res = requests.get(scopus_url, headers=ElsevierService.headers)
        if scopus_res.status_code != 200:
            raise ValueError(f'Error fetching total count from Elsevier (Scopus: {scopus_res.status_code})')

        return int(scopus_res.json().get('search-results', {}).get('opensearch:totalResults', 0))
