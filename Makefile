.PHONY: setup setup-python setup-npm run run-gunicorn clean test test-python test-npm deploy help

# Development setup
setup: setup-python setup-npm

setup-python:
	python -m venv env
	. env/bin/activate && pip install -r requirements.txt

setup-npm:
	npm install

# Run the Flask application
run:
	. env/bin/activate && python app.py

# Run with Gunicorn
run-gunicorn:
	. env/bin/activate && gunicorn -c gunicorn.conf.py app:app

# Clean up
clean:
	find . -type d -name "__pycache__" -exec rm -r {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*.pyd" -delete
	find . -type f -name ".DS_Store" -delete
	rm -rf node_modules
	rm -f package-lock.json

# Run tests
test: test-python test-npm

test-python:
	. env/bin/activate && python -m pytest

test-npm:
	npm test

# Deployment commands
deploy:
	@echo "Deployment steps:"
	@echo "1. Ensure all changes are committed"
	@echo "2. Run all tests"
	@echo "3. Deploy to production"
	@echo "Please implement specific deployment steps based on your hosting platform"

# Help command
help:
	@echo "Available commands:"
	@echo "  make setup         - Set up both Python and Node.js environments"
	@echo "  make setup-python  - Set up Python environment"
	@echo "  make setup-npm     - Set up Node.js environment"
	@echo "  make run          - Run the Flask application in development mode"
	@echo "  make run-gunicorn - Run the Flask application with Gunicorn"
	@echo "  make clean        - Clean up Python cache files, node_modules, and other temporary files"
	@echo "  make test         - Run all tests (Python and Node.js)"
	@echo "  make test-python  - Run Python tests"
	@echo "  make test-npm     - Run Node.js tests"
	@echo "  make deploy       - Deploy the application"
	@echo "  make help         - Show this help message"
