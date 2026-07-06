from django.apps import AppConfig


class TreesConfig(AppConfig):
    """Конфигурация приложения trees."""
    name = 'trees'

    def ready(self):
        """Подключает обработчики сигналов (trees/signals.py) при старте приложения —
        это стандартное место в Django для регистрации @receiver-обработчиков."""
        from . import signals  # noqa: F401
