#!/bin/bash
set -e

echo "Applying database migrations..."
python manage.py makemigrations --noinput
python manage.py migrate --noinput

echo "Populating initial car models..."
python -c "import os, django; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'djangoproj.settings'); django.setup(); from djangoapp.populate import initiate; initiate()" || true

echo "Starting Gunicorn server..."
exec gunicorn djangoproj.wsgi:application --bind 0.0.0.0:8000
