import os
import json
import time
import math
import random
from datetime import datetime, timezone
import paho.mqtt.client as mqtt

BROKER = os.getenv("MQTT_HOST", os.getenv("MQTT_BROKER", "mosquitto"))
PORT = int(os.getenv("MQTT_PORT", "1883"))

def iso_now():
    return datetime.now(timezone.utc).isoformat()

def day_cycle(t_sec: float) -> float:
    # 24h cycle: min at ~5am, max at ~2pm (rough)
    day = 24 * 3600.0
    phase = (t_sec % day) / day
    return math.sin(2 * math.pi * (phase - 0.35))

def simulate_segment(seg_id: str, base_lat: float, base_lng: float, t_sec: float, state: dict):
    cyc = day_cycle(t_sec)
    amb = 22 + 10 * cyc  # 12..32
    surface = amb + 8 * max(0, cyc) + random.uniform(-0.5, 0.5)
    subsurface = amb + 4 * max(0, cyc) + random.uniform(-0.3, 0.3)

    # thermal loop inlet/outlet
    t_in = amb + 2 + random.uniform(-0.3, 0.3)
    delta = max(0.0, surface - t_in) * (0.25 + 0.15 * max(0, cyc))
    t_out = t_in + delta + random.uniform(-0.2, 0.2)

    # flow increases mid-day
    flow = 0.8 + 0.6 * max(0, cyc) + random.uniform(-0.05, 0.05)  # kg/s
    pressure = 120 + 30 * (flow - 0.8) + random.uniform(-2, 2)    # kPa

    # power generation related to deltaT (proxy)
    kw_gross = max(0.0, (t_out - t_in)) * (0.8 + 0.4 * random.random())
    kw_gross = min(kw_gross, 18.0)

    # parasitic loads
    pump_power = 0.6 + 0.4 * (flow - 0.8) + 0.1 * random.random()
    fan_power = 0.2 + 0.25 * max(0, cyc) + 0.1 * random.random()

    # PCM SOC & temperature: charge midday, discharge evening/night
    soc = state.get("soc", 0.4)
    if cyc > 0.1:  # daytime: charge
        soc += 0.0025 * (cyc)  # faster charge at peak
    else:         # night: discharge
        soc -= 0.0018 * (0.2 - cyc)
    soc = max(0.05, min(0.98, soc))
    state["soc"] = soc

    melt_min, melt_max = 45.0, 60.0
    pcm_temp = melt_min + soc * (melt_max - melt_min) + random.uniform(-0.3, 0.3)

    kwh_total = state.get("kwh_total", 0.0)
    # integrate gross energy every 5s
    kwh_total += kw_gross * (5.0 / 3600.0)
    state["kwh_total"] = kwh_total

    payload = {
        "timestamp": iso_now(),
        "temps": {
            "surface": round(surface, 2),
            "subsurface": round(subsurface, 2),
            "inlet": round(t_in, 2),
            "outlet": round(t_out, 2),
        },
        "flow": round(flow, 3),
        "pressure": round(pressure, 2),
        "kw_gross": round(kw_gross, 3),
        "kwh_total": round(kwh_total, 3),
        "pump_power": round(pump_power, 3),
        "fan_power": round(fan_power, 3),
        "pcm_temp": round(pcm_temp, 2),
    }
    return payload



def connect_with_retry(client, host, port, retries=60, delay=1.0):
    print(f"[simulator] Connecting to MQTT broker {host}:{port}")
    for i in range(retries):
        try:
            client.connect(host, port, 60)
            print("[simulator] Connected.")
            return
        except Exception as e:
            print(f"[simulator] MQTT connect failed ({i+1}/{retries}): {e}")
            time.sleep(delay)
    raise RuntimeError("MQTT broker not reachable after retries")


def main():
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    connect_with_retry(client, BROKER, PORT)
    client.loop_start()

    # 2 cities, 3 zones, 5 segments each (publish per segment)
    # IDs are logical names; backend seed_demo uses Mongo IDs,
    # but the platform also supports city/segment topics by string.
    # We publish "city/C1/segment/Z1S1/telemetry" style.
    cities = ["C1", "C2"]
    zones = ["Z1", "Z2", "Z3"]

    segs = []
    for c in cities:
        for z in zones:
            for i in range(5):
                segs.append((c, z, f"{z}S{i+1}"))

    states = {seg_id: {} for (_, _, seg_id) in segs}

    t0 = time.time()
    while True:
        t_sec = time.time()
        for (c, z, seg_id) in segs:
            payload = simulate_segment(seg_id, 28.6, 77.1, t_sec, states[seg_id])
            topic = f"city/{c}/segment/{seg_id}/telemetry"
            client.publish(topic, json.dumps(payload), qos=0, retain=False)
        time.sleep(5)

if __name__ == "__main__":
    main()
