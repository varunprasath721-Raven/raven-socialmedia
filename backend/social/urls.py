from rest_framework.routers import DefaultRouter
from .views import ProfileViewSet,PostViewSet,CommentViewSet,StoryViewSet,NotificationViewSet
r=DefaultRouter();r.register('profiles',ProfileViewSet);r.register('posts',PostViewSet);r.register('comments',CommentViewSet);r.register('stories',StoryViewSet);r.register('notifications',NotificationViewSet)
urlpatterns=r.urls
