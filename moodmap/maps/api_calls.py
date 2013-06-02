import urllib2
import urllib

import json
import models

import syslog

from django.db import IntegrityError
from django.db.models import Max

class APICallFailed(Exception):
    """ Exception thrown when a server returns an error from an API call """
    pass

log = syslog.syslog

def send_request(url, args):
    """ Sends a request to the given RESTful service using the given args """
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
    endpoint = 'http://search.twitter.com/search.json'

    if not 'geocode' in kwargs:
        kwargs['geocode'] = '39.739167,-104.984722,30mi' 

    if not 'q' in kwargs:
        kwargs['q'] = query

    if not 'rpp' in kwargs:
        kwargs['rpp'] = 100

    data = send_request(endpoint, kwargs)
    return data['results']

def request_twitter_sentiment(tweet):
    text     = tweet['text']
    geo      = tweet['geo']
    user     = tweet['from_user']
    tweet_id = tweet['id_str']

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
            'geo': geotag
           }


def update_model(query, *args, **kwargs):
    """
    Enters the results from request_twitter_sentiment into the database
    """
    def write_model_output(tweet_data, query):
        tweet_data['query'] = query
        models.DataPoint.objects.create(**tweet_data)

    # Only get tweets since the maximum ID
    max_id = models.DataPoint.objects.all().aggregate(Max('tweet_id'))['tweet_id__max']

    log("max_id = %s" % (max_id,))

    if max_id is not None:
        kwargs['since_id'] = max_id

    tweets = call_twitter(query, *args, **kwargs)
    log("writing %s tweets to DB" % (len(tweets),))
    for tweet in tweets:
        try:
            write_model_output(request_twitter_sentiment(tweet), query)
        except APICallFailed:
            pass
        except IntegrityError: # Duplicate DB entry
            pass
        except urllib2.URLError:
            log("urllib connection timed out")
