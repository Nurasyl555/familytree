"""Регистрация моделей trees в стандартной Django-админке (без кастомных ModelAdmin —
достаточно базового CRUD для отладки и ручного администрирования)."""
from django.contrib import admin
from .models import FamilyTree, Person, Relationship, TreeMember, AuditLog, Invitation, LifeEvent, Media, Notification

admin.site.register(FamilyTree)
admin.site.register(Person)
admin.site.register(Relationship)
admin.site.register(TreeMember)
admin.site.register(AuditLog)
admin.site.register(Invitation)
admin.site.register(LifeEvent)
admin.site.register(Media)
admin.site.register(Notification)
