from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='products_images/', blank=True, null=True)


    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['id']

    def average_rating(self):
        reviews = self.reviews.all()
        if reviews.exists():
            return reviews.aggregate(models.Avg('rating'))['rating__avg']
        return 0


class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    items = models.JSONField(default=list)

    def __str__(self):
        return f"{self.user.username}'s cart"

class Order(models.Model):
    # set order status
    PENDING = 'PENDING'
    COMPLETED = 'COMPLETED'
    CANCELED = 'CANCELED'
    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (COMPLETED, 'Completed'),
        (CANCELED, 'Canceled'),
    ]
    # LINK A USER TO Order
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

    address = models.CharField(max_length=255, default=None)
    city = models.CharField(max_length=255, default=None)
    country = models.CharField(max_length=255, default=None)
    
    #order details
    products = models.JSONField(default=list)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=PENDING)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    #timestamp fields
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    #payment details fields
    payment_completed = models.BooleanField(default=False)
    payment_id = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"Order #{self.id} by #{self.user.username} - Status: {self.status}"
    
    def calculate_total(self):
        return sum(float(item['price']) * item['quantity'] for item in self.products)
    
    def save(self, *args, **kwargs):
        if not self.total_price:
            self.total_price = self.calculate_total()
        super().save(*args, **kwargs)


class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Review of {self.product.name} by {self.user.username}"
    
    class Meta:
        unique_together = ('product', 'user')