from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.authx.models import UserProfile
from apps.assets.documents import City, Zone, Road, RoadSegment, PCMModule, ConversionUnit, Collector, Sensor
import random

def ensure_user(username, password, role):
    u, created = User.objects.get_or_create(username=username)
    if created:
        u.set_password(password)
        u.save()
    prof, _ = UserProfile.objects.get_or_create(user=u)
    prof.role = role
    prof.save()

class Command(BaseCommand):
    help = "Seed demo users and assets (Mongo)."

    def handle(self, *args, **options):
        # users
        ensure_user("admin", "admin123", UserProfile.ROLE_ADMIN)
        ensure_user("engineer", "engineer123", UserProfile.ROLE_ENGINEER)
        ensure_user("ops", "ops123", UserProfile.ROLE_OPS)
        ensure_user("viewer", "viewer123", UserProfile.ROLE_VIEWER)

        # assets (idempotent-ish)
        if City.objects.count() > 0:
            self.stdout.write("Demo data already present.")
            return

        cities = []
        for i in range(2):
            c = City(name=f"Demo City {i+1}", code=f"C{i+1}").save()
            cities.append(c)

        for c in cities:
            zones = []
            for z in range(3):
                zones.append(Zone(city_id=str(c.id), name=f"Zone {z+1}").save())

            for z in zones:
                # one road per zone for MVP
                road = Road(city_id=str(c.id), zone_id=str(z.id), name=f"Main Road - {z.name}").save()
                # 5 segments per city total, distributed
                for s in range(5):
                    # line near a base point (lng,lat)
                    base_lng = 77.0 + random.random() * 0.2 + (0.4 if c.code == "C2" else 0.0)
                    base_lat = 28.6 + random.random() * 0.2
                    coords = [
                        [base_lng, base_lat],
                        [base_lng + 0.01 + random.random() * 0.01, base_lat + 0.01 + random.random() * 0.01],
                    ]
                    seg = RoadSegment(
                        city_id=str(c.id),
                        zone_id=str(z.id),
                        road_id=str(road.id),
                        name=f"Segment {z.name}-{s+1}",
                        geometry={"type": "LineString", "coordinates": coords},
                        is_active=True,
                    ).save()

                    # collector, pcm, conversion
                    Collector(city_id=str(c.id), segment_id=str(seg.id), type=random.choice(["pipe_grid", "thermal_plate", "heat_pipe"])).save()
                    PCMModule(
                        city_id=str(c.id),
                        segment_id=str(seg.id),
                        capacity_kwh_th=250.0,
                        melt_temp_min=45.0,
                        melt_temp_max=60.0,
                        location={"type": "Point", "coordinates": coords[0]},
                    ).save()
                    ConversionUnit(
                        city_id=str(c.id),
                        segment_id=str(seg.id),
                        type=random.choice(["ORC", "TEG"]),
                        rated_kw=15.0,
                    ).save()

                    # sensors (logical)
                    for t, unit in [
                        ("temp_surface", "C"),
                        ("temp_subsurface", "C"),
                        ("temp_inlet", "C"),
                        ("temp_outlet", "C"),
                        ("flow", "kg/s"),
                        ("pressure", "kPa"),
                        ("kw_gross", "kW"),
                        ("pump_power", "kW"),
                        ("fan_power", "kW"),
                        ("pcm_temp", "C"),
                    ]:
                        Sensor(
                            city_id=str(c.id),
                            linked_asset_type="segment",
                            linked_asset_id=str(seg.id),
                            type=t,
                            unit=unit,
                            calibration={},
                        ).save()

        self.stdout.write(self.style.SUCCESS("Seeded demo users + assets."))
