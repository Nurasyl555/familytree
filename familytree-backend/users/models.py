"""Модель пользователя приложения users."""
from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """Пользователь системы. Расширяет стандартный Django User только полем created_at —
    сами роли (owner/editor/reader) не хранятся здесь, а живут в trees.TreeMember
    (пользователь может быть owner в одном дереве и reader в другом одновременно).
    ROLES — общий справочник choices, переиспользуемый в TreeMember.role и Invitation.role."""
    ROLES = [
        ('owner', 'Владелец'),
        ('editor', 'Редактор'),
        ('reader', 'Читатель'),
    ]
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'users_user'
