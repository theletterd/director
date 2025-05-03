from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__)

# Story configuration
STORY_CONFIG = {
    'dream': {
        'title': 'Dream Story',
        'js': 'scenes.js'
    },
    'demo': {
        'title': 'Director Demo',
        'js': 'demo.js'
    },
    'story2': {
        'title': 'Story 2',
        'js': 'story2.js'
    },
    'audio_demo': {
        'title': 'Director Audio Demo',
        'js': 'audio_demo.js',
        'needs_audio': True
    },
    'animation_test': {
        'title': 'Animation Test',
        'js': 'animation_test.js'
    },
    'ziggy': {
        'title': "Ziggy's Story",
        'js': 'ziggy.js',
        'screen_class': 'ziggy-story',
        'needs_css': True
    }
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/stories/<path:path>')
def serve_story(path):
    # Extract the story name from the path
    story_name = path.split('/')[0]
    
    if story_name not in STORY_CONFIG:
        return "Story not found", 404
        
    config = STORY_CONFIG[story_name]
    
    return render_template(
        'story.html',
        story_name=story_name,
        story_title=config['title'],
        story_js=config['js'],
        audio_library=config.get('needs_audio', False),
        screen_class=config.get('screen_class'),
        story_css=story_name if config.get('needs_css', False) else None
    )

@app.route('/stories/js/<story_name>/<filename>')
def serve_story_js(story_name, filename):
    return send_from_directory('stories', f'{story_name}/{filename}')

if __name__ == '__main__':
    app.run(debug=True) 