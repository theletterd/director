# Story configurations.
# Required: title, js (file in static/js/stories), description.
# Optional: css (file in static/css/stories), screen_class (class added to #screen).
STORY_CONFIG = {
     'demo': {
        'title': 'Demo',
        'js': 'demo.js',
        'description': 'A demonstration of all the basic features'
    },
   'dream': {
        'title': 'Dream Story',
        'js': 'scenes.js',
        'description': 'A dream sequence story',
        'css': 'dream.css'
    },
    'story2': {
        'title': 'Story 2',
        'js': 'story2.js',
        'description': 'Another story example'
    },
    'audio_demo': {
        'title': 'Audio Demo',
        'js': 'audio_demo.js',
        'description': 'Demonstration of audio features'
    },
    'animation_test': {
        'title': 'Animation Test',
        'js': 'animation_test.js',
        'description': 'Testing animation capabilities'
    },
    'ziggy': {
        'title': "Ziggy's Story",
        'js': 'ziggy.js',
        'css': 'ziggy.css',
        'description': 'A story about Ziggy',
        'screen_class': 'ziggy-story'
    },
    'lumen': {
        'title': 'Lumen',
        'js': 'lumen.js',
        'css': 'lumen.css',
        'description': 'A firefly in the dark, looking for someone to blink back'
    },
    'gradient_demo': {
        'title': 'Gradient Demo',
        'js': 'gradient-demo.js',
        'description': 'WORK IN PROGRESS: Demonstration of background color and gradient transitions',
        'screen_class': 'gradient-demo'
    }
}
