import pytest
from app import app, get_stories

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_get_stories():
    """Test that get_stories returns the correct structure"""
    stories = get_stories()
    assert isinstance(stories, list)
    for story in stories:
        assert 'name' in story
        assert 'title' in story
        assert 'description' in story

def test_index_route(client):
    """Test the index route returns 200"""
    response = client.get('/')
    assert response.status_code == 200

def test_story_route_valid(client):
    """Test that valid story routes work"""
    response = client.get('/stories/demo')
    assert response.status_code == 200

def test_story_route_invalid(client):
    """Test that invalid story routes return 404"""
    response = client.get('/stories/nonexistent')
    assert response.status_code == 404

def test_story_js_route(client):
    """Test that story JS files can be served"""
    response = client.get('/stories/js/demo/demo.js')
    assert response.status_code == 200

def test_favicon_route(client):
    """Test that favicon.ico can be served"""
    response = client.get('/favicon.ico')
    assert response.status_code == 200
    assert response.mimetype == 'image/x-icon' 