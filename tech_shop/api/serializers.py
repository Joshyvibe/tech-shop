from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Product, Cart, Order, Review


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'password')
        extra_kwargs = { 'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    



class ProductSerializer(serializers.ModelSerializer):
    review_count = serializers.IntegerField(source='reviews.count', read_only=True)
    average_rating = serializers.SerializerMethodField(read_only=True)


    class Meta:
        model = Product
        fields = '__all__'

    def get_average_rating(self, obj):
        return obj.average_rating()


class CartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cart
        fields = ['items']


class OrderSerializer(serializers.ModelSerializer):
    products = serializers.JSONField()
    user = UserSerializer(read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'address', 'city', 'country', 'products', 'total_price', 'status']
        read_only_fields = ['id', 'user', 'total_price', 'created_at', 'updated_at']

        def create(self, validated_data):
            products_data = validated_data.pop('products')
            order = Order.objects.create(**validated_data)
            order.products = products_data #save products json data
            order.save()
            return order
        

class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField() # this will use the __str__ method in User model

    class Meta:
        model = Review
        fields = ['id', 'product',  'user', 'rating','comment', 'created_at']
