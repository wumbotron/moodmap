
import urllib2
import urllib
import json

class APICallFailed(Exception):
    pass

def send_request(url, args):
    url_values = urllib.urlencode(args)
    response = urllib2.urlopen(url + '?' + url_values)
    data = json.load(response)
    return data


def get_sentiment(text):
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
    endpoint = 'http://search.twitter.com/search.json'

    args = {}
    args['q'] = query

    # geocode for Denver within a 30 mi radius
    args['geocode'] = '39.739167,-104.984722,30mi'

    data = send_request(endpoint, args)
    return data['results']

def request_twitter_sentiment(tweet):
    text = tweet['text']
    url = tweet['source']

    sentiment, score, keywords = get_sentiment(text)

    return sentiment, score, keywords

def update_model(*args, **kwargs):
    def write_model_output(tweet_data):
        pass

    tweets = call_twitter(*args, **kwargs)
    for tweet in tweets:
        try:
            write_model_output(request_twitter_sentiment(tweet))
        except APICallFailed:
            pass
