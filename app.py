from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/stories/<path:path>')
def serve_story(path):
    return send_from_directory('stories', path)

if __name__ == '__main__':
    app.run(debug=True) 