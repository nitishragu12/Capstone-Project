import os

basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    BATCH_SIZE = 5

    SECRET_KEY = os.environ.get('SECRET_KEY')  # for session management

    LLM_MODEL_NAMES = 'gemini-1.5-flash,gemini-1.5-pro'

    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'app.db')

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SESSION_COOKIE_HTTPONLY = True

    REMEMBER_COOKIE_HTTPONLY = True

    SESSION_COOKIE_SAMESITE = "Lax"


class TestingConfig(Config):
    TESTING = True

    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'  # Use in-memory database for testing

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    DEBUG = True
