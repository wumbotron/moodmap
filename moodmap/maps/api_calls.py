
import urllib2
import urllib
import json
from datetime import datetime

class APICallFailed(Exception):
    """ Exception thrown when a server returns an error from an API call """
    pass

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

def call_twitter(query, geocode=None):
    """
    Calls the Twitter Search API with the given search query and an
    optional geocode string.

    Returns: a list of tweets
    """
    endpoint = 'http://search.twitter.com/search.json'

    args = {}
    args['q'] = query

    # geocode for Denver within a 30 mi radius
    if geocode is None:
        args['geocode'] = '39.739167,-104.984722,30mi'
    else:
        args['geocode'] = geocode

    data = send_request(endpoint, args)
    return data['results']

def request_twitter_sentiment(tweet):
    text = tweet['text']
    geo = tweet['geo']
    user = tweet['from_user']
    tweet_id = tweet['id_str']

    sentiment, score, keywords = get_sentiment(text)

    return {'sentiment': sentiment,
            'score': score, 
            'keywords': keywords,
            'tweet_id': tweet_id,
            'user': user,
            'geo': json.dumps(geo['coordinates'])}


def update_model(*args, **kwargs):
    def write_model_output(tweet_data, query):
        tweet_data['datetime'] = datetime.now()
        tweet_data['query'] = query
        DataPoint.objects.create(**tweet_data)

    tweets = call_twitter(*args, **kwargs)
    for tweet in tweets:
        try:
            write_model_output(request_twitter_sentiment(tweet), "hack4colorado")
        except APICallFailed:
            pass
