import json
import time
from django.core.management.base import BaseCommand
from django.conf import settings
import paho.mqtt.client as mqtt
from apps.telemetry.serializers import TelemetryIngestSerializer
from apps.telemetry.documents import parse_ts, Telemetry

class Command(BaseCommand):
    help = "MQTT consumer that subscribes to telemetry topics and stores data in MongoDB."

    def handle(self, *args, **options):
        client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

        def on_connect(cl, userdata, flags, rc, properties=None):
            self.stdout.write(self.style.SUCCESS(f"Connected to MQTT broker with rc={rc}"))
            cl.subscribe("city/+/segment/+/telemetry")
            cl.subscribe("city/+/asset/+/telemetry")

        def on_message(cl, userdata, msg):
            try:
                payload = json.loads(msg.payload.decode("utf-8"))
            except Exception:
                return

            parts = msg.topic.split("/")
            # city/{city_id}/segment/{segment_id}/telemetry
            if len(parts) != 5:
                return
            _, city_id, scope_word, scope_id, _ = parts
            data = {
                "city_id": city_id,
                "timestamp": payload.get("timestamp"),
                "temps": payload.get("temps", {}),
                "flow": payload.get("flow"),
                "pressure": payload.get("pressure"),
                "kw_gross": payload.get("kw_gross"),
                "kwh_total": payload.get("kwh_total"),
                "fan_power": payload.get("fan_power"),
                "pump_power": payload.get("pump_power"),
                "pcm_temp": payload.get("pcm_temp"),
            }
            if scope_word == "segment":
                data["segment_id"] = scope_id
            else:
                data["asset_id"] = scope_id

            ser = TelemetryIngestSerializer(data=data)
            if not ser.is_valid():
                return

            v = ser.validated_data
            ts = parse_ts(v["timestamp"])
            scope = "segment" if v.get("segment_id") else "asset"
            Telemetry(
                scope=scope,
                city_id=v["city_id"],
                segment_id=v.get("segment_id") or None,
                asset_id=v.get("asset_id") or None,
                ts=ts,
                temps=v.get("temps", {}),
                flow=v.get("flow"),
                pressure=v.get("pressure"),
                kw_gross=v.get("kw_gross"),
                kwh_total=v.get("kwh_total"),
                fan_power=v.get("fan_power"),
                pump_power=v.get("pump_power"),
                pcm_temp=v.get("pcm_temp"),
            ).save()

        client.on_connect = on_connect
        client.on_message = on_message

        while True:
            try:
                client.connect(settings.MQTT_BROKER, settings.MQTT_PORT, keepalive=60)
                client.loop_forever()
            except Exception as e:
                self.stderr.write(f"MQTT error: {e}. Reconnecting in 5s...")
                time.sleep(5)
