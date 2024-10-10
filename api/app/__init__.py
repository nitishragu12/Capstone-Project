from datetime import datetime
import logging
import os
from flask import Flask, jsonify
from flask_restx import Api
from werkzeug.exceptions import BadRequest
from flask_socketio import SocketIO
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from config import Config


db = SQLAlchemy()
api = Api()
cors = CORS()
socketio = SocketIO()


def create_app(config=None):
    app = Flask(__name__)

    if config is None:
        app.config.from_object(Config)
    else:
        app.config.from_object(config)
    # Enable CORS for 3000 port
    cors_origin = os.getenv('CORS_ORIGIN', 'http://localhost:3000')
    cors.init_app(app, resources={r"/papers/*": {"origins": cors_origin}})
    socketio.init_app(app, cors_allowed_origins=cors_origin)
    db.init_app(app)
    api.init_app(app, version='1.0.1',
                 title='PaperMate API',
                 description='A REST API for searching and rating road safety literature')
    # Logging setup
    logger = init_logging()
    # Log application start
    logger.info(f'{api.title} started')

    from app.controllers.papers_controller import api as papers_ns
    api.add_namespace(papers_ns, path='/papers')

    # Load secrets from Docker secrets path
    try:
        with open('/run/secrets/llm_api_key', 'r') as file:
            app.config['LLM_API_KEY'] = file.read().strip()

        with open('/run/secrets/els_api_key', 'r') as file:
            app.config['ELS_API_KEY'] = file.read().strip()

        with open('/run/secrets/els_token', 'r') as file:
            app.config['ELS_TOKEN'] = file.read().strip()
    except FileNotFoundError:
        logger.warning('Secrets not found in Docker secrets path. Loading from environment variables.')
        app.config['LLM_API_KEY'] = os.environ.get('LLM_API_KEY')
        app.config['ELS_API_KEY'] = os.environ.get('ELS_API_KEY')
        app.config['ELS_TOKEN'] = os.environ.get('ELS_TOKEN')
        pass

    # Return error messages if any Errors occur
    @app.errorhandler(Exception)
    def handle_error(error):
        # Log in the format: ErrorType: Message
        logger.error(f'{type(error).__name__}: {str(error)}')
        if app.debug:
            raise error
        status_code = 500
        if isinstance(error, BadRequest):
            status_code = 400
        response = {
            "error": type(error).__name__,
            "message": str(error)
        }
        return jsonify(response), status_code

    # Create database
    with app.app_context():
        # Delete and recreate database
        db.drop_all()
        db.create_all()

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
