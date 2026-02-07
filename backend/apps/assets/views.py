from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from mongoengine.errors import DoesNotExist, ValidationError
from .serializers import MODEL_MAP, MongoDocSerializer
from apps.authx.permissions import IsEngineerOrAbove, IsOpsOrAbove

def _get_model(kind: str):
    if kind not in MODEL_MAP:
        raise KeyError("Unknown kind")
    return MODEL_MAP[kind]

class MongoCrudListCreate(APIView):
    permission_classes = [IsOpsOrAbove]

    def get(self, request, kind: str):
        Model, _In = _get_model(kind)
        qs = Model.objects
        # common filters
        for key in ["city_id", "zone_id", "road_id", "segment_id", "linked_asset_id"]:
            v = request.query_params.get(key)
            if v:
                qs = qs.filter(**{key: v})
        return Response([MongoDocSerializer().to_representation(x) for x in qs.limit(500)])

    def post(self, request, kind: str):
        Model, InSer = _get_model(kind)
        ser = InSer(data=request.data)
        ser.is_valid(raise_exception=True)
        try:
            doc = Model(**ser.validated_data).save()
        except ValidationError as e:
            return Response({"detail": str(e)}, status=400)
        return Response(MongoDocSerializer().to_representation(doc), status=201)

class MongoCrudDetail(APIView):
    permission_classes = [IsEngineerOrAbove]

    def get(self, request, kind: str, id: str):
        Model, _In = _get_model(kind)
        try:
            doc = Model.objects.get(id=id)
        except DoesNotExist:
            return Response({"detail": "Not found"}, status=404)
        return Response(MongoDocSerializer().to_representation(doc))

    def put(self, request, kind: str, id: str):
        Model, InSer = _get_model(kind)
        ser = InSer(data=request.data)
        ser.is_valid(raise_exception=True)
        try:
            doc = Model.objects.get(id=id)
        except DoesNotExist:
            return Response({"detail": "Not found"}, status=404)
        for k, v in ser.validated_data.items():
            setattr(doc, k, v)
        doc.save()
        return Response(MongoDocSerializer().to_representation(doc))

    def delete(self, request, kind: str, id: str):
        Model, _In = _get_model(kind)
        try:
            doc = Model.objects.get(id=id)
        except DoesNotExist:
            return Response({"detail": "Not found"}, status=404)
        doc.delete()
        return Response(status=204)
