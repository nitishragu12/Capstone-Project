import os
import json
import unittest
from datetime import datetime

from config import TestingConfig
from app import create_app
from app.models.paper import db, Paper


class TestPaperListService(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Create an application and push the context
        cls.app = create_app(TestingConfig)
        cls.app_context = cls.app.app_context()
        cls.app_context.push()

        # Create database tables
        db.create_all()

        # Read the sample.json file
        with open(os.path.join(os.path.dirname(__file__), '../sample.json')) as f:
            sample_data = json.load(f)

        # Insert the first data in sample_data into the database
        paper_data = sample_data[0]  # Use the first data

        # Convert a string date to a datetime.date object
        publish_date = datetime.strptime(paper_data['publish_date'], '%Y-%m-%d').date()

        paper = Paper(
            doi=paper_data['doi'],
            title=paper_data['title'],
            author=paper_data['author'],
            publication=paper_data['publication'],
            publish_date=publish_date,  # Use the converted date
            abstract=paper_data['abstract'],
            synopsis=paper_data['synopsis'],
            relevance=paper_data['relevance'],
            url=paper_data['url']
        )

        db.session.add(paper)
        db.session.commit()  # Commit the transaction

    @classmethod
    def tearDownClass(cls):
        db.session.remove()
        db.drop_all()  # Drop the database tables
        cls.app_context.pop()  # Pop the application context

    def test_sample_paper_inserted(self):
        with self.app.app_context():
            paper = Paper.query.filter_by(
                title="Enhanced Generalization Performance in Deep Learning for Monitoring Driver Distraction: A Systematic Review"
            ).first()
            self.assertIsNotNone(paper)


if __name__ == '__main__':
    unittest.main()
