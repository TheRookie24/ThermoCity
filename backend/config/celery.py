import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

celery_app = Celery("config")
celery_app.config_from_object("django.conf:settings", namespace="CELERY")
celery_app.autodiscover_tasks()

celery_app.conf.beat_schedule = {
    "compute_kpis_every_minute": {
        "task": "apps.kpi.tasks.compute_kpis",
        "schedule": crontab(minute="*"),
    },
    "evaluate_alerts_every_minute": {
        "task": "apps.alerts.tasks.evaluate_alerts",
        "schedule": crontab(minute="*"),
    },
}
