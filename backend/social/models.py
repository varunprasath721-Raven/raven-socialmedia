from django.db import models
class Profile(models.Model):
 username=models.CharField(max_length=50,unique=True)
 name=models.CharField(max_length=120)
 bio=models.TextField(blank=True)
 avatar=models.URLField(blank=True)
 followers=models.ManyToManyField('self',symmetrical=False,related_name='following_users',blank=True)
 def __str__(self): return '@'+self.username
class Post(models.Model):
 author=models.ForeignKey(Profile,on_delete=models.CASCADE,related_name='posts')
 caption=models.TextField(blank=True)
 image=models.URLField(blank=True)
 created_at=models.DateTimeField(auto_now_add=True)
 likes=models.ManyToManyField(Profile,related_name='liked_posts',blank=True)
 saved_by=models.ManyToManyField(Profile,related_name='saved_posts',blank=True)
class Comment(models.Model):
 post=models.ForeignKey(Post,on_delete=models.CASCADE,related_name='comments')
 author=models.ForeignKey(Profile,on_delete=models.CASCADE)
 text=models.TextField()
 created_at=models.DateTimeField(auto_now_add=True)
class Story(models.Model):
 author=models.ForeignKey(Profile,on_delete=models.CASCADE,related_name='stories')
 image=models.URLField()
 created_at=models.DateTimeField(auto_now_add=True)
class Notification(models.Model):
 recipient=models.ForeignKey(Profile,on_delete=models.CASCADE,related_name='notifications')
 text=models.CharField(max_length=255)
 created_at=models.DateTimeField(auto_now_add=True)
 read=models.BooleanField(default=False)
