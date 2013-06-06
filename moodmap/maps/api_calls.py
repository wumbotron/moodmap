"""
Used by the backend daemon to make calls to Twitter Search and Alchemy APIs
"""

import urllib2
import urllib

import json
import models
import datetime
import hashlib
import hmac
from twitter import twitter_response

from dateutil import parser

try:
    import syslog
except ImportError:
    pass

from django.db import IntegrityError
from django.db.models import Max

class APICallFailed(Exception):
    """ Exception thrown when a server returns an error from an API call """
    pass

try:
    log = syslog.syslog
except:
    pass

def send_request(url, args):
    """
    Sends a GET request to the given RESTful service using the given args,
    and parses the response using JSON.
    """
    url_values = urllib.urlencode(args)
    response = urllib2.urlopen(url + '?' + url_values)
    data = json.load(response)
    return data


def get_sentiment(text):
    """
    Calls the Alchemy API to get the sentiment/keyword from text.
    Returns: A tuple (sentiment, score, keywords).
             sentiment - "positive", "neutral", or "negative"
             score - Number between 0 and 1, or None
             keywords - Dictionary of present keywords
    """

    # rest endpoint
    sentiment_endpoint = 'http://access.alchemyapi.com/calls/text/TextGetTextSentiment'
    keyword_endpoint = 'http://access.alchemyapi.com/calls/text/TextGetRankedKeywords'

    # query arguments
    args = {}
    args['apikey'] = '29fe802e70afbc7a5086936ff3880b20d2adea08'
    args['outputMode'] = 'json'
    args['text'] = text.encode('ascii', 'ignore')


    sentiment_data = send_request(sentiment_endpoint, args)
    if sentiment_data['status'] == "ERROR":
        raise APICallFailed("Got error from alchemy")

    print sentiment_data
    sentiment = sentiment_data['docSentiment']
    sentiment_type = sentiment['type']

    if 'score' in sentiment:
        score = sentiment['score']
    else:
        score = None

    keyword_data = send_request(keyword_endpoint, args)
    keywords = keyword_data['keywords']

    return sentiment_type, score, keywords

def call_twitter(query, **kwargs):
    """
    Calls the Twitter Search API with the given search query and an
    optional geocode string.

    Returns: a list of tweets
    """
    endpoint = 'https://api.twitter.com/1.1/search/tweets.json?'

    #if not 'geocode' in kwargs:
    #   kwargs['geocode'] = '39.739167,-104.984722,30mi' 

    if not 'q' in kwargs:
        kwargs['q'] = query

    if not 'count' in kwargs:
        kwargs['count'] = 100

    url = endpoint + urllib.urlencode(kwargs)

    data = twitter_response(url)
    return data['statuses']

def request_twitter_sentiment(tweet):
    """
    Given a Tweet like one of those returned by call_twitter(),
    sends a request to Alchemy to get sentiment data.
    """
    text     = tweet['text']
    geo      = tweet['geo']
    user     = tweet['user']['name']
    tweet_id = tweet['id']
    timestr  = tweet['created_at']

    posted_datetime = parser.parse(timestr)

    sentiment, score, keywords = get_sentiment(text)

    # We likely aren't getting any geographic data
    if geo is None:
        geotag = "" # Store an empty string in the DB
    else:
        geotag = json.dumps(geo)

    return {'sentiment': sentiment,
            'score': score, 
            'keywords': json.dumps(keywords),
            'tweet_id': tweet_id,
            'user': user,
            'geo': geotag,
            'tweet_ts': posted_datetime,
            'tweet': text
           }


def update_model(query, *args, **kwargs):
    """
    Enters the results from request_twitter_sentiment into the database
    """
    def write_model_output(tweet_data, query):
        # First, check if a job exists already with this query string
        try:
            job = models.Job.objects.filter(query__exact=query).get()
        except models.Job.DoesNotExist:
            job = models.Job.objects.create(query=query, active=True,
                                            last_run=datetime.datetime.now())
        tweet_data['job']   = job
        models.DataPoint.objects.create(**tweet_data)

    # Only get tweets since the maximum ID
    max_id = models.DataPoint.objects.all().aggregate(Max('tweet_id'))['tweet_id__max']
    try:
        log("max_id = %s" % (max_id,))
    except:
        pass

    if max_id is not None:
        kwargs['since_id'] = max_id

    if query is not 'hack4colorado' and 'since_id' in kwargs:
        kwargs.pop('since_id')

    tweets = call_twitter(query, *args, **kwargs)
    try:
        log("writing %s tweets to DB" % (len(tweets),))
    except:
        pass

    for tweet in tweets:
        try:
            write_model_output(request_twitter_sentiment(tweet), query)
        except APICallFailed:
            pass
        except IntegrityError: # Duplicate DB entry
            pass
        except urllib2.URLError:
            log("urllib connection timed out")
