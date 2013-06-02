from django.http import HttpResponse
from django.template.loader import render_to_string

import models
import json

def index(request):
    """Returns a default view"""
    return HttpResponse(render_to_string('index.html'))

def map(request):
	"""Returns a map view"""
	return HttpResponse(render_to_string('simplemap.html'))

def layers(request):
	"""Returns a map view that uses ESRI feature layers"""
	return HttpResponse(render_to_string('maplayers.html'))

def flickr(request):
	"""Returns a map that loads flickr images"""
	return HttpResponse(render_to_string('flickr.html'))
	
def data(request):
    def construct_output(datapoint):
        """For a given DataPoint, constructs an output dictionary"""
        return {'user': datapoint.user,
                'tweet_id': datapoint.tweet_id,
                'sentiment': datapoint.sentiment,
                'score': datapoint.score,
                'datetime': datapoint.datetime.isoformat()
               }

    NUMPOINTS = 250
    output = [construct_output(datapoint) for datapoint in
        models.DataPoint.objects.order_by('tweet_id')[:NUMPOINTS]]
    return HttpResponse(json.dumps(output))

def tags(request):
    # Fill in here
    return HttpResponse()
