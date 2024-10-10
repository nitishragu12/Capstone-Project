import unittest
from unittest.mock import patch

from config import TestingConfig
from app import create_app


class TestPaperTotalCount(unittest.TestCase):

    def setUp(self):
        # Initialize the Flask application using the test configuration
        self.app = create_app(TestingConfig)
        self.client = self.app.test_client()  # Creating a test client
        self.app_context = self.app.app_context()
        self.app_context.push()

    def tearDown(self):
        self.app_context.pop()  # Clean up the app context

    @patch('app.services.elsevier.ElsevierService.get_total_count')  # Mock ElsevierService
    def test_get_total_count(self, mock_get_total_count):
        # Set mock return value
        mock_get_total_count.return_value = 5

        # Simulate a GET request to the '/getTotalCount' route
        response = self.client.get('/papers/getTotalCount?query=test')

        # Check status code
        self.assertEqual(response.status_code, 200)

        # Access JSON response data using response.get_json()
        json_data = response.get_json()

        # Check the returned total_count value
        self.assertEqual(json_data['total_count'], 5)


if __name__ == '__main__':
    unittest.main()
