import pytest


@pytest.fixture
def client():
    from app import create_app
    app = create_app()
    with app.test_client() as client:
        yield client


def test_mutate_from_chat(client):
    # Test Request
    response = client.post('/papers/mutate_from_chat', json={
        'chat_id': 'test_id',
        'query': 'test_query',
        'model': 'false'
    })

    # Assert the returned status code
    assert response.status_code == 200

    # Check whether the returned JSON data meets expectations
    data = response.get_json()
    assert 'papers' in data
    assert 'chat' in data
