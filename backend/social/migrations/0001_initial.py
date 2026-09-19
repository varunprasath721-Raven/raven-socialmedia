from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    initial=True
    dependencies=[]
    operations=[
        migrations.CreateModel(name='Profile',fields=[('id',models.BigAutoField(auto_created=True,primary_key=True,serialize=False,verbose_name='ID')),('username',models.CharField(max_length=50,unique=True)),('name',models.CharField(max_length=120)),('bio',models.TextField(blank=True)),('avatar',models.URLField(blank=True))]),
        migrations.CreateModel(name='Post',fields=[('id',models.BigAutoField(auto_created=True,primary_key=True,serialize=False,verbose_name='ID')),('caption',models.TextField(blank=True)),('image',models.URLField(blank=True)),('created_at',models.DateTimeField(auto_now_add=True)),('author',models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,related_name='posts',to='social.profile'))]),
        migrations.CreateModel(name='Comment',fields=[('id',models.BigAutoField(auto_created=True,primary_key=True,serialize=False,verbose_name='ID')),('text',models.TextField()),('created_at',models.DateTimeField(auto_now_add=True)),('author',models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,to='social.profile')),('post',models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,related_name='comments',to='social.post'))]),
        migrations.CreateModel(name='Story',fields=[('id',models.BigAutoField(auto_created=True,primary_key=True,serialize=False,verbose_name='ID')),('image',models.URLField()),('created_at',models.DateTimeField(auto_now_add=True)),('author',models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,related_name='stories',to='social.profile'))]),
        migrations.CreateModel(name='Notification',fields=[('id',models.BigAutoField(auto_created=True,primary_key=True,serialize=False,verbose_name='ID')),('text',models.CharField(max_length=255)),('created_at',models.DateTimeField(auto_now_add=True)),('read',models.BooleanField(default=False)),('recipient',models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,related_name='notifications',to='social.profile'))]),
        migrations.AddField(model_name='profile',name='followers',field=models.ManyToManyField(blank=True,related_name='following_users',to='social.profile')),
        migrations.AddField(model_name='post',name='likes',field=models.ManyToManyField(blank=True,related_name='liked_posts',to='social.profile')),
        migrations.AddField(model_name='post',name='saved_by',field=models.ManyToManyField(blank=True,related_name='saved_posts',to='social.profile')),
    ]
