"""Регистрация CustomUser в Django-админке."""
from django.contrib import admin
from .models import CustomUser

admin.site.register(CustomUser)
