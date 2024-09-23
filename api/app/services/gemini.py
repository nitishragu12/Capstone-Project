import json
from sqlite3 import DataError, OperationalError
from flask import current_app as app, session
from app import db
from app.models.paper import Paper
from app.models.chat import Chat
import google.generativeai as genai

class GeminiService:
    model = None
    model_name = None
    api_key = None

    @classmethod
    def load_model(cls, name:str=None):
        """Load the LLM model if not already loaded."""
        if not cls.api_key:
            # Load the API key once from the config
            cls.api_key = app.config.get('LLM_API_KEY')
            if not cls.api_key:
                raise ValueError('Missing API key for LLM')

        if name:
            # If a name is provided, use it, otherwise default to config value
            model_name = name
        else:
            model_name = app.config.get("LLM_MODEL_NAMES", "gemini-1.5-flash").split(',')[0]

        if cls.model is None or (name and cls.model_name != name):
            app.logger.info(f'Swithcing model: {model_name}')
            # Only load a new model if the model name has changed
            genai.configure(api_key=cls.api_key)
            system_instruction = '''
                1. This is a system for automating search, scanning, and analysis for literature.
                2. Researchers are the main users.
                3. Based on the given query, you may need to rate or add columns to the data.
                4. Store data in a fixed format:
                [ { doi: mutation: { ... } }, ... ]
                5. Only include doi as object ID in JSON response to avoid long text.
                6. If user query is to rate, follow column naming e.g. rate based on keyword = `relevance_keyword`.
            '''
            cls.model = genai.GenerativeModel(
                model_name,
                system_instruction=system_instruction,
                generation_config={'response_mime_type': 'application/json'}
            )
            cls.model_name = model_name
    
    def create_prompt(self, papers, query):
        """Create a structured prompt from the papers and query."""
        if not papers:
            raise ValueError('No papers to rate.', 404)
        
        papers_dict = {paper.doi: {'title': paper.title, 'abstract': paper.abstract} for paper in papers}
        prompt = json.dumps(papers_dict)
        prompt += f'''
        For the data above, mutate the data based on query: {query}
        Return the mutated data using doi as key. No nested structure.
        Exclude title and abstract from the result.
        '''
        return prompt
    
    def analyse_papers(self, papers: list, query, model_name=None):
        """
        Generate relevance and synopsis for papers based on a query.

        Args:
            papers: The papers to rate.
            query: The criteria to rate papers.

        Returns:
            The rated papers.

        Raises:
            ValueError: If no query or invalid response from Gemini.
        """
        
        GeminiService.load_model(model_name)

        if not query:
            raise ValueError('Missing query for rating papers.', 400)

        # Generate content
        query += '\nRate the relevance on scale of 0-10 and provide a synopsis for the papers.'
        prompt = self.create_prompt(papers, query)
        response = self.model.generate_content(prompt)

        try:
            papers_json = json.loads(response.text)
            for doi, analysis in papers_json.items():
                paper = Paper.query.filter_by(doi=doi).first()
                # Update relevance by get key starting with 'relevance_'
                for key, value in analysis.items():
                    if key.startswith('relevance_'):
                        paper.relevance = value
                    elif key.startswith('synopsis'):
                        paper.synopsis = value
            db.session.commit()
            return papers
        except json.JSONDecodeError:
            print(response.text)
            raise ValueError('Invalid response from Gemini', 500)
    
    def mutate_papers(self, papers, query, chat_id=None, model_name=None):
        """
        Mutate papers based on a query.

        Args:
            query: The criteria to mutate papers.
            chat_id: The ID of the chat to continue from.

        Returns:
            The mutated papers in JSON format and the chat ID.

        Raises:
            ValueError: If no query or invalid response from Gemini.
        """
        GeminiService.load_model(model_name)

        if not query:
            raise ValueError('Missing query to interact with Gemini', 400)
        
        # Prepare chat history
        parent_chat = Chat.query.get(chat_id) if chat_id else None

        current_chat = Chat(history=[])
        # Get chat history
        history = []
        if parent_chat:
            current_chat.parent_id = parent_chat.id
            # Load the parent chat history
            for content in parent_chat.history:
                history.append(content)
            # Load the child chat history
            chats = parent_chat.chats.all()
            for chat in chats:
                for content in chat.history:
                    history.append(content)
        db.session.add(current_chat)
        
        prompt = self.create_prompt(papers, query)
        session = GeminiService.model.start_chat(history=history)
        response = session.send_message(prompt)

        try:
            papers_json = json.loads(response.text)
        except json.JSONDecodeError:
            raise ValueError('Invalid response from Gemini', 500)
        

        # Save chat history
        user_content = { 'role': 'user', 'parts': [ { 'text': query } ] }
        model_content = { 'role': 'model', 'parts': [ { 'text': response.text } ] }
        # Content(parts=[Part(text=query)], role='user'),
        # Content(parts=[Part(text=response.text)], role='model')
        current_chat.history.append(user_content)
        current_chat.history.append(model_content)
        db.session.commit()

        id = parent_chat.id if parent_chat else current_chat.id # For tracking the chat
        return papers_json, id