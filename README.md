# Thermal Infrastructure Monitoring Platform

A local, runnable web platform to monitor:
- Asphalt heat capture (collectors)
- PCM thermal storage (SOC estimate)
- Electricity generation (ORC/TEG)
- Telemetry ingestion via MQTT + REST fallback
- KPI computation every minute (Celery Beat)
- Alerts evaluation every minute
- Maintenance work orders
- PDF + Excel reporting

## Tech
- Frontend: React + TypeScript (Vite), Tailwind CSS, Recharts, Leaflet
- Backend: Django 5 + DRF, JWT in httpOnly cookies, RBAC
- DB: MongoDB (MongoEngine for assets/telemetry/kpi/alerts/maintenance)
- Background: Celery + Redis
- MQTT: Mosquitto broker + simulator publisher
- Reports: ReportLab (PDF), openpyxl (XLSX)

## Run locally

1) Copy env template:
```bash
cp .env.example .env
