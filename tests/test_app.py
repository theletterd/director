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

def test_story_page_loads_story_js(client):
    """The story page references its JS, and that file is served"""
    page = client.get('/stories/demo').get_data(as_text=True)
    assert '/static/js/stories/demo.js' in page
    assert client.get('/static/js/stories/demo.js').status_code == 200


def test_story_page_includes_story_css(client):
    """Stories with a css entry get their stylesheet"""
    page = client.get('/stories/ziggy').get_data(as_text=True)
    assert '/static/css/stories/ziggy.css' in page


def test_all_story_assets_exist():
    """Every configured js/css file is actually present"""
    import os
    from configs.story_config import STORY_CONFIG
    for name, config in STORY_CONFIG.items():
        assert os.path.isfile(os.path.join('static/js/stories', config['js'])), name
        if 'css' in config:
            assert os.path.isfile(os.path.join('static/css/stories', config['css'])), name

def test_favicon_route(client):
    """Test that favicon.ico can be served"""
    response = client.get('/favicon.ico')
    assert response.status_code == 200
    assert response.mimetype == 'image/png' 