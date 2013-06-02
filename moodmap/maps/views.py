from __future__ import division

from django.http import HttpResponse
from django.template.loader import render_to_string
from urllib2 import unquote
import json
import models
from api_calls import update_model

def index(request):
    """Returns a default view"""
    return HttpResponse(render_to_string('index.html'))

def map(request):
	"""Returns a map view"""
	return HttpResponse(render_to_string('index.html'))

def layers(request):
	"""Returns a map view that uses ESRI feature layers"""
	return HttpResponse(render_to_string('maplayers.html'))

def flickr(request):
	"""Returns a map that loads flickr images"""
	return HttpResponse(render_to_string('flickr.html'))

def cloud(request):
	"""Returns a map that loads flickr images"""
	return HttpResponse(render_to_string('cloud.html'))

def about(request):
	"""an about page with sample data"""
	return HttpResponse(render_to_string('about.html'))
		
def data(request):
    def construct_output(datapoint):
        """For a given DataPoint, constructs an output dictionary"""
        return {'user': datapoint.user,
                'tweet_id': datapoint.tweet_id,
                'sentiment': datapoint.sentiment,
                'score': datapoint.score,
                'geo': datapoint.geo,
                'datetime': datapoint.datetime.isoformat(),
                'tweet': datapoint.tweet
               }

    NUMPOINTS = 250
    output = [construct_output(datapoint) for datapoint in
        models.DataPoint.objects.order_by('tweet_id').reverse()[:NUMPOINTS]]
    return HttpResponse(json.dumps(output))

def search(request):
    def construct_output(datapoint):
        """For a given DataPoint, constructs an output dictionary"""
        return {'user': datapoint.user,
                'tweet_id': datapoint.tweet_id,
                'sentiment': datapoint.sentiment,
                'score': datapoint.score,
                'geo': datapoint.geo,
                'datetime': datapoint.datetime.isoformat(),
                'tweet': datapoint.tweet
               }

    NUMPOINTS = 250
    if 'query' in request.GET:
        query = unquote(request.GET['query'])
        if not models.DataPoint.objects.filter(query__exact=query).exists():
            update_model(query)
        query_set = models.DataPoint.objects.filter(query__exact=query).order_by('tweet_id').reverse()[:NUMPOINTS]
    else:
        query_set = models.DataPoint.objects.all().order_by('tweet_id').reverse()[:NUMPOINTS]
    output = [construct_output(datapoint) for datapoint in query_set]
    return HttpResponse(json.dumps(output))


def tags(request):
    if 'query' in request.GET:
        filtered = models.DataPoint.objects.filter(query__exact=unquote(request.GET['query']))
        queryset = list(filtered.order_by('datetime')[:100])
    else:
        queryset = list(models.DataPoint.objects.order_by('datetime')[:100])
    kws = {}
    for q in queryset:
        keywords = json.loads(q.keywords)
        for kw in keywords:
            keyword = normalize_text(kw['text'])
            relevance = float(kw['relevance'])
            if keyword not in kws:
                kws[keyword] = relevance
            else:
                kws[keyword] += relevance
    kws = scale(kws, 20)

    json_string = []
    for kw in kws:
        json_string.append({'text': kw, 'weight': kws[kw]})
    return HttpResponse(json.dumps(json_string))

def normalize_text(text):
    t = text.lower()
    t = t.strip()
    if t.endswith('.'):
        t = t[:-1]
    return t

def scale(kws, scale):
    max_relevance = 0
    for rel in kws.values():
        if rel > max_relevance:
            max_relevance = rel

    if max_relevance != 0:
        scale_factor = scale / max_relevance
    else:
        scale_factor = 1

    for kw in kws:
        rel = kws[kw]
        kws[kw] = rel * scale_factor
    return kws

def tally(request):
    NUMPOINTS = 500
    def classify(point):
        if point.score is None:
            return point.sentiment
        elif point.score < -0.1:
            return "negative"
        elif point.score > 0.1:
            return "positive"
        else:
            return "neutral"

    if not 'query' in request.GET:
        points = models.DataPoint.objects.order_by('tweet_id').reverse()[:NUMPOINTS]
    else:
        filtered = models.DataPoint.objects.filter(query__exact=unquote(request.GET['query']))
        points = filtered.order_by('tweet_id').reverse()[:NUMPOINTS]

    totals = {}
    totals["geotagged"] = 0
    for point in points:
        cl = classify(point)
        if cl in totals:
            totals[cl] += 1
        else:
            totals[cl]  = 1
        if point.geo != "": totals["geotagged"] += 1
    return HttpResponse(json.dumps(totals))
