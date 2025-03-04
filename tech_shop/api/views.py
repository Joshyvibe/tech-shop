from django.shortcuts import redirect
from django.contrib.auth.models import User
from rest_framework import generics, viewsets
from .serializers import UserSerializer, ProductSerializer, CartSerializer, OrderSerializer, ReviewSerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from allauth.socialaccount.models import SocialToken, SocialAccount
from django.contrib.auth.decorators import login_required
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Product, Cart, Order, Review
import stripe
from django.conf import settings
from rest_framework.decorators import action
from rest_framework.views import APIView
from django.forms import ValidationError

User = get_user_model()


class UserCreate(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
    
class UserDashboardView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        #prepare user data
        user_data = {
            'id': user.id,
            'username': user.username,
            'is_staff': user.is_staff,
            'is_active': user.is_active
        }

        return Response(user_data)


class AdminProductView(generics.ListCreateAPIView):
    permission_classes = [IsAdminUser] #only staffs can access this class
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class AdminEditProductView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class ProductView(generics.ListAPIView):
    queryset = Product.objects.all().order_by('id')
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]


class CartView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CartSerializer

    def get_object(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart
    
    def put(self, request, *args, **kwargs):
        cart = self.get_object()
        cart.items = request.data.get('items', [])
        cart.save()
        return Response({'success': True, 'items': cart.items})

# admin views for all orders placed by users

class AdminOrderView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer

# order view for users
class UserOrderView(generics.RetrieveUpdateDestroyAPIView): # retrieve single orders
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer
    queryset = Order.objects.all()

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)
    
# creating a new order view for users
class UserOrderCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

        
# users listing orders
class UserOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=self.request.user)
    
# reviews view for users
class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        product_id = self.request.query_params.get('product_id')
        if product_id:
            return Review.objects.filter(product_id=product_id)
        return Review.objects.all()
    
    def perform_create(self, serializer):
        try:
            serializer.save(user=self.request.user)
        except ValidationError as e:
            print(f"Validation error: {e.detail}")
            raise e
    
    @action(detail=False, methods=['get'])
    def my_reviews(self, request):
        reviews = Review.objects.filter(user=request.user)
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)

class ProductReviewList(APIView):
    def get(self, request, product_id):
        reviews = Review.objects.filter(product_id=product_id).order_by('-created_at')
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)


    

stripe.api_key = settings.STRIPE_SECRET_KEY
@csrf_exempt
def create_payment_intent(request, order_id):
    order = Order.objects.get(id=order_id)
    try:
        intent = stripe.PaymentIntent.create(
            amount=int(order.total_price * 100), # stripe expects amounts in cents
            currency='usd',
            metadata={'order_id': order_id}
        )
      
        return JsonResponse({'clientSecret': intent['client_secret']}) # send secret to client
    except Exception as e:
        print('Error:', str(e))
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def mark_order_paid(request, order_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    order = Order.objects.get(id=order_id)
    if order.payment_completed:
        return JsonResponse({'message': 'order is already completed and marked as paid'}, status=400)
    
    payment_data = json.loads(request.body)
    payment_id = payment_data.get('payment_id')

    if not payment_id:
        return JsonResponse({'error': 'Payment ID is missing'}, status=400)
    #mark as paid
    order.status = 'COMPLETED'
    order.payment_completed = True
    order.payment_id = payment_id
    order.save()

    return JsonResponse({'message': 'Order marked as paid successfully', "payment_id": payment_id})












@login_required
def google_login_callback(request):
    user = request.user

    social_accounts = SocialAccount.objects.filter(user=user)
    print("Social Account for user:", social_accounts)

    social_account = social_accounts.first()

    if not social_account:
        print("No social account for user:", user)
        return redirect('http://localhost:5173/login/callback/?error=NoSocialAccount')
    
    token = SocialToken.objects.filter(account=social_account, account__provider='google').first()

    if token:
        print('Google token found:', token.token)
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        return redirect(f'http://localhost:5173/login/callback/?access_token={access_token}')
    else:
        print('No Google token found for user', user)
        return redirect(f'http://localhost:5173/login/callback/?error=NoGoogleToken')


@csrf_exempt
def validate_google_token(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            google_access_token = data.get('access_token')
            print(google_access_token)

            if not google_access_token:
                return JsonResponse({'detail': 'Access Token is missing.'}, status=400)
            return JsonResponse({'valid': True})
        except json.JSONDecodeError:
            return JsonResponse({'detail': 'Invalid JSON.'}, status=400)
    return JsonResponse({'detail': 'Method not allowed.'}, status=405)