from flask import Flask, render_template, send_from_directory
import os
from configs.config import FLASK_CONFIG
from configs.story_config import STORY_CONFIG

app = Flask(__name__)
app.config.update(FLASK_CONFIG)

def get_stories():
    return [
        {
            'name': name,
            'title': config['title'],
            'description': config['description']
        }
        for name, config in STORY_CONFIG.items()
    ]

@app.route('/')
def index():
    return render_template('index.html', stories=get_stories())

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
    return send_from_directory('static/js/stories', filename)

if __name__ == '__main__':
    app.run(debug=app.config['DEBUG']) 