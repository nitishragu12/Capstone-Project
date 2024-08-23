from datetime import datetime
import logging
import os
from flask import Flask
from flask_migrate import Migrate, upgrade
from flask_restx import Api
from config import Config
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
api = Api()
migrate = Migrate()
cors = CORS()
def create_app(config=None):
    app = Flask(__name__)
    
    if config is None:
        app.config.from_object(Config)
    else:
        app.config.from_object(config)
   
    cors.init_app(app)
    db.init_app(app)
    migrate.init_app(app, db)
    api.init_app(app, version='1.0.1',
                 title='PaperMate API',
                 description='A REST API for searching and rating road safety literature')
    
    from app.controllers.papers_controller import api as papers_ns
    api.add_namespace(papers_ns, path='/papers')

    from app.models.paper import Paper

    # Logging setup
    logger = init_logging()
    
    # Log application start
    logger.info(f'{api.title} started')

    # Return error messages if any Errors occur
    @app.errorhandler(Exception)
    def handle_error(error):
        # Log in the format: ErrorType: Message
        logger.error(f'{type(error).__name__}: {str(error)}')
        if app.debug:
            raise error
        return {'message': str(error)}, 500

    return app

def init_logging():
    # Logging setup
    logs_dir = 'logs'
    if not os.path.exists(logs_dir):
        os.makedirs(logs_dir)
        
    # File handler for application logs for current date
    today = datetime.now().strftime('%Y-%m-%d')
    file_handler = logging.FileHandler(f'{logs_dir}/{today}.log')
    file_handler.setLevel(logging.INFO)
    file_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(file_formatter)

    # Configure root logger
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.INFO)
    logger.addHandler(file_handler)

    return logger