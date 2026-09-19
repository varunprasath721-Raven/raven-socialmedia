from rest_framework import serializers
from .models import Profile,Post,Comment,Story,Notification
class ProfileSerializer(serializers.ModelSerializer):
 followers_count=serializers.IntegerField(source='followers.count',read_only=True)
 class Meta:model=Profile;fields=['id','username','name','bio','avatar','followers_count']
class PostSerializer(serializers.ModelSerializer):
 author=ProfileSerializer(read_only=True)
 likes_count=serializers.IntegerField(source='likes.count',read_only=True)
 class Meta:model=Post;fields=['id','author','caption','image','created_at','likes_count']
class CommentSerializer(serializers.ModelSerializer):
 class Meta:model=Comment;fields='__all__'
class StorySerializer(serializers.ModelSerializer):
 class Meta:model=Story;fields='__all__'
class NotificationSerializer(serializers.ModelSerializer):
 class Meta:model=Notification;fields='__all__'
