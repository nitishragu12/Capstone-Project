import json
from flask import request, current_app as app
from flask_restx import Namespace, Resource, fields
from app.models.paper import Paper
from app.services.elsevier import ElsevierService
from app.services.gemini import GeminiService
import pandas as pd
from flask import make_response
from app.models.chat import Chat


api = Namespace('papers', description='Operations related to papers')
gemini = GeminiService()

paper_model = api.model('Paper', {
    'doi': fields.String(required=True, description='DOI of the paper'),
    'title': fields.String(required=True, description='Title of the paper'),
    'abstract': fields.String(required=True, description='Abstract of the paper'),
    'author': fields.String(required=True, description='Author of the paper'),
    'publication': fields.String(required=True, description='Publication name'),
    'publish_date': fields.Date(required=True, description='Cover date'),
    'url': fields.String(required=True, description='URL to the paper'),
    'relevance': fields.Float(description='Relevance to query'),
    'synopsis': fields.String(description='Synopsis of the paper'),
    'mutation': fields.String(description='Mutated json data of the paper')
})

@api.route('/')
class PaperList(Resource):
    @api.marshal_list_with(paper_model)
    def get(self):
        '''List all papers based on default query'''
        papers = ElsevierService.fetch_papers({'query': app.config['DEFAULT_QUERY']})
        return papers, 200

@api.route('/rate/<string:query>')
class Rate(Resource):
    @api.marshal_list_with(paper_model, code=200)
    @api.doc(params={'query': 'The criteria to rate papers.'})
    def put(self, query):
        '''Rate papers based on relevance to a query'''
        ElsevierService.fetch_papers({'query': query})
        papers = gemini.analyse_papers(query)
        return papers
    
@api.route('/mutate/<string:query>')
class Mutate(Resource):
    @api.marshal_list_with(paper_model, code=200)
    @api.doc(params={'query': 'The criteria to mutate papers.'})
    def put(self, query):
        '''Mutate papers based on a query'''
        papers = gemini.mutate_papers(query) # Result should contain only doi and mutation
        ElsevierService.update_papers(papers)
        return papers, 200

@api.route('/mutate_from_chat')
class MutateFromChat(Resource):
    def post(self):
        '''
        Extract relevant information from chat and update papers
        '''
        chat_id = request.args.get('chat', None)
        query = request.args.get('query', None)
        # Extract relevant information from chat
        mutated_papers, chat_id = gemini.mutate_papers(query, chat_id)
        # Update papers with mutated data
        ElsevierService.update_papers(mutated_papers)

        doi_list = [doi for doi in mutated_papers]
        # Get papers from database
        papers = ElsevierService.get_papers_by_dois(doi_list)
        response = {
            'data': [paper.mutation_dict() for paper in papers],
            'chat': chat_id
        }
        return response, 200

@api.route('/export')
class Export(Resource):
    def post(self):
        '''Export relevant papers to CSV'''
        # Get top 5 papers sorted by relevance
        papers = Paper.query.all()
        
        if not papers:
            return "No paper to export.", 404
        
        papers_dict = [paper.mutation_dict() for paper in papers]

        # Create DataFrame
        df = pd.DataFrame(papers_dict)

        # Convert DataFrame to CSV
        csv_data = df.to_csv(index=False)

        # Create a response object and set the headers for downloading
        response = make_response(csv_data)
        response.headers['Content-Disposition'] = 'attachment; filename=top_20_papers.csv'
        response.headers['Content-Type'] = 'text/csv'
        return response

    
@api.route('/search')
class PaperSearch(Resource):
    @api.marshal_list_with(paper_model)
    def get(self):
        '''Search papers based on query parameters'''
        # Extract query parameters
        query = request.args.get('query', app.config['DEFAULT_QUERY'])
        title = request.args.get('title', None)
        author = request.args.get('author', None)
        publications = request.args.get('publications', None)
        from_date = request.args.get('fromDate', None)
        to_date = request.args.get('toDate', None)
        
        # Build query
        query_params = {
            'query': query,
            'title': title,
            'author': author,
            'publications': publications,
            'fromDate': from_date,
            'toDate': to_date
        }
        
        # Search through Elsevier API
        papers = ElsevierService.fetch_papers(query_params)
        if not papers:
            return 'No papers found, try other search query.', 404

        # Rate papers using Gemini API
        gemini = GeminiService()
        papers_rated = gemini.analyse_papers(query_params.get('query'))
        
        return papers_rated, 200
    
@api.route('/getTotalCount')
class get_total_count(Resource):
    def get(self):
        params = request.args.to_dict()
        total_count = ElsevierService.get_total_count(params)
        return {'total_count': total_count}, 200
