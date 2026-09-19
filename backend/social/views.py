from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Profile,Post,Comment,Story,Notification
from .serializers import ProfileSerializer,PostSerializer,CommentSerializer,StorySerializer,NotificationSerializer
class ProfileViewSet(viewsets.ModelViewSet):
 queryset=Profile.objects.all();serializer_class=ProfileSerializer
 @action(detail=True,methods=['post'])
 def follow(self,request,pk=None):
  target=self.get_object(); me=Profile.objects.filter(username=request.data.get('username')).first()
  if not me:return Response({'detail':'username required'},400)
  if target==me:return Response({'detail':'cannot follow yourself'},400)
  if target.followers.filter(pk=me.pk).exists():target.followers.remove(me);status=False
  else:target.followers.add(me);status=True
  return Response({'following':status,'followers':target.followers.count()})
class PostViewSet(viewsets.ModelViewSet): queryset=Post.objects.all().order_by('-created_at');serializer_class=PostSerializer
class CommentViewSet(viewsets.ModelViewSet): queryset=Comment.objects.all();serializer_class=CommentSerializer
class StoryViewSet(viewsets.ModelViewSet): queryset=Story.objects.all().order_by('-created_at');serializer_class=StorySerializer
class NotificationViewSet(viewsets.ModelViewSet): queryset=Notification.objects.all().order_by('-created_at');serializer_class=NotificationSerializer
