from django.db import models

class DataPoint(models.Model):
    """
    Table where each row corresponds with a single Tweet.
    """
    # Username that posted this Tweet
    user      = models.CharField(max_length=140)
    # Unique ID from Twitter API
    tweet_id  = models.CharField(max_length=100, unique=True)
    # Which job fetched this point?
    job       = models.ForeignKey('Job')
    # Overall sentiment, "positive", "negative", or "neutral".
    sentiment = models.CharField(max_length=7)
    # Sentiment score, as given by Alchemy. Ranges from -1 to 1 or is null.
    score     = models.FloatField(null=True, blank=True)
    # geotag (blank if none available)
    geo       = models.CharField(max_length=100, blank=True)
    # JSON-encoded keywords dictionary from Alchemy.
    keywords  = models.TextField()
    # Datetime when row was inserted
    datetime  = models.DateTimeField(auto_now_add=True)
    # Datetime when Tweet was posted
    tweet_ts  = models.DateTimeField()
    # Body of Tweet
    tweet     = models.CharField(max_length=140)
    # Embedded html
    html      = models.TextField()

class Job(models.Model):
    """
    Stores a list of jobs, which represent queries that need to be cycled
    through.
    """
    # Query to update with
    query    = models.CharField(max_length=200, unique=True)
    # Should this job be run?
    active   = models.BooleanField()
    # Last time the job was run, or null if never
    last_run = models.DateTimeField(null=True)
