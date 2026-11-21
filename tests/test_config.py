from configs.story_config import STORY_CONFIG
from configs.config import FLASK_CONFIG

def test_story_config_structure():
    """Test that all stories have required fields"""
    required_fields = {'title', 'js', 'description'}
    optional_fields = {'css', 'screen_class'}
    
    for story_name, config in STORY_CONFIG.items():
        # Check required fields
        for field in required_fields:
            assert field in config, f"Story '{story_name}' missing required field: {field}"
        
        # Check field types
        assert isinstance(config['title'], str)
        assert isinstance(config['js'], str)
        assert isinstance(config['description'], str)
        
        unknown = set(config) - required_fields - optional_fields
        assert not unknown, f"Story '{story_name}' has unknown fields: {unknown}"

        # Check optional fields if present
        if 'css' in config:
            assert isinstance(config['css'], str)
        if 'screen_class' in config:
            assert isinstance(config['screen_class'], str)

def test_flask_config():
    """Test Flask configuration"""
    assert 'DEBUG' in FLASK_CONFIG
    assert isinstance(FLASK_CONFIG['DEBUG'], bool) 