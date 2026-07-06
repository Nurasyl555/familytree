from django.apps import AppConfig


class CoreConfig(AppConfig):
    """Конфигурация приложения core — вспомогательные, не связанные с доменной
    моделью вещи (сейчас — только dev-консоль для ручного тестирования API)."""
    name = 'core'
