import os

from flask import Flask, abort, render_template, send_from_directory

from configs.config import FLASK_CONFIG
from configs.story_config import STORY_CONFIG

app = Flask(__name__)
app.config.update(FLASK_CONFIG)


def get_stories():
    return [
        {'name': name, 'title': config['title'], 'description': config['description']}
        for name, config in STORY_CONFIG.items()
    ]


@app.route('/')
def index():
    return render_template('index.html', stories=get_stories())


@app.route('/stories/<story_name>')
def serve_story(story_name):
    config = STORY_CONFIG.get(story_name)
    if config is None:
        abort(404)

    return render_template(
        'story.html',
        story_title=config['title'],
        story_js=config['js'],
        story_css=config.get('css'),
        screen_class=config.get('screen_class'),
    )


@app.route('/favicon.ico')
@app.route('/favicon.png')
def favicon():
    response = send_from_directory('static/img', 'favicon.png', mimetype='image/png')
    response.headers['Cache-Control'] = 'public, max-age=31536000'
    return response


if __name__ == '__main__':
    app.run(debug=app.config['DEBUG'], port=int(os.environ.get('PORT', 5000)))
