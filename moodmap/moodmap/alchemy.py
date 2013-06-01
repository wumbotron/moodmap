
import urllib2
import urllib


def getSentiment(text):
    # rest endpoint
    endpoint = 'http://access.alchemyapi.com/calls/text/TextGetTextSentiment'

    # query arguments
    args = {}
    args['apikey'] = '29fe802e70afbc7a5086936ff3880b20d2adea08'
    args['outputMode'] = 'json'
    args['text'] = text

    # open our response
    url_values = urllib.urlencode(args)
    response = urllib2.urlopen(endpoint + '?' + url_values)
