import os
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from dotenv import load_dotenv

class Command(BaseCommand):
    help = "Create a superuser with credentials from environment variables"

    def handle(self, *args, **kwargs):
        load_dotenv()  # Load environment variables from .env file
        username = os.getenv("username_superuser", "test")
        password = os.getenv("MDP_superuser", "test")

        if not User.objects.filter(username=username).exists():
            User.objects.create_superuser(username=username, password=password)
            self.stdout.write(self.style.SUCCESS(f"Superuser created: {username}"))
        else:
            self.stdout.write(self.style.WARNING(f"User already exists: {username}"))
