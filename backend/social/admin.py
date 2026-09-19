from django.contrib import admin
from .models import Profile,Post,Comment,Story,Notification
admin.site.register([Profile,Post,Comment,Story,Notification])
