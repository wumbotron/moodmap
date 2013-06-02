from django.db import models

class DataPoint(models.Model):
    user      = models.CharField(max_length=140)
    tweet_id  = models.CharField(max_length=100, unique=True)
    query     = models.CharField(max_length=200)
    sentiment = models.CharField(max_length=7)
    score     = models.FloatField(null=True, blank=True)
    # geotag (blank if none available)
    geo       = models.CharField(max_length=100, blank=True)
    keywords  = models.TextField()
    datetime  = models.DateTimeField(auto_now_add=True)
