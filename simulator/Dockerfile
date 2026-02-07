FROM python:3.11-slim

WORKDIR /app
RUN pip install --no-cache-dir paho-mqtt==2.1.0 python-dateutil==2.9.0.post0

COPY publisher.py /app/publisher.py
