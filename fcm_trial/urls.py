from django.contrib import admin
from django.urls import path,include
from django.views.generic import TemplateView
from fcm_django.api.rest_framework import FCMDeviceAuthorizedViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('devices', FCMDeviceAuthorizedViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path("firebase-messaging",
         TemplateView.as_view(
             template_name="firebase-messaging-sw.js",
             content_type="application/javascript",
         ),
         name="firebase-messaging-sw.js"
         ),
    # URLs will show up at <api_root>/devices
    # DRF browsable API which lists all available endpoints
    path('api/', include(router.urls)),
]
