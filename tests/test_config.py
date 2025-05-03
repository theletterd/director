from configs.story_config import STORY_CONFIG
from configs.config import FLASK_CONFIG

def test_story_config_structure():
    """Test that all stories have required fields"""
    required_fields = {'title', 'js', 'description'}
    optional_fields = {'needs_audio', 'css', 'screen_class'}
    
    for story_name, config in STORY_CONFIG.items():
        # Check required fields
        for field in required_fields:
            assert field in config, f"Story '{story_name}' missing required field: {field}"
        
        # Check field types
        assert isinstance(config['title'], str)
        assert isinstance(config['js'], str)
        assert isinstance(config['description'], str)
        
        # Check optional fields if present
        if 'needs_audio' in config:
            assert isinstance(config['needs_audio'], bool)
        if 'css' in config:
            assert isinstance(config['css'], str)
        if 'screen_class' in config:
            assert isinstance(config['screen_class'], str)

def test_flask_config():
    """Test Flask configuration"""
    assert 'DEBUG' in FLASK_CONFIG
    assert isinstance(FLASK_CONFIG['DEBUG'], bool) 