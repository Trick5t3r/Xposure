#!/bin/bash

# Apply migrations
echo "Applying database migrations..."
python manage.py makemigrations --noinput
python manage.py migrate --noinput

# Create a superuser if it doesn't already exist
echo "Creating superuser..."
python manage.py shell <<EOF
from django.contrib.auth.models import User
import os
if not User.objects.filter(username='test').exists():
    User.objects.create_superuser(
        username='test',
        email='test@example.com',
        password=os.getenv('MDP_superuser')
    )
EOF

# Vérifier la valeur de DEBUG
if [ "$DEBUG" = "true" ]; then
    echo "Running Django in DEBUG mode with runserver..."
    python manage.py runserver 0.0.0.0:8000 >> /logs/log_django.log 2>&1
else
    echo "Running Django in production mode with Gunicorn..."
    gunicorn --bind 0.0.0.0:8000 backend.wsgi:application
fi
