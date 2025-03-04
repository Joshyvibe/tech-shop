from django.contrib import admin
from django.urls import path, include
from api.views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf.urls.static import static
from django.conf import settings
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register(r'reviews', ReviewViewSet)



urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/user/register/', UserCreate.as_view(), name='user_create'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api-auth/', include('rest_framework.urls')),
    path('accounts/', include('allauth.urls')),
    path('', include(router.urls)),
    path('callback/', google_login_callback, name='callback'),
    path('api/auth/user/', UserDetailView.as_view(), name='user_detail'),
    path('api/google/validate_token/', validate_google_token, name='validate_token'),
    path('dashboard/', UserDashboardView.as_view(), name='dashboard'),
    path('products/', ProductView.as_view(), name='products'),  
    path('api/products/', AdminProductView.as_view(), name='admin_product'),
    path('api/products/<int:pk>/', AdminEditProductView.as_view(), name='admin_product_detail'),
    path('api/cart/', CartView.as_view(), name='cart'),
    path('api/admin_view_orders/', AdminOrderView.as_view(), name='admin_view_orders'),
    path('api/orders/<int:pk>/', UserOrderView.as_view(), name='user_view_orders'),
    path('api/orders/new/', UserOrderCreateView.as_view(), name='order-create'),
    path('api/orders/<int:order_id>/create_payment_intent/', create_payment_intent, name='create_payment_intent'),
    path('api/orders/<int:order_id>/mark_paid/', mark_order_paid, name='mark_order_paid'),
    path('api/user_view_orders/', UserOrderListView.as_view(), name='user_view_orders'),
    path('products/<int:product_id>/reviews/', ProductReviewList.as_view(), name='product_reviews')
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)