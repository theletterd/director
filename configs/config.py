import os

# Flask configuration. Debug is on unless FLASK_DEBUG=0.
FLASK_CONFIG = {
    'DEBUG': os.environ.get('FLASK_DEBUG', '1') != '0',
}
